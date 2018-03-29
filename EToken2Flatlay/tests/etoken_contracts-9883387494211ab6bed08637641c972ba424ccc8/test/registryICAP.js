contract('RegistryICAP', {reset_state: true}, function(accounts) {
  var testHelper = require('../truffle-helpers/testHelper.js');
  var bytes32 = testHelper.bytes32;
  var sha3 = testHelper.sha3;

  var icap;
  var institutionAddress = accounts[5];
  var ASSET = "EXP";
  var INSTITUTION = "XREG";
  var SYMBOL = "EXMPL";

  before('setup', function(done) {
    icap = RegistryICAP.deployed();
    icap.registerAsset(ASSET, SYMBOL).then(function() {
      return icap.registerInstitution(INSTITUTION, institutionAddress);
    }).then(function() {
      return icap.registerInstitutionAsset(ASSET, INSTITUTION, institutionAddress, {from: institutionAddress});
    }).then(function() {
      done();
    });
  });

  it('should parse valid ICAP', function(done) {
    var _icap = "XE33EXPXREG123456789";
    icap.parse(_icap).then(function(result) {
      assert.equal(result.length, 3);
      assert.equal(result[0], institutionAddress);
      assert.equal(result[1], bytes32(SYMBOL));
      assert.isTrue(result[2]);
    }).then(done).catch(done);
  });
  it('should parse valid ICAP with invalid checksum', function(done) {
    var _icap = "XE32EXPXREG123456789";
    icap.parse(_icap).then(function(result) {
      assert.equal(result.length, 3);
      assert.equal(result[0], institutionAddress);
      assert.equal(result[1], bytes32(SYMBOL));
      assert.isFalse(result[2]);
    }).then(done).catch(done);
  });
  it('should parse valid ICAP without numbers', function(done) {
    var _icap = "XE21EXPXREGQQQQQQQQQ";
    icap.parse(_icap).then(function(result) {
      assert.equal(result.length, 3);
      assert.equal(result[0], institutionAddress);
      assert.equal(result[1], bytes32(SYMBOL));
      assert.isTrue(result[2]);
    }).then(done).catch(done);
  });
  it('should not parse valid ICAP of unknown asset', function(done) {
    var _icap = "XE07EXMXREG123456789";
    icap.parse(_icap).then(function(result) {
      assert.equal(result.length, 3);
      assert.equal(web3.toDecimal(result[0]), 0);
      assert.equal(web3.toDecimal(result[1]), 0);
      assert.isFalse(result[2]);
    }).then(done).catch(done);
  });
  it('should not parse ICAP longer than 20 chars', function(done) {
    var _icap = "XE21EXPXREGQQQQQQQQQ0";
    icap.parse(_icap).then(function(result) {
      assert.equal(result.length, 3);
      assert.equal(web3.toDecimal(result[0]), 0);
      assert.equal(web3.toDecimal(result[1]), 0);
      assert.isFalse(result[2]);
    }).then(done).catch(done);
  });
  it('should not parse valid ICAP of unknown institution', function(done) {
    var _icap = "XE85EXPXREH123456789";
    icap.parse(_icap).then(function(result) {
      assert.equal(result.length, 3);
      assert.equal(web3.toDecimal(result[0]), 0);
      assert.equal(result[1], bytes32(SYMBOL));
      assert.isFalse(result[2]);
    }).then(done).catch(done);
  });
  it('should not update institution by non institution owner', function(done) {
    var _icap = "XE33EXPXREG123456789";
    var newAddress = accounts[1];
    icap.updateInstitutionAsset.call(ASSET, INSTITUTION, newAddress).then(function(result) {
      assert.isFalse(result);
    }).then(done).catch(done);
  });
  it('should not remove institution by non institution owner', function(done) {
    var _icap = "XE33EXPXREG123456789";
    icap.removeInstitutionAsset.call(ASSET, INSTITUTION).then(function(result) {
      assert.isFalse(result);
    }).then(done).catch(done);
  });
  it('should update institution by institution owner', function(done) {
    var _icap = "XE33EXPXREG123456789";
    var newAddress = accounts[1];
    icap.updateInstitutionAsset(ASSET, INSTITUTION, newAddress, {from: institutionAddress}).then(function() {
      return icap.parse(_icap);
    }).then(function(result) {
      assert.equal(result.length, 3);
      assert.equal(result[0], newAddress);
      assert.equal(result[1], bytes32(SYMBOL));
      assert.isTrue(result[2]);
    }).then(done).catch(done);
  });
  it('should remove institution by institution owner', function(done) {
    var _icap = "XE33EXPXREG123456789";
    icap.removeInstitutionAsset(ASSET, INSTITUTION, {from: institutionAddress}).then(function() {
      return icap.parse(_icap);
    }).then(function(result) {
      assert.equal(result.length, 3);
      assert.equal(web3.toDecimal(result[0]), 0);
      assert.equal(result[1], bytes32(SYMBOL));
      assert.isFalse(result[2]);
    }).then(done).catch(done);
  });
});