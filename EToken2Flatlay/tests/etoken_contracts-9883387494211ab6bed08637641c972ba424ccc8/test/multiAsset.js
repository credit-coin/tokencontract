contract('MultiAsset', {reset_state: true}, function(accounts) {
  var eventsHelper = require('../truffle-helpers/eventsHelper.js');
  var testHelper = require('../truffle-helpers/testHelper.js');
  var bytes32 = testHelper.bytes32;
  var sha3 = testHelper.sha3;

  var UINT_256_MINUS_3 = '1.15792089237316195423570985008687907853269984665640564039457584007913129639933e+77';
  var UINT_256_MINUS_2 = '1.15792089237316195423570985008687907853269984665640564039457584007913129639934e+77';
  var UINT_256_MINUS_1 = '1.15792089237316195423570985008687907853269984665640564039457584007913129639935e+77';
  var UINT_256 = '1.15792089237316195423570985008687907853269984665640564039457584007913129639936e+77';
  var UINT_255_MINUS_1 = '5.7896044618658097711785492504343953926634992332820282019728792003956564819967e+76';
  var UINT_255 = '5.7896044618658097711785492504343953926634992332820282019728792003956564819968e+76';

  var BYTES_32 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
  var BITS_257 = '0x10000000000000000000000000000000000000000000000000000000000000000';
  var ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';

  var SYMBOL = bytes32(0);
  var NAME = 'Test Name';
  var DESCRIPTION = 'Test Description';
  var VALUE = 1001;
  var BASE_UNIT = 2;
  var IS_REISSUABLE = false;

  var Features = { Issue: 0, TransferWithReference: 1, Revoke: 2, ChangeOwnership: 3, Allowances: 4, ICAP: 5 };

  var multiAsset;
  var multiAssetAbi;
  var userContract;
  var userContractAbi;
  var userContractPure;
  var eventsHistory;

  before('setup', function(done) {
    multiAsset = MultiAsset.deployed();
    multiAssetAbi = web3.eth.contract(multiAsset.abi).at(0x0);
    userContract = UserContract.deployed();
    userContractPure = UserContract.deployed();
    userContractAbi = web3.eth.contract(userContract.abi).at(0x0);
    eventsHistory = EventsHistory.deployed();
    var multiAssetEmitter = MultiAssetEmitter.deployed();
    var multiAssetEmitterAbi = web3.eth.contract(multiAssetEmitter.abi).at(0x0);
    var stackDepthLib = StackDepthLib.deployed();
    var fakeArgs = [0,0,0,0,0,0,0,0,0,0,0];
    userContract.init(multiAsset.address).then(function() {
      userContract = MultiAsset.at(userContract.address);
      return multiAsset.setupEventsHistory(eventsHistory.address);
    }).then(function() {
      return multiAsset.setupStackDepthLib(stackDepthLib.address);
    }).then(function() {
      return eventsHistory.addVersion(multiAsset.address, "Origin", "Initial version.");
    }).then(function() {
      return eventsHistory.addEmitter(multiAssetEmitterAbi.emitTransfer.getData.apply(this, fakeArgs).slice(0, 10), multiAssetEmitter.address);
    }).then(function() {
      return eventsHistory.addEmitter(multiAssetEmitterAbi.emitIssue.getData.apply(this, fakeArgs).slice(0, 10), multiAssetEmitter.address);
    }).then(function() {
      return eventsHistory.addEmitter(multiAssetEmitterAbi.emitRevoke.getData.apply(this, fakeArgs).slice(0, 10), multiAssetEmitter.address);
    }).then(function() {
      return eventsHistory.addEmitter(multiAssetEmitterAbi.emitOwnershipChange.getData.apply(this, fakeArgs).slice(0, 10), multiAssetEmitter.address);
    }).then(function() {
      return eventsHistory.addEmitter(multiAssetEmitterAbi.emitApprove.getData.apply(this, fakeArgs).slice(0, 10), multiAssetEmitter.address);
    }).then(function() {
      return eventsHistory.addEmitter(multiAssetEmitterAbi.emitRecovery.getData.apply(this, fakeArgs).slice(0, 10), multiAssetEmitter.address);
    }).then(function() {
      return eventsHistory.addEmitter(multiAssetEmitterAbi.emitTransferToICAP.getData.apply(this, fakeArgs).slice(0, 10), multiAssetEmitter.address);
    }).then(function() {
      return eventsHistory.addEmitter(multiAssetEmitterAbi.emitError.getData.apply(this, fakeArgs).slice(0, 10), multiAssetEmitter.address);
    }).then(function() {
      eventsHistory = MultiAssetEmitter.at(eventsHistory.address);
      done();
    }).catch(done);
  });

  it('should not be possible to issue asset with existing symbol', function(done) {
    var symbol = bytes32(0);
    var value = 1001;
    var value2 = 3021;
    var name = 'Test Name';
    var name2 = '2Test Name2';
    var description = 'Test Description';
    var description2 = '2Test Description2';
    var baseUnit = 2;
    var baseUnit2 = 4;
    var isReissuable = false;
    var isReissuable2 = true;
    var watcher;
    multiAsset.issueAsset(symbol, value, name, description, baseUnit, isReissuable).then(function() {
      eventsHelper.setupEvents(eventsHistory);
      watcher = eventsHistory.Issue();
      return multiAsset.issueAsset(symbol, value2, name2, description2, baseUnit2, isReissuable2);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return multiAsset.name.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), name);
      return multiAsset.totalSupply.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return multiAsset.description.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), description);
      return multiAsset.baseUnit.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), baseUnit);
      return multiAsset.isReissuable.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), isReissuable);
    }).then(done).catch(done);
  });
  it('should be possible to issue asset with 1 bit 0 symbol', function(done) {
    var symbol = bytes32(0);
    multiAsset.issueAsset(symbol, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.name.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), NAME);
    }).then(done).catch(done);
  });
  it('should be possible to issue asset with 1 bit 1 symbol', function(done) {
    var symbol = bytes32(1);
    multiAsset.issueAsset(symbol, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.name.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), NAME);
    }).then(done).catch(done);
  });
  it('should be possible to issue asset with 32 bytes symbol', function(done) {
    var symbol = BYTES_32;
    multiAsset.issueAsset(symbol, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.name.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), NAME);
    }).then(done).catch(done);
  });
  it.skip('should not be possible to issue asset with 257 bits symbol', function(done) {
    var symbol = BITS_257;
    multiAsset.issueAsset(symbol, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.assets.call(1);
    }).then(function() {
      done('Exception did not happen, asset created.');
    }, function() {
      done();
    });
  });
  it('should not be possible to issue fixed asset with 0 value', function(done) {
    var value = 0;
    var isReissuable = false;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.name.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), '');
    }).then(done).catch(done);
  });
  it('should be possible to issue fixed asset with 1 value', function(done) {
    var value = 1;
    var isReissuable = false;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to issue fixed asset with (2**256 - 1) value', function(done) {
    var value = UINT_256_MINUS_1;
    var isReissuable = false;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should not be possible to issue fixed asset with 2**256 value', function(done) {
    var value = UINT_256;
    var isReissuable = false;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.name.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), '');
    }).then(done).catch(done);
  });
  it('should be possible to issue reissuable asset with 0 value', function(done) {
    var value = 0;
    var isReissuable = true;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.name.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), NAME);
    }).then(done).catch(done);
  });
  it('should be possible to issue reissuable asset with 1 value', function(done) {
    var value = 1;
    var isReissuable = true;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to issue reissuable asset with (2**256 - 1) value', function(done) {
    var value = UINT_256_MINUS_1;
    var isReissuable = true;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should not be possible to issue reissuable asset with 2**256 value', function(done) {
    var value = UINT_256;
    var isReissuable = true;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.name.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), '');
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should be possible to issue asset with base unit 1', function(done) {
    var baseUnit = 1;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, baseUnit, IS_REISSUABLE).then(function() {
      return multiAsset.baseUnit.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 1);
    }).then(done).catch(done);
  });
  it('should be possible to issue asset with base unit 255', function(done) {
    var baseUnit = 255;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, baseUnit, IS_REISSUABLE).then(function() {
      return multiAsset.baseUnit.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 255);
    }).then(done).catch(done);
  });
  it.skip('should not be possible to issue asset with base unit 256', function(done) {
    var baseUnit = 256;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, baseUnit, IS_REISSUABLE).then(function() {
      return multiAsset.name.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), '');
    }).then(done).catch(done);
  });
  it('should be possible to issue asset', function(done) {
    var symbol = bytes32(0);
    var value = 1001;
    var name = 'Test Name';
    var description = 'Test Description';
    var baseUnit = 2;
    var isReissuable = false;
    var watcher = eventsHistory.Issue();
    eventsHelper.setupEvents(eventsHistory);
    multiAsset.issueAsset(symbol, value, name, description, baseUnit, isReissuable).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 1);
      assert.equal(events[0].args.symbol.valueOf(), symbol);
      assert.equal(events[0].args.value.valueOf(), value);
      assert.equal(events[0].args.by.valueOf(), accounts[0]);
      return multiAsset.name.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), name);
      return multiAsset.totalSupply.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return multiAsset.description.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), description);
      return multiAsset.baseUnit.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), baseUnit);
      return multiAsset.isReissuable.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), isReissuable);
    }).then(done).catch(done);
  });
  it('should be possible to issue multiple assets', function(done) {
    var symbol = bytes32(0);
    var symbol2 = bytes32(1);
    var owner = accounts[0];
    var owner2 = accounts[1];
    var value = 1001;
    var value2 = 3021;
    var name = 'Test Name';
    var name2 = '2Test Name2';
    var description = 'Test Description';
    var description2 = '2Test Description2';
    var baseUnit = 2;
    var baseUnit2 = 4;
    var isReissuable = false;
    var isReissuable2 = true;
    multiAsset.issueAsset(symbol, value, name, description, baseUnit, isReissuable).then(function() {
      return multiAsset.issueAsset(symbol2, value2, name2, description2, baseUnit2, isReissuable2, {from: owner2});
    }).then(function() {
      return multiAsset.name.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), name);
      return multiAsset.name.call(symbol2);
    }).then(function(result) {
      assert.equal(result.valueOf(), name2);
      return multiAsset.totalSupply.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return multiAsset.totalSupply.call(symbol2);
    }).then(function(result) {
      assert.equal(result.valueOf(), value2);
      return multiAsset.description.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), description);
      return multiAsset.description.call(symbol2);
    }).then(function(result) {
      assert.equal(result.valueOf(), description2);
      return multiAsset.baseUnit.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), baseUnit);
      return multiAsset.baseUnit.call(symbol2);
    }).then(function(result) {
      assert.equal(result.valueOf(), baseUnit2);
      return multiAsset.isReissuable.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), isReissuable);
      return multiAsset.isReissuable.call(symbol2);
    }).then(function(result) {
      assert.equal(result.valueOf(), isReissuable2);
      return multiAsset.owner.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), owner);
      return multiAsset.owner.call(symbol2);
    }).then(function(result) {
      assert.equal(result.valueOf(), owner2);
    }).then(done).catch(done);
  });
  it('should be possible to get asset name', function(done) {
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.name.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), NAME);
    }).then(done).catch(done);
  });
  it('should be possible to get asset description', function(done) {
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.description.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), DESCRIPTION);
    }).then(done).catch(done);
  });
  it('should be possible to get asset base unit', function(done) {
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.baseUnit.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), BASE_UNIT);
    }).then(done).catch(done);
  });
  it('should be possible to get asset reissuability', function(done) {
    var isReissuable = true;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.isReissuable.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), isReissuable);
    }).then(done).catch(done);
  });
  it('should be possible to get asset owner', function(done) {
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.owner.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), accounts[0]);
    }).then(done).catch(done);
  });
  it('should be possible to check if address is asset owner', function(done) {
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.isOwner.call(accounts[0], SYMBOL);
    }).then(function(result) {
      assert.isTrue(result.valueOf());
    }).then(done).catch(done);
  });
  it('should be possible to check if address is owner of non-existing asset', function(done) {
    multiAsset.isOwner.call(accounts[0], SYMBOL).then(function(result) {
      assert.isFalse(result.valueOf());
    }).then(done).catch(done);
  });
  it('should be possible to check if asset is created', function(done) {
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.isCreated.call(SYMBOL);
    }).then(function(result) {
      assert.isTrue(result.valueOf());
    }).then(done).catch(done);
  });
  it('should be possible to check if asset is created for non-existing asset', function(done) {
    multiAsset.isCreated.call(SYMBOL).then(function(result) {
      assert.isFalse(result.valueOf());
    }).then(done).catch(done);
  });
  it('should be possible to get asset total supply with single holder', function(done) {
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should be possible to get asset total supply with multiple holders', function(done) {
    var amount = 1001;
    var amount2 = 999;
    var holder2 = accounts[1];
    multiAsset.issueAsset(SYMBOL, amount + amount2, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(holder2, amount2, SYMBOL);
    }).then(function() {
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount + amount2);
    }).then(done).catch(done);
  });
  it('should be possible to get asset total supply with multiple holders holding 0 amount', function(done) {
    var holder = accounts[0];
    var holder2 = accounts[1];
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(holder2, VALUE, SYMBOL);
    }).then(function() {
      return multiAsset.transfer(holder, VALUE, SYMBOL, {from: holder2});
    }).then(function() {
      return multiAsset.revokeAsset(SYMBOL, VALUE);
    }).then(function() {
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should be possible to get asset total supply with multiple holders holding (2**256 - 1) amount', function(done) {
    var value = UINT_256_MINUS_1;
    var holder = accounts[0];
    var holder2 = accounts[1];
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(holder2, 10, SYMBOL);
    }).then(function() {
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to get asset balance for holder', function(done) {
    var owner = accounts[0];
    var symbol2 = bytes32(10);
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.issueAsset(symbol2, VALUE-10, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should be possible to get asset balance for non owner', function(done) {
    var owner = accounts[0];
    var nonOwner = accounts[1];
    var amount = 100;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(nonOwner, amount, SYMBOL);
    }).then(function() {
      return multiAsset.balanceOf.call(nonOwner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
    }).then(done).catch(done);
  });
  it('should be possible to get asset balance for missing holder', function(done) {
    var nonOwner = accounts[1];
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.balanceOf.call(nonOwner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should be possible to get missing asset balance for holder', function(done) {
    var nonAsset = bytes32(33);
    var owner = accounts[0];
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.balanceOf.call(owner, nonAsset);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should be possible to get missing asset balance for missing holder', function(done) {
    var nonAsset = bytes32(33);
    var nonOwner = accounts[1];
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.balanceOf.call(nonOwner, nonAsset);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should not be possible to get name of missing asset', function(done) {
    var nonAsset = bytes32(33);
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.name.call(nonAsset);
    }).then(function(result) {
      assert.equal(result.valueOf(), '');
    }).then(done).catch(done);
  });
  it('should not be possible to get description of missing asset', function(done) {
    var nonAsset = bytes32(33);
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.description.call(nonAsset);
    }).then(function(result) {
      assert.equal(result.valueOf(), '');
    }).then(done).catch(done);
  });
  it('should not be possible to get base unit of missing asset', function(done) {
    var nonAsset = bytes32(33);
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.baseUnit.call(nonAsset);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should not be possible to get reissuability of missing asset', function(done) {
    var nonAsset = bytes32(33);
    var isReissuable = true;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.isReissuable.call(nonAsset);
    }).then(function(result) {
      assert.isFalse(result);
    }).then(done).catch(done);
  });
  it('should not be possible to get owner of missing asset', function(done) {
    var nonAsset = bytes32(33);
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.owner.call(nonAsset);
    }).then(function(result) {
      assert.equal(result.valueOf(), ADDRESS_ZERO);
    }).then(done).catch(done);
  });
  it('should not be possible to get total supply of missing asset', function(done) {
    multiAsset.totalSupply.call(SYMBOL).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should not be possible to change ownership by non-owner', function(done) {
    var owner = accounts[0];
    var nonOwner = accounts[1];
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.changeOwnership(SYMBOL, nonOwner, {from: nonOwner});
    }).then(function() {
      return multiAsset.owner.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), owner);
    }).then(done).catch(done);
  });
  it('should not be possible to change ownership to the same owner', function(done) {
    var owner = accounts[0];
    var watcher = eventsHistory.OwnershipChange();
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      eventsHelper.setupEvents(eventsHistory);
      return multiAsset.changeOwnership(SYMBOL, owner);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher)
    }).then(function(events) {
      assert.equal(events.length, 0);
      return multiAsset.owner.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), owner);
    }).then(done).catch(done);
  });
  it('should not be possible to change ownership of missing asset', function(done) {
    var owner = accounts[0];
    var nonOwner = accounts[1];
    var nonAsset = bytes32(33);
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.changeOwnership(nonAsset, nonOwner);
    }).then(function() {
      return multiAsset.owner.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), owner);
      return multiAsset.owner.call(nonAsset);
    }).then(function(result) {
      assert.equal(result.valueOf(), ADDRESS_ZERO);
    }).then(done).catch(done);
  });
  it('should be possible to change ownership of asset', function(done) {
    var owner = accounts[0];
    var newOwner = accounts[1];
    var watcher = eventsHistory.OwnershipChange();
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      eventsHelper.setupEvents(eventsHistory);
      return multiAsset.changeOwnership(SYMBOL, newOwner);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 1);
      assert.equal(events[0].args.from.valueOf(), owner);
      assert.equal(events[0].args.to.valueOf(), newOwner);
      assert.equal(events[0].args.symbol.valueOf(), SYMBOL);
      return multiAsset.owner.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), newOwner);
    }).then(done).catch(done);
  });
  it('should be possible to reissue after ownership change', function(done) {
    var owner = accounts[0];
    var newOwner = accounts[1];
    var isReissuable = true;
    var amount = 100;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.changeOwnership(SYMBOL, newOwner);
    }).then(function() {
      return multiAsset.reissueAsset(SYMBOL, amount, {from: newOwner});
    }).then(function() {
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE + amount);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.balanceOf.call(newOwner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
    }).then(done).catch(done);
  });
  it('should be possible to revoke after ownership change to missing account', function(done) {
    var owner = accounts[0];
    var newOwner = accounts[1];
    var amount = 100;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.changeOwnership(SYMBOL, newOwner);
    }).then(function() {
      return multiAsset.transfer(newOwner, amount, SYMBOL);
    }).then(function() {
      return multiAsset.revokeAsset(SYMBOL, amount, {from: newOwner});
    }).then(function() {
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - amount);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - amount);
      return multiAsset.balanceOf.call(newOwner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should be possible to revoke after ownership change to existing account', function(done) {
    var owner = accounts[0];
    var newOwner = accounts[1];
    var amount = 100;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(newOwner, amount, SYMBOL);
    }).then(function() {
      return multiAsset.changeOwnership(SYMBOL, newOwner);
    }).then(function() {
      return multiAsset.revokeAsset(SYMBOL, amount, {from: newOwner});
    }).then(function() {
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - amount);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - amount);
      return multiAsset.balanceOf.call(newOwner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should keep ownership change separated between assets', function(done) {
    var owner = accounts[0];
    var newOwner = accounts[1];
    var symbol2 = bytes32(10);
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.issueAsset(symbol2, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE);
    }).then(function() {
      return multiAsset.changeOwnership(SYMBOL, newOwner);
    }).then(function() {
      return multiAsset.owner.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), newOwner);
      return multiAsset.owner.call(symbol2);
    }).then(function(result) {
      assert.equal(result.valueOf(), owner);
    }).then(done).catch(done);
  });
  it('should not be possible to transfer missing asset', function(done) {
    var owner = accounts[0];
    var nonOwner = accounts[1];
    var amount = 100;
    var nonAsset = bytes32(33);
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(nonOwner, amount, nonAsset);
    }).then(function() {
      return multiAsset.balanceOf.call(nonOwner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.balanceOf.call(nonOwner, nonAsset);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.balanceOf.call(owner, nonAsset);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should not be possible to transfer amount 1 with balance 0', function(done) {
    var owner = accounts[0];
    var nonOwner = accounts[1];
    var amount = 1;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(nonOwner, VALUE, SYMBOL);
    }).then(function() {
      return multiAsset.transfer(nonOwner, amount, SYMBOL);
    }).then(function() {
      return multiAsset.balanceOf.call(nonOwner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should not be possible to transfer amount 2 with balance 1', function(done) {
    var owner = accounts[0];
    var nonOwner = accounts[1];
    var value = 1;
    var amount = 2;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(nonOwner, amount, SYMBOL);
    }).then(function() {
      return multiAsset.balanceOf.call(nonOwner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should not be possible to transfer amount (2**256 - 1) with balance (2**256 - 2)', function(done) {
    var owner = accounts[0];
    var nonOwner = accounts[1];
    var value = UINT_256_MINUS_2;
    var amount = UINT_256_MINUS_1;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(nonOwner, amount, SYMBOL);
    }).then(function() {
      return multiAsset.balanceOf.call(nonOwner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should not be possible to transfer amount 0', function(done) {
    var owner = accounts[0];
    var nonOwner = accounts[1];
    var amount = 0;
    var watcher = eventsHistory.Transfer();
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      eventsHelper.setupEvents(eventsHistory);
      return multiAsset.transfer(nonOwner, amount, SYMBOL);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return multiAsset.balanceOf.call(nonOwner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should not be possible to transfer to oneself', function(done) {
    var owner = accounts[0];
    var amount = 100;
    var watcher = eventsHistory.Transfer();
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      eventsHelper.setupEvents(eventsHistory);
      return multiAsset.transfer(owner, amount, SYMBOL);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should not be possible to transfer amount (2**256 - 1) to holder with 1 balance', function(done) {
    // Situation is impossible due to impossibility to issue more than (2**256 - 1) tokens for the asset.
    done();
  });
  it('should not be possible to transfer amount 1 to holder with (2**256 - 1) balance', function(done) {
    // Situation is impossible due to impossibility to issue more than (2**256 - 1) tokens for the asset.
    done();
  });
  it('should not be possible to transfer amount 2**255 to holder with 2**255 balance', function(done) {
    // Situation is impossible due to impossibility to issue more than (2**256 - 1) tokens for the asset.
    done();
  });
  it('should be possible to transfer amount 2**255 to holder with (2**255 - 1) balance', function(done) {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var value = UINT_256_MINUS_1;
    var amount = UINT_255;
    var balance2 = UINT_255_MINUS_1;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(holder2, balance2, SYMBOL);
    }).then(function() {
      return multiAsset.transfer(holder2, amount, SYMBOL);
    }).then(function() {
      return multiAsset.balanceOf.call(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should be possible to transfer amount (2**255 - 1) to holder with 2**255 balance', function(done) {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var value = UINT_256_MINUS_1;
    var amount = UINT_255_MINUS_1;
    var balance2 = UINT_255;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(holder2, balance2, SYMBOL);
    }).then(function() {
      return multiAsset.transfer(holder2, amount, SYMBOL);
    }).then(function() {
      return multiAsset.balanceOf.call(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should be possible to transfer amount (2**256 - 2) to holder with 1 balance', function(done) {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var value = UINT_256_MINUS_1;
    var amount = UINT_256_MINUS_2;
    var balance2 = 1;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(holder2, balance2, SYMBOL);
    }).then(function() {
      return multiAsset.transfer(holder2, amount, SYMBOL);
    }).then(function() {
      return multiAsset.balanceOf.call(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should be possible to transfer amount 1 to holder with (2**256 - 2) balance', function(done) {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var value = UINT_256_MINUS_1;
    var amount = 1;
    var balance2 = UINT_256_MINUS_2;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(holder2, balance2, SYMBOL);
    }).then(function() {
      return multiAsset.transfer(holder2, amount, SYMBOL);
    }).then(function() {
      return multiAsset.balanceOf.call(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should be possible to transfer amount 1 to existing holder with 0 balance', function(done) {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var amount = 1;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(holder2, VALUE, SYMBOL);
    }).then(function() {
      return multiAsset.transfer(holder, amount, SYMBOL, {from: holder2});
    }).then(function() {
      return multiAsset.balanceOf.call(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - amount);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
    }).then(done).catch(done);
  });
  it('should be possible to transfer amount 1 to missing holder', function(done) {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var amount = 1;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(holder2, amount, SYMBOL);
    }).then(function() {
      return multiAsset.balanceOf.call(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - amount);
    }).then(done).catch(done);
  });
  it('should be possible to transfer amount 1 to holder with non-zero balance', function(done) {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var balance2 = 100;
    var amount = 1;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(holder2, balance2, SYMBOL);
    }).then(function() {
      return multiAsset.transfer(holder2, amount, SYMBOL);
    }).then(function() {
      return multiAsset.balanceOf.call(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), balance2 + amount);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - balance2 - amount);
    }).then(done).catch(done);
  });
  it('should be possible to transfer amount (2**256 - 1) to existing holder with 0 balance', function(done) {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var amount = UINT_256_MINUS_1;
    multiAsset.issueAsset(SYMBOL, amount, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(holder2, amount, SYMBOL);
    }).then(function() {
      return multiAsset.transfer(holder, amount, SYMBOL, {from: holder2});
    }).then(function() {
      return multiAsset.balanceOf.call(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
    }).then(done).catch(done);
  });
  it('should be possible to transfer amount (2**256 - 1) to missing holder', function(done) {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var amount = UINT_256_MINUS_1;
    multiAsset.issueAsset(SYMBOL, amount, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(holder2, amount, SYMBOL);
    }).then(function() {
      return multiAsset.balanceOf.call(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should checkSigned on transfer', function(done) {
    multiAsset.transfer(accounts[0], 10, SYMBOL).then(function() {
      return multiAsset.signChecks.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), 1);
      return multiAsset.lastOperation.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), sha3(multiAssetAbi.transfer.getData(accounts[0], 10, SYMBOL), bytes32(1)));
    }).then(done).catch(done);
  });
  it('should checkSigned on transfer with reference', function(done) {
    multiAsset.transferWithReference(accounts[0], 10, SYMBOL, "ref").then(function() {
      return multiAsset.signChecks.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), 1);
      return multiAsset.lastOperation.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), sha3(multiAssetAbi.transferWithReference.getData(accounts[0], 10, SYMBOL, "ref"), bytes32(1)));
    }).then(done).catch(done);
  });
  it('should keep transfers separated between assets', function(done) {
    var symbol = bytes32(0);
    var symbol2 = bytes32(1);
    var value = 500;
    var value2 = 1000;
    var holder = accounts[0];
    var holder2 = accounts[1];
    var amount = 100;
    var amount2 = 33;
    var watcher;
    multiAsset.issueAsset(symbol, value, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.issueAsset(symbol2, value2, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE);
    }).then(function() {
      eventsHelper.setupEvents(eventsHistory);
      watcher = eventsHistory.Transfer();
      return multiAsset.transfer(holder2, amount, symbol);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 1);
      assert.equal(events[0].args.from.valueOf(), holder);
      assert.equal(events[0].args.to.valueOf(), holder2);
      assert.equal(events[0].args.symbol.valueOf(), symbol);
      assert.equal(events[0].args.value.valueOf(), amount);
      assert.equal(events[0].args.reference.valueOf(), "");
      eventsHelper.setupEvents(eventsHistory);
      watcher = eventsHistory.Transfer();
      return multiAsset.transfer(holder2, amount2, symbol2);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 1);
      assert.equal(events[0].args.from.valueOf(), holder);
      assert.equal(events[0].args.to.valueOf(), holder2);
      assert.equal(events[0].args.symbol.valueOf(), symbol2);
      assert.equal(events[0].args.value.valueOf(), amount2);
      assert.equal(events[0].args.reference.valueOf(), "");
      return multiAsset.balanceOf.call(holder, symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), value - amount);
      return multiAsset.balanceOf.call(holder2, symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
      return multiAsset.balanceOf.call(holder, symbol2);
    }).then(function(result) {
      assert.equal(result.valueOf(), value2 - amount2);
      return multiAsset.balanceOf.call(holder2, symbol2);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount2);
    }).then(done).catch(done);
  });
  it('should be possible to do transfer with reference', function(done) {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var reference = "Invoice#AS001";
    var watcher;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      eventsHelper.setupEvents(eventsHistory);
      watcher = eventsHistory.Transfer();
      return multiAsset.transferWithReference(holder2, VALUE, SYMBOL, reference);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 1);
      assert.equal(events[0].args.from.valueOf(), holder);
      assert.equal(events[0].args.to.valueOf(), holder2);
      assert.equal(events[0].args.symbol.valueOf(), SYMBOL);
      assert.equal(events[0].args.value.valueOf(), VALUE);
      assert.equal(events[0].args.reference.valueOf(), reference);
      return multiAsset.balanceOf.call(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should not be possible to reissue asset by non-owner', function(done) {
    var owner = accounts[0];
    var nonOwner = accounts[1];
    var isReissuable = true;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.reissueAsset(SYMBOL, 100, {from: nonOwner});
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.balanceOf.call(nonOwner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should not be possible to reissue fixed asset', function(done) {
    var owner = accounts[0];
    var isReissuable = false;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.reissueAsset(SYMBOL, 100);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should not be possible to reissue 0 of reissuable asset', function(done) {
    var owner = accounts[0];
    var isReissuable = true;
    var amount = 0;
    var watcher;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      eventsHelper.setupEvents(eventsHistory);
      watcher = eventsHistory.Issue();
      return multiAsset.reissueAsset(SYMBOL, amount);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should not be possible to reissue missing asset', function(done) {
    var owner = accounts[0];
    var isReissuable = true;
    var nonAsset = bytes32(33);
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.reissueAsset(nonAsset, 100);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.balanceOf.call(owner, nonAsset);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.totalSupply.call(nonAsset);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should not be possible to reissue 1 with total supply (2**256 - 1)', function(done) {
    var owner = accounts[0];
    var value = UINT_256_MINUS_1;
    var isReissuable = true;
    var amount = 1;
    var watcher;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      eventsHelper.setupEvents(eventsHistory);
      watcher = eventsHistory.Issue();
      return multiAsset.reissueAsset(SYMBOL, amount);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should not be possible to reissue (2**256 - 1) with total supply 1', function(done) {
    var owner = accounts[0];
    var value = 1;
    var isReissuable = true;
    var amount = UINT_256_MINUS_1;
    var watcher;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      eventsHelper.setupEvents(eventsHistory);
      watcher = eventsHistory.Issue();
      return multiAsset.reissueAsset(SYMBOL, amount);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to reissue 1 with total supply (2**256 - 2)', function(done) {
    var owner = accounts[0];
    var value = UINT_256_MINUS_2;
    var isReissuable = true;
    var amount = 1;
    var resultValue = UINT_256_MINUS_1;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.reissueAsset(SYMBOL, amount);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    }).then(done).catch(done);
  });
  it('should be possible to reissue 1 with total supply 0', function(done) {
    var owner = accounts[0];
    var value = 0;
    var isReissuable = true;
    var amount = 1;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.reissueAsset(SYMBOL, amount);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value + amount);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value + amount);
    }).then(done).catch(done);
  });
  it('should be possible to reissue (2**256 - 1) with total supply 0', function(done) {
    var owner = accounts[0];
    var value = 0;
    var isReissuable = true;
    var amount = UINT_256_MINUS_1;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.reissueAsset(SYMBOL, amount);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
    }).then(done).catch(done);
  });
  it('should be possible to reissue (2**256 - 2) with total supply 1', function(done) {
    var owner = accounts[0];
    var value = 1;
    var isReissuable = true;
    var amount = UINT_256_MINUS_2;
    var resultValue = UINT_256_MINUS_1;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.reissueAsset(SYMBOL, amount);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    }).then(done).catch(done);
  });
  it('should be possible to reissue (2**255 - 1) with total supply 2**255', function(done) {
    var owner = accounts[0];
    var value = UINT_255;
    var isReissuable = true;
    var amount = UINT_255_MINUS_1;
    var resultValue = UINT_256_MINUS_1;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.reissueAsset(SYMBOL, amount);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    }).then(done).catch(done);
  });
  it('should be possible to reissue 2**255 with total supply (2**255 - 1)', function(done) {
    var owner = accounts[0];
    var value = UINT_255_MINUS_1;
    var isReissuable = true;
    var amount = UINT_255;
    var resultValue = UINT_256_MINUS_1;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.reissueAsset(SYMBOL, amount);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    }).then(done).catch(done);
  });
  it('should keep reissuance separated between assets', function(done) {
    var symbol = bytes32(0);
    var symbol2 = bytes32(1);
    var value = 500;
    var value2 = 1000;
    var holder = accounts[0];
    var amount = 100;
    var amount2 = 33;
    var isReissuable = true;
    multiAsset.issueAsset(symbol, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.issueAsset(symbol2, value2, NAME, DESCRIPTION, BASE_UNIT, isReissuable);
    }).then(function() {
      return multiAsset.reissueAsset(symbol, amount);
    }).then(function() {
      return multiAsset.reissueAsset(symbol2, amount2);
    }).then(function() {
      return multiAsset.balanceOf.call(holder, symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), value + amount);
      return multiAsset.totalSupply.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), value + amount);
      return multiAsset.balanceOf.call(holder, symbol2);
    }).then(function(result) {
      assert.equal(result.valueOf(), value2 + amount2);
      return multiAsset.totalSupply.call(symbol2);
    }).then(function(result) {
      assert.equal(result.valueOf(), value2 + amount2);
    }).then(done).catch(done);
  });
  it('should not be possible to revoke 1 from missing asset', function(done) {
    var owner = accounts[0];
    var amount = 1;
    var nonAsset = bytes32(33);
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.revokeAsset(nonAsset, amount);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.balanceOf.call(owner, nonAsset);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should not be possible to revoke 0 from fixed asset', function(done) {
    var owner = accounts[0];
    var amount = 0;
    var isReissuable = false;
    var watcher = eventsHistory.Revoke();
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      eventsHelper.setupEvents(eventsHistory);
      return multiAsset.revokeAsset(SYMBOL, amount);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should not be possible to revoke 0 from reissuable asset', function(done) {
    var owner = accounts[0];
    var amount = 0;
    var isReissuable = true;
    var watcher = eventsHistory.Revoke();
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      eventsHelper.setupEvents(eventsHistory);
      return multiAsset.revokeAsset(SYMBOL, amount);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should not be possible to revoke 1 with balance 0', function(done) {
    var owner = accounts[0];
    var value = 0;
    var amount = 1;
    var isReissuable = true;
    var watcher = eventsHistory.Revoke();
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      eventsHelper.setupEvents(eventsHistory);
      return multiAsset.revokeAsset(SYMBOL, amount);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should not be possible to revoke 2 with balance 1', function(done) {
    var owner = accounts[0];
    var value = 1;
    var amount = 2;
    var watcher = eventsHistory.Revoke();
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      eventsHelper.setupEvents(eventsHistory);
      return multiAsset.revokeAsset(SYMBOL, amount);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should not be possible to revoke (2**256 - 1) with balance (2**256 - 2)', function(done) {
    var owner = accounts[0];
    var value = UINT_256_MINUS_2;
    var amount = UINT_256_MINUS_1;
    var isReissuable = true;
    var watcher = eventsHistory.Revoke();
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      eventsHelper.setupEvents(eventsHistory);
      return multiAsset.revokeAsset(SYMBOL, amount);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should not be possible to revoke 2**255 with balance (2**255 - 1)', function(done) {
    var owner = accounts[0];
    var value = UINT_255_MINUS_1;
    var amount = UINT_255;
    var isReissuable = true;
    var watcher = eventsHistory.Revoke();
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      eventsHelper.setupEvents(eventsHistory);
      return multiAsset.revokeAsset(SYMBOL, amount);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should not be possible to revoke by non-owner', function(done) {
    var owner = accounts[0];
    var nonOwner = accounts[1];
    var balance = 100;
    var watcher = eventsHistory.Revoke();
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(nonOwner, balance, SYMBOL);
    }).then(function() {
      eventsHelper.setupEvents(eventsHistory);
      return multiAsset.revokeAsset(SYMBOL, 10, {from: nonOwner});
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - balance);
      return multiAsset.balanceOf.call(nonOwner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), balance);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should be possible to revoke 1 from fixed asset with 1 balance', function(done) {
    var owner = accounts[0];
    var value = 1;
    var amount = 1;
    var isReissuable = false;
    var watcher = eventsHistory.Revoke();
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      eventsHelper.setupEvents(eventsHistory);
      return multiAsset.revokeAsset(SYMBOL, amount);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 1);
      assert.equal(events[0].args.symbol.valueOf(), SYMBOL);
      assert.equal(events[0].args.value.valueOf(), amount);
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should be possible to revoke 1 from reissuable asset with 1 balance', function(done) {
    var owner = accounts[0];
    var value = 1;
    var amount = 1;
    var isReissuable = true;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.revokeAsset(SYMBOL, amount);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should be possible to revoke 2**255 with 2**255 balance', function(done) {
    var owner = accounts[0];
    var value = UINT_255;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.revokeAsset(SYMBOL, value);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should be possible to revoke (2**256 - 1) with (2**256 - 1) balance', function(done) {
    var owner = accounts[0];
    var value = UINT_256_MINUS_1;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.revokeAsset(SYMBOL, value);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should be possible to revoke 1 with 2 balance', function(done) {
    var owner = accounts[0];
    var value = 2;
    var amount = 1;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.revokeAsset(SYMBOL, amount);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value - amount);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value - amount);
    }).then(done).catch(done);
  });
  it('should be possible to revoke 2 with (2**256 - 1) balance', function(done) {
    var owner = accounts[0];
    var value = UINT_256_MINUS_1;
    var amount = 2;
    var resultValue = UINT_256_MINUS_3;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.revokeAsset(SYMBOL, amount);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    }).then(done).catch(done);
  });
  it('should keep revokes separated between assets', function(done) {
    var symbol = bytes32(0);
    var symbol2 = bytes32(1);
    var value = 500;
    var value2 = 1000;
    var holder = accounts[0];
    var amount = 100;
    var amount2 = 33;
    multiAsset.issueAsset(symbol, value, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.issueAsset(symbol2, value2, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE);
    }).then(function() {
      return multiAsset.revokeAsset(symbol, amount);
    }).then(function() {
      return multiAsset.revokeAsset(symbol2, amount2);
    }).then(function() {
      return multiAsset.balanceOf.call(holder, symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), value - amount);
      return multiAsset.totalSupply.call(symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), value - amount);
      return multiAsset.balanceOf.call(holder, symbol2);
    }).then(function(result) {
      assert.equal(result.valueOf(), value2 - amount2);
      return multiAsset.totalSupply.call(symbol2);
    }).then(function(result) {
      assert.equal(result.valueOf(), value2 - amount2);
    }).then(done).catch(done);
  });
  it('should be possible to reissue 1 after revoke 1 with total supply (2**256 - 1)', function(done) {
    var owner = accounts[0];
    var value = UINT_256_MINUS_1;
    var amount = 1;
    var isReissuable = true;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.revokeAsset(SYMBOL, amount);
    }).then(function() {
      return multiAsset.reissueAsset(SYMBOL, amount);
    }).then(function() {
      return multiAsset.balanceOf.call(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return multiAsset.totalSupply.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });

  it('should respect user contracts when issuing asset', function(done) {
    userContract.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.balanceOf.call(userContract.address, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should respect user contracts when reissuing asset', function(done) {
    userContract.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, true).then(function() {
      return userContract.reissueAsset(SYMBOL, VALUE);
    }).then(function() {
      return multiAsset.balanceOf.call(userContract.address, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE*2);
    }).then(done).catch(done);
  });
  it('should respect user contracts when revoking asset', function(done) {
    userContract.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, true).then(function() {
      return userContract.revokeAsset(SYMBOL, VALUE);
    }).then(function() {
      return multiAsset.balanceOf.call(userContract.address, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should respect user contracts when doing transfer', function(done) {
    userContract.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, true).then(function() {
      return userContract.transfer(accounts[1], VALUE, SYMBOL);
    }).then(function() {
      return multiAsset.balanceOf.call(userContract.address, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.balanceOf.call(accounts[1], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should respect user contracts when doing transfer with reference', function(done) {
    userContract.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, true).then(function() {
      return userContract.transferWithReference(accounts[1], VALUE, SYMBOL, "Ref");
    }).then(function() {
      return multiAsset.balanceOf.call(userContract.address, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.balanceOf.call(accounts[1], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should respect user contracts when doing transfer from', function(done) {
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, true, {from: accounts[1]}).then(function() {
      return multiAsset.approve(userContract.address, VALUE, SYMBOL, {from: accounts[1]});
    }).then(function() {
      return userContract.transferFrom(accounts[1], accounts[0], VALUE, SYMBOL);
    }).then(function() {
      return multiAsset.balanceOf.call(accounts[1], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.balanceOf.call(accounts[0], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should respect user contracts when doing transfer from with reference', function(done) {
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, true, {from: accounts[1]}).then(function() {
      return multiAsset.approve(userContract.address, VALUE, SYMBOL, {from: accounts[1]});
    }).then(function() {
      return userContract.transferFromWithReference(accounts[1], accounts[0], VALUE, SYMBOL, "Ref");
    }).then(function() {
      return multiAsset.balanceOf.call(accounts[1], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.balanceOf.call(accounts[0], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should respect user contracts when doing approve', function(done) {
    userContract.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, true).then(function() {
      return userContract.approve(accounts[0], VALUE, SYMBOL);
    }).then(function() {
      return multiAsset.transferFrom(userContract.address, accounts[1], VALUE-1, SYMBOL);
    }).then(function() {
      return multiAsset.balanceOf.call(userContract.address, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 1);
      return multiAsset.balanceOf.call(accounts[1], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE-1);
      return multiAsset.allowance.call(userContract.address, accounts[0], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 1);
    }).then(done).catch(done);
  });
  it('should respect user contracts when doing transfer to ICAP', function(done) {
    var icap = RegistryICAP.deployed();
    var _icap = "XE73TSTXREG123456789";
    userContract.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, true).then(function() {
      return multiAsset.setupRegistryICAP(icap.address);
    }).then(function() {
      return icap.registerAsset("TST", SYMBOL);
    }).then(function() {
      return icap.registerInstitution("XREG", accounts[2]);
    }).then(function() {
      return icap.registerInstitutionAsset("TST", "XREG", accounts[2], {from: accounts[2]});
    }).then(function() {
      return userContract.transferToICAP(_icap, VALUE);
    }).then(function() {
      return multiAsset.balanceOf.call(userContract.address, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.balanceOf.call(accounts[2], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should respect user contracts when doing transfer to ICAP with reference', function(done) {
    var icap = RegistryICAP.deployed();
    var _icap = "XE73TSTXREG123456789";
    userContract.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, true).then(function() {
      return multiAsset.setupRegistryICAP(icap.address);
    }).then(function() {
      return icap.registerAsset("TST", SYMBOL);
    }).then(function() {
      return icap.registerInstitution("XREG", accounts[2]);
    }).then(function() {
      return icap.registerInstitutionAsset("TST", "XREG", accounts[2], {from: accounts[2]});
    }).then(function() {
      return userContract.transferToICAPWithReference(_icap, VALUE, "Ref");
    }).then(function() {
      return multiAsset.balanceOf.call(userContract.address, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.balanceOf.call(accounts[2], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should respect user contracts when doing transfer from to ICAP', function(done) {
    var icap = RegistryICAP.deployed();
    var _icap = "XE73TSTXREG123456789";
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, true).then(function() {
      return multiAsset.setupRegistryICAP(icap.address);
    }).then(function() {
      return icap.registerAsset("TST", SYMBOL);
    }).then(function() {
      return icap.registerInstitution("XREG", accounts[2]);
    }).then(function() {
      return icap.registerInstitutionAsset("TST", "XREG", accounts[2], {from: accounts[2]});
    }).then(function() {
      return multiAsset.approve(userContract.address, VALUE, SYMBOL);
    }).then(function() {
      return userContract.transferFromToICAP(accounts[0], _icap, VALUE);
    }).then(function() {
      return multiAsset.balanceOf.call(accounts[0], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.balanceOf.call(accounts[2], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should respect user contracts when doing transfer from to ICAP with reference', function(done) {
    var icap = RegistryICAP.deployed();
    var _icap = "XE73TSTXREG123456789";
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, true).then(function() {
      return multiAsset.setupRegistryICAP(icap.address);
    }).then(function() {
      return icap.registerAsset("TST", SYMBOL);
    }).then(function() {
      return icap.registerInstitution("XREG", accounts[2]);
    }).then(function() {
      return icap.registerInstitutionAsset("TST", "XREG", accounts[2], {from: accounts[2]});
    }).then(function() {
      return multiAsset.approve(userContract.address, VALUE, SYMBOL);
    }).then(function() {
      return userContract.transferFromToICAPWithReference(accounts[0], _icap, VALUE, "Ref");
    }).then(function() {
      return multiAsset.balanceOf.call(accounts[0], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.balanceOf.call(accounts[2], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });

  it('should not allow proxy transfers from user contracts', function(done) {
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, true).then(function() {
      return userContract.proxyTransferWithReference(accounts[1], VALUE, SYMBOL, "");
    }).then(function() {
      return multiAsset.balanceOf.call(accounts[0], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.balanceOf.call(accounts[1], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should not allow proxy transfer froms from user contracts', function(done) {
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, true, {from: accounts[1]}).then(function() {
      return multiAsset.approve(accounts[0], VALUE, SYMBOL, {from: accounts[1]});
    }).then(function() {
      return userContract.proxyTransferFromWithReference(accounts[1], accounts[2], VALUE, SYMBOL, "");
    }).then(function() {
      return multiAsset.balanceOf.call(accounts[1], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.balanceOf.call(accounts[2], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.allowance.call(accounts[1], accounts[0], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should not allow proxy approves from user contracts', function(done) {
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, true).then(function() {
      return userContract.proxyApprove(accounts[1], VALUE, SYMBOL);
    }).then(function() {
      return multiAsset.allowance.call(accounts[0], accounts[1], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.allowance.call(userContract.address, accounts[1], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should not allow proxy transfers to ICAP from user contracts', function(done) {
    var icap = RegistryICAP.deployed();
    var _icap = "XE73TSTXREG123456789";
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, true).then(function() {
      return multiAsset.setupRegistryICAP(icap.address);
    }).then(function() {
      return icap.registerAsset("TST", SYMBOL);
    }).then(function() {
      return icap.registerInstitution("XREG", accounts[2]);
    }).then(function() {
      return icap.registerInstitutionAsset("TST", "XREG", accounts[2], {from: accounts[2]});
    }).then(function() {
      return userContract.proxyTransferToICAPWithReference(_icap, VALUE, "");
    }).then(function() {
      return multiAsset.balanceOf.call(accounts[0], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.balanceOf.call(accounts[2], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });

  it('should not be possible to set allowance for missing symbol', function(done) {
    var owner = accounts[0];
    var spender = accounts[1];
    var missingSymbol = bytes32(33);
    var watcher;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      eventsHelper.setupEvents(eventsHistory);
      watcher = eventsHistory.Approve();
      return multiAsset.approve(spender, 100, missingSymbol);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return multiAsset.allowance.call(owner, spender, missingSymbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should not be possible to set allowance for missing symbol for oneself', function(done) {
    var owner = accounts[0];
    var missingSymbol = bytes32(33);
    var watcher;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      eventsHelper.setupEvents(eventsHistory);
      watcher = eventsHistory.Approve();
      return multiAsset.approve(owner, 100, missingSymbol);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return multiAsset.allowance.call(owner, owner, missingSymbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should not be possible to set allowance for oneself', function(done) {
    var owner = accounts[0];
    var watcher;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      eventsHelper.setupEvents(eventsHistory);
      watcher = eventsHistory.Approve();
      return multiAsset.approve(owner, 100, SYMBOL);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return multiAsset.allowance.call(owner, owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should be possible to set allowance from missing holder to missing holder', function(done) {
    var holder = accounts[1];
    var spender = accounts[2];
    var value = 100;
    var watcher;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      eventsHelper.setupEvents(eventsHistory);
      watcher = eventsHistory.Approve();
      return multiAsset.approve(spender, value, SYMBOL, {from: holder});
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 1);
      assert.equal(events[0].args.from.valueOf(), holder);
      assert.equal(events[0].args.spender.valueOf(), spender);
      assert.equal(events[0].args.symbol.valueOf(), SYMBOL);
      assert.equal(events[0].args.value.valueOf(), value);
      return multiAsset.allowance.call(holder, spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to set allowance from missing holder to existing holder', function(done) {
    var holder = accounts[1];
    var spender = accounts[0];
    var value = 100;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, value, SYMBOL, {from: holder});
    }).then(function() {
      return multiAsset.allowance.call(holder, spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to set allowance from existing holder to missing holder', function(done) {
    var holder = accounts[0];
    var spender = accounts[2];
    var value = 100;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, value, SYMBOL, {from: holder});
    }).then(function() {
      return multiAsset.allowance.call(holder, spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to set allowance from existing holder to existing holder', function(done) {
    var holder = accounts[0];
    var spender = accounts[2];
    var value = 100;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(spender, 1, SYMBOL, {from: holder});
    }).then(function() {
      return multiAsset.approve(spender, value, SYMBOL, {from: holder});
    }).then(function() {
      return multiAsset.allowance.call(holder, spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to set allowance value 0', function(done) {
    // Covered by 'should be possible to override allowance value with 0 value'.
    done();
  });
  it('should be possible to set allowance with (2**256 - 1) value', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = UINT_256_MINUS_1;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, value, SYMBOL);
    }).then(function() {
      return multiAsset.allowance.call(holder, spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to set allowance value less then balance', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = 1;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, value, SYMBOL);
    }).then(function() {
      return multiAsset.allowance.call(holder, spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to set allowance value equal to balance', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = VALUE;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, value, SYMBOL);
    }).then(function() {
      return multiAsset.allowance.call(holder, spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to set allowance value more then balance', function(done) {
    // Covered by 'should be possible to set allowance with (2**256 - 1) value'.
    done();
  });
  it('should be possible to override allowance value with 0 value', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = 0;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, 100, SYMBOL);
    }).then(function() {
      return multiAsset.approve(spender, value, SYMBOL);
    }).then(function() {
      return multiAsset.allowance.call(holder, spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to override allowance value with non 0 value', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = 1000;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, 100, SYMBOL);
    }).then(function() {
      return multiAsset.approve(spender, value, SYMBOL);
    }).then(function() {
      return multiAsset.allowance.call(holder, spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should not affect balance when setting allowance', function(done) {
    var holder = accounts[0];
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(accounts[1], 100, SYMBOL);
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should be possible to set allowance', function(done) {
    // Covered by other tests above.
    done();
  });

  it('should not be possible to do allowance transfer by not allowed existing spender, from existing holder', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = 100;
    var expectedSpenderBalance = 100;
    var expectedHolderBalance = VALUE - value;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(spender, value, SYMBOL);
    }).then(function() {
      return multiAsset.transferFrom(holder, spender, 50, SYMBOL, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedSpenderBalance);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
    }).then(done).catch(done);
  });
  it('should not be possible to do allowance transfer by not allowed existing spender, from missing holder', function(done) {
    var holder = accounts[2];
    var spender = accounts[1];
    var value = 100;
    var expectedSpenderBalance = 100;
    var expectedHolderBalance = 0;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(spender, value, SYMBOL);
    }).then(function() {
      return multiAsset.transferFrom(holder, spender, 50, SYMBOL, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedSpenderBalance);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
    }).then(done).catch(done);
  });
  it('should not be possible to do allowance transfer by not allowed missing spender, from existing holder', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var expectedSpenderBalance = 0;
    var expectedHolderBalance = VALUE;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transferFrom(holder, spender, 50, SYMBOL, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedSpenderBalance);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
    }).then(done).catch(done);
  });
  it('should not be possible to do allowance transfer by not allowed missing spender, from missing holder', function(done) {
    var holder = accounts[2];
    var spender = accounts[1];
    var expectedSpenderBalance = 0;
    var expectedHolderBalance = 0;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transferFrom(holder, spender, 50, SYMBOL, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedSpenderBalance);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
    }).then(done).catch(done);
  });
  it('should not be possible to do allowance transfer from and to the same holder', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var watcher;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, 50, SYMBOL);
    }).then(function() {
      eventsHelper.setupEvents(eventsHistory);
      watcher = eventsHistory.Transfer();
      return multiAsset.transferFrom(holder, holder, 50, SYMBOL, {from: spender});
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should be possible to do allowance transfer from oneself', function(done) {
    var holder = accounts[0];
    var receiver = accounts[1];
    var amount = 50;
    var watcher;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transferFrom(holder, receiver, amount, SYMBOL);
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - amount);
      return multiAsset.balanceOf.call(receiver, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
    }).then(done).catch(done);
  });
  it('should not be possible to do allowance transfer with 0 value', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = 0;
    var resultValue = 0;
    var watcher;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, 100, SYMBOL);
    }).then(function() {
      eventsHelper.setupEvents(eventsHistory);
      watcher = eventsHistory.Transfer();
      return multiAsset.transferFrom(holder, spender, value, SYMBOL, {from: spender});
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    }).then(done).catch(done);
  });
  it('should not be possible to do allowance transfer with value less than balance, more than allowed', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = 1000;
    var value = 999;
    var allowed = 998;
    var resultValue = 0;
    multiAsset.issueAsset(SYMBOL, balance, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, allowed, SYMBOL);
    }).then(function() {
      return multiAsset.transferFrom(holder, spender, value, SYMBOL, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), balance);
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    }).then(done).catch(done);
  });
  it('should not be possible to do allowance transfer with value equal to balance, more than allowed', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = 1000;
    var value = 1000;
    var allowed = 999;
    var resultValue = 0;
    multiAsset.issueAsset(SYMBOL, balance, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, allowed, SYMBOL);
    }).then(function() {
      return multiAsset.transferFrom(holder, spender, value, SYMBOL, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), balance);
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    }).then(done).catch(done);
  });
  it('should not be possible to do allowance transfer with value more than balance, less than allowed', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = 199;
    var value = 200;
    var allowed = 201;
    var resultValue = 0;
    multiAsset.issueAsset(SYMBOL, balance, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, allowed, SYMBOL);
    }).then(function() {
      return multiAsset.transferFrom(holder, spender, value, SYMBOL, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), balance);
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    }).then(done).catch(done);
  });
  it('should not be possible to do allowance transfer with value less than balance, more than allowed after another tranfer', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = 102;
    var anotherValue = 10;
    var value = 91;
    var allowed = 100;
    var expectedHolderBalance = balance - anotherValue;
    var resultValue = anotherValue;
    multiAsset.issueAsset(SYMBOL, balance, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, allowed, SYMBOL);
    }).then(function() {
      return multiAsset.transferFrom(holder, spender, anotherValue, SYMBOL, {from: spender});
    }).then(function() {
      return multiAsset.transferFrom(holder, spender, value, SYMBOL, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    }).then(done).catch(done);
  });
  it('should not be possible to do allowance transfer with missing symbol when allowed for another symbol', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = 1000;
    var value = 200;
    var allowed = 1000;
    var missingSymbol = bytes32(33);
    var resultValue = 0;
    multiAsset.issueAsset(SYMBOL, balance, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, allowed, SYMBOL);
    }).then(function() {
      return multiAsset.transferFrom(holder, spender, value, missingSymbol, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), balance);
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
      return multiAsset.balanceOf.call(holder, missingSymbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.balanceOf.call(spender, missingSymbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should not be possible to do allowance transfer when allowed for another symbol', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = 1000;
    var value = 200;
    var allowed = 1000;
    var symbol2 = bytes32(2);
    var resultValue = 0;
    multiAsset.issueAsset(SYMBOL, balance, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.issueAsset(symbol2, balance, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE);
    }).then(function() {  
      return multiAsset.approve(spender, allowed, SYMBOL);
    }).then(function() {
      return multiAsset.transferFrom(holder, spender, value, symbol2, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), balance);
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
      return multiAsset.balanceOf.call(holder, symbol2);
    }).then(function(result) {
      assert.equal(result.valueOf(), balance);
      return multiAsset.balanceOf.call(spender, symbol2);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should not be possible to do allowance transfer with missing symbol when not allowed', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = 1000;
    var value = 200;
    var missingSymbol = bytes32(33);
    var resultValue = 0;
    multiAsset.issueAsset(SYMBOL, balance, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transferFrom(holder, spender, value, missingSymbol, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), balance);
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
      return multiAsset.balanceOf.call(holder, missingSymbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.balanceOf.call(spender, missingSymbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should be possible to do allowance transfer by allowed existing spender', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var existValue = 100;
    var value = 300;
    var expectedHolderBalance = VALUE - existValue - value;
    var expectedSpenderBalance = existValue + value;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(spender, existValue, SYMBOL);
    }).then(function() {
      return multiAsset.approve(spender, value, SYMBOL);
    }).then(function() {
      return multiAsset.transferFrom(holder, spender, value, SYMBOL, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedSpenderBalance);
    }).then(done).catch(done);
  });
  it('should be possible to do allowance transfer by allowed missing spender', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = 300;
    var expectedHolderBalance = VALUE - value;
    var expectedSpenderBalance = value;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, value, SYMBOL);
    }).then(function() {
      return multiAsset.transferFrom(holder, spender, value, SYMBOL, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedSpenderBalance);
    }).then(done).catch(done);
  });
  it('should be possible to do allowance transfer to oneself', function(done) {
    // Covered by 'should be possible to do allowance transfer by allowed existing spender'.
    done();
  });
  it('should be possible to do allowance transfer to existing holder', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var receiver = accounts[2];
    var existValue = 100;
    var value = 300;
    var expectedHolderBalance = VALUE - existValue - value;
    var expectedReceiverBalance = existValue + value;
    var watcher;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(receiver, existValue, SYMBOL);
    }).then(function() {
      return multiAsset.approve(spender, value, SYMBOL);
    }).then(function() {
      eventsHelper.setupEvents(eventsHistory);
      watcher = eventsHistory.Transfer();
      return multiAsset.transferFrom(holder, receiver, value, SYMBOL, {from: spender});
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 1);
      assert.equal(events[0].args.from.valueOf(), holder);
      assert.equal(events[0].args.to.valueOf(), receiver);
      assert.equal(events[0].args.symbol.valueOf(), SYMBOL);
      assert.equal(events[0].args.value.valueOf(), value);
      assert.equal(events[0].args.reference.valueOf(), "");
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return multiAsset.balanceOf.call(receiver, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedReceiverBalance);
    }).then(done).catch(done);
  });
  it('should be possible to do allowance transfer to missing holder', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var receiver = accounts[2];
    var value = 300;
    var expectedHolderBalance = VALUE - value;
    var expectedReceiverBalance = value;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, value, SYMBOL);
    }).then(function() {
      return multiAsset.transferFrom(holder, receiver, value, SYMBOL, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return multiAsset.balanceOf.call(receiver, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedReceiverBalance);
    }).then(done).catch(done);
  });
  it('should be possible to do allowance transfer with value less than balance and less than allowed', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = 201;
    var value = 200;
    var allowed = 201;
    var expectedHolderBalance = balance - value;
    multiAsset.issueAsset(SYMBOL, balance, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, allowed, SYMBOL);
    }).then(function() {
      return multiAsset.transferFrom(holder, spender, value, SYMBOL, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to do allowance transfer with value less than balance and equal to allowed', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = 201;
    var value = 200;
    var allowed = 200;
    var expectedHolderBalance = balance - value;
    multiAsset.issueAsset(SYMBOL, balance, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, allowed, SYMBOL);
    }).then(function() {
      return multiAsset.transferFrom(holder, spender, value, SYMBOL, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to do allowance transfer with value equal to balance and less than allowed', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = 200;
    var value = 200;
    var allowed = 201;
    var expectedHolderBalance = balance - value;
    multiAsset.issueAsset(SYMBOL, balance, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, allowed, SYMBOL);
    }).then(function() {
      return multiAsset.transferFrom(holder, spender, value, SYMBOL, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to do allowance transfer with value equal to balance and equal to allowed', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = 200;
    var value = 200;
    var allowed = 200;
    var expectedHolderBalance = balance - value;
    multiAsset.issueAsset(SYMBOL, balance, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, allowed, SYMBOL);
    }).then(function() {
      return multiAsset.transferFrom(holder, spender, value, SYMBOL, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to do allowance transfer with value less than balance and less than allowed after another transfer', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = 201;
    var anotherValue = 1;
    var value = 199;
    var allowed = 201;
    var expectedSpenderBalance = anotherValue + value;
    var expectedHolderBalance = balance - anotherValue - value;
    multiAsset.issueAsset(SYMBOL, balance, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, allowed, SYMBOL);
    }).then(function() {
      return multiAsset.transferFrom(holder, spender, anotherValue, SYMBOL, {from: spender});
    }).then(function() {
      return multiAsset.transferFrom(holder, spender, value, SYMBOL, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedSpenderBalance);
    }).then(done).catch(done);
  });
  it('should be possible to do allowance transfer with value less than balance and equal to allowed after another transfer', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = 201;
    var anotherValue = 1;
    var value = 199;
    var allowed = 200;
    var expectedSpenderBalance = anotherValue + value;
    var expectedHolderBalance = balance - anotherValue - value;
    multiAsset.issueAsset(SYMBOL, balance, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, allowed, SYMBOL);
    }).then(function() {
      return multiAsset.transferFrom(holder, spender, anotherValue, SYMBOL, {from: spender});
    }).then(function() {
      return multiAsset.transferFrom(holder, spender, value, SYMBOL, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedSpenderBalance);
    }).then(done).catch(done);
  });
  it('should be possible to do allowance transfer with value (2**256 - 1)', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = UINT_256_MINUS_1;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, value, SYMBOL);
    }).then(function() {
      return multiAsset.transferFrom(holder, spender, value, SYMBOL, {from: spender});
    }).then(function() {
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.balanceOf.call(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to do allowance transfer with reference', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var receiver = accounts[2];
    var value = 300;
    var expectedHolderBalance = VALUE - value;
    var expectedReceiverBalance = value;
    var reference = "just some arbitrary string.";
    var watcher;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, value, SYMBOL);
    }).then(function() {
      eventsHelper.setupEvents(eventsHistory);
      watcher = eventsHistory.Transfer();
      return multiAsset.transferFromWithReference(holder, receiver, value, SYMBOL, reference, {from: spender});
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 1);
      assert.equal(events[0].args.from.valueOf(), holder);
      assert.equal(events[0].args.to.valueOf(), receiver);
      assert.equal(events[0].args.symbol.valueOf(), SYMBOL);
      assert.equal(events[0].args.value.valueOf(), value);
      assert.equal(events[0].args.reference.valueOf(), reference);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return multiAsset.balanceOf.call(receiver, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedReceiverBalance);
    }).then(done).catch(done);
  });
  it('should checkSigned approve and allowance transfer', function(done) {
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(accounts[1], 100, SYMBOL);
    }).then(function() {
      return multiAsset.transferFrom(accounts[0], accounts[1], 10, SYMBOL, {from: accounts[1]});
    }).then(function() {
      return multiAsset.signChecks.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), 2);
      return multiAsset.lastOperation.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), sha3(multiAssetAbi.transferFrom.getData(accounts[0], accounts[1], 10, SYMBOL), bytes32(2)));
    }).then(done).catch(done);
  });
  it('should checkSigned on approve', function(done) {
    multiAsset.approve(accounts[1], 100, SYMBOL).then(function() {
    }).then(function() {
      return multiAsset.signChecks.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), 1);
      return multiAsset.lastOperation.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), sha3(multiAssetAbi.approve.getData(accounts[1], 100, SYMBOL), bytes32(2)));
    }).then(done).catch(done);
  });
  it('should checkSigned approve and allowance transfer with reference', function(done) {
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(accounts[1], 100, SYMBOL);
    }).then(function() {
      return multiAsset.transferFromWithReference(accounts[0], accounts[1], 10, SYMBOL, "REFF", {from: accounts[1]});
    }).then(function() {
      return multiAsset.signChecks.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), 2);
      return multiAsset.lastOperation.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), sha3(multiAssetAbi.transferFromWithReference.getData(accounts[0], accounts[1], 10, SYMBOL, "REFF"), bytes32(2)));
    }).then(done).catch(done);
  });

  it('should return 0 allowance for existing owner and not allowed existing spender', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(spender, 100, SYMBOL);
    }).then(function() {
      return multiAsset.allowance.call(holder, spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should return 0 allowance for existing owner and not allowed missing spender', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.allowance.call(holder, spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should return 0 allowance for missing owner and existing spender', function(done) {
    var holder = accounts[1];
    var spender = accounts[0];
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.allowance.call(holder, spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should return 0 allowance for missing owner and missing spender', function(done) {
    var holder = accounts[1];
    var spender = accounts[2];
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.allowance.call(holder, spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should return 0 allowance for existing oneself', function(done) {
    var holder = accounts[0];
    var spender = holder;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.allowance.call(holder, spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should return 0 allowance for missing oneself', function(done) {
    var holder = accounts[1];
    var spender = holder;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.allowance.call(holder, spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should return 0 allowance for missing symbol', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var missingSymbol = bytes32(33);
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, 100, SYMBOL);
    }).then(function() {
      return multiAsset.allowance.call(holder, spender, missingSymbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should respect symbol when telling allowance', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var symbol = SYMBOL;
    var symbol2 = bytes32(2);
    var value = 100;
    var value2 = 200;
    multiAsset.issueAsset(symbol, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.issueAsset(symbol2, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE);
    }).then(function() {
      return multiAsset.approve(spender, value, symbol);
    }).then(function() {
      return multiAsset.approve(spender, value2, symbol2);
    }).then(function() {
      return multiAsset.allowance.call(holder, spender, symbol);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return multiAsset.allowance.call(holder, spender, symbol2);
    }).then(function(result) {
      assert.equal(result.valueOf(), value2);
    }).then(done).catch(done);
  });
  it('should respect holder when telling allowance', function(done) {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var spender = accounts[2];
    var value = 100;
    var value2 = 200;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, value, SYMBOL);
    }).then(function() {
      return multiAsset.approve(spender, value2, SYMBOL, {from: holder2});
    }).then(function() {
      return multiAsset.allowance.call(holder, spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return multiAsset.allowance.call(holder2, spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value2);
    }).then(done).catch(done);
  });
  it('should respect spender when telling allowance', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var spender2 = accounts[2];
    var value = 100;
    var value2 = 200;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, value, SYMBOL);
    }).then(function() {
      return multiAsset.approve(spender2, value2, SYMBOL);
    }).then(function() {
      return multiAsset.allowance.call(holder, spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return multiAsset.allowance.call(holder, spender2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value2);
    }).then(done).catch(done);
  });
  it('should be possible to check allowance of existing owner and allowed existing spender', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = 300;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.transfer(spender, 100, SYMBOL);
    }).then(function() {
      return multiAsset.approve(spender, value, SYMBOL);
    }).then(function() {
      return multiAsset.allowance.call(holder, spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should be possible to check allowance of existing owner and allowed missing spender', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = 300;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, value, SYMBOL);
    }).then(function() {
      return multiAsset.allowance.call(holder, spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    }).then(done).catch(done);
  });
  it('should return 0 allowance after another transfer', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = 300;
    var resultValue = 0;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, value, SYMBOL);
    }).then(function() {
      return multiAsset.transferFrom(holder, spender, value, SYMBOL, {from: spender});
    }).then(function() {
      return multiAsset.allowance.call(holder, spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    }).then(done).catch(done);
  });
  it('should return 1 allowance after another transfer', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var receiver = accounts[2];
    var value = 300;
    var transfer = 299;
    var resultValue = 1;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, value, SYMBOL);
    }).then(function() {
      return multiAsset.transferFrom(holder, receiver, transfer, SYMBOL, {from: spender});
    }).then(function() {
      return multiAsset.allowance.call(holder, spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    }).then(done).catch(done);
  });
  it('should return 2**255 allowance after another transfer', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = UINT_256_MINUS_1;
    var transfer = UINT_255_MINUS_1;
    var resultValue = UINT_255;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, value, SYMBOL);
    }).then(function() {
      return multiAsset.transferFrom(holder, spender, transfer, SYMBOL, {from: spender});
    }).then(function() {
      return multiAsset.allowance.call(holder, spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    }).then(done).catch(done);
  });
  it('should return (2**256 - 2) allowance after another transfer', function(done) {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = UINT_256_MINUS_1;
    var transfer = 1;
    var resultValue = UINT_256_MINUS_2;
    multiAsset.issueAsset(SYMBOL, value, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.approve(spender, value, SYMBOL);
    }).then(function() {
      return multiAsset.transferFrom(holder, spender, transfer, SYMBOL, {from: spender});
    }).then(function() {
      return multiAsset.allowance.call(holder, spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    }).then(done).catch(done);
  });

  it('should not be possible to trust to already trusted address', function(done) {
    var holder = accounts[0];
    var trusty = accounts[1];
    multiAsset.trust(trusty).then(function() {
      return multiAsset.trust.call(trusty);
    }).then(function(result) {
      assert.isFalse(result);
    }).then(done).catch(done);
  });
  it('should not be possible to trust to oneself', function(done) {
    var holder = accounts[0];
    multiAsset.trust.call(holder).then(function(result) {
      assert.isFalse(result);
    }).then(done).catch(done);
  });
  it('should be possible to trust by existing holder', function(done) {
    var holder = accounts[0];
    var trusty = accounts[1];
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.trust.call(trusty);
    }).then(function(result) {
      assert.isTrue(result);
    }).then(done).catch(done);
  });
  it('should be possible to trust by missing holder', function(done) {
    var holder = accounts[0];
    var trusty = accounts[1];
    multiAsset.trust.call(trusty).then(function(result) {
      assert.isTrue(result);
    }).then(done).catch(done);
  });
  it('should be possible to trust to multiple addresses', function(done) {
    var holder = accounts[0];
    var trusty1 = accounts[1];
    var trusty2 = accounts[2];
    multiAsset.trust(trusty1).then(function(result) {
      return multiAsset.trust(trusty2);
    }).then(function() {
      return multiAsset.isTrusted.call(holder, trusty1);
    }).then(function(result) {
      assert.isTrue(result);
      return multiAsset.isTrusted.call(holder, trusty2);
    }).then(function(result) {
      assert.isTrue(result);
    }).then(done).catch(done);
  });

  it('should not be possible to distrust an untrusted address', function(done) {
    var holder = accounts[0];
    var trusty = accounts[1];
    var untrusty = accounts[2];
    multiAsset.trust(trusty).then(function() {
      return multiAsset.distrust.call(untrusty);
    }).then(function(result) {
      assert.isFalse(result);
    }).then(done).catch(done);
  });
  it('should not be possible to distrust by missing holder', function(done) {
    var holder = accounts[0];
    var untrusty = accounts[1];
    multiAsset.distrust.call(untrusty).then(function(result) {
      assert.isFalse(result);
    }).then(done).catch(done);
  });
  it('should not be possible to distrust oneself', function(done) {
    var holder = accounts[0];
    multiAsset.distrust.call(holder).then(function(result) {
      assert.isFalse(result);
    }).then(done).catch(done);
  });
  it('should be possible to distrust a trusted address', function(done) {
    var holder = accounts[0];
    var trusty = accounts[1];
    multiAsset.trust(trusty).then(function() {
      return multiAsset.distrust(trusty);
    }).then(function() {
      return multiAsset.isTrusted.call(holder, trusty);
    }).then(function(result) {
      assert.isFalse(result);
    }).then(done).catch(done);
  });
  it('should be possible to distrust a last trusted address', function(done) {
    var holder = accounts[0];
    var trusty1 = accounts[1];
    var trusty2 = accounts[2];
    multiAsset.trust(trusty1).then(function() {
      return multiAsset.trust(trusty2);
    }).then(function() {
      return multiAsset.distrust(trusty2);
    }).then(function() {
      return multiAsset.isTrusted.call(holder, trusty2);
    }).then(function(result) {
      assert.isFalse(result);
      return multiAsset.isTrusted.call(holder, trusty1);
    }).then(function(result) {
      assert.isTrue(result);
    }).then(done).catch(done);
  });
  it('should be possible to distrust a not last trusted address', function(done) {
    var holder = accounts[0];
    var trusty1 = accounts[1];
    var trusty2 = accounts[2];
    multiAsset.trust(trusty1).then(function() {
      return multiAsset.trust(trusty2);
    }).then(function() {
      return multiAsset.distrust(trusty1);
    }).then(function() {
      return multiAsset.isTrusted.call(holder, trusty1);
    }).then(function(result) {
      assert.isFalse(result);
      return multiAsset.isTrusted.call(holder, trusty2);
    }).then(function(result) {
      assert.isTrue(result);
    }).then(done).catch(done);
  });

  it('should not be possible to distrust all without trusted addresses', function(done) {
    var holder = accounts[0];
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.distrustAll.call();
    }).then(function(result) {
      assert.isFalse(result);
    }).then(done).catch(done);
  });
  it('should not be possible to distrust all by missing holder', function(done) {
    var holder = accounts[0];
    multiAsset.distrustAll.call().then(function(result) {
      assert.isFalse(result);
    }).then(done).catch(done);
  });
  it('should be possible to distrust all', function(done) {
    var holder = accounts[0];
    var trusty1 = accounts[1];
    var trusty2 = accounts[2];
    multiAsset.trust(trusty1).then(function() {
      return multiAsset.trust(trusty2);
    }).then(function() {
      return multiAsset.distrustAll();
    }).then(function() {
      return multiAsset.isTrusted.call(holder, trusty1);
    }).then(function(result) {
      assert.isFalse(result);
      return multiAsset.isTrusted.call(holder, trusty2);
    }).then(function(result) {
      assert.isFalse(result);
    }).then(done).catch(done);
  });

  it('should not be possible to recover to existing holder', function(done) {
    var holder = accounts[0];
    var trusty = accounts[1];
    var recoverTo = accounts[2];
    multiAsset.trust(trusty).then(function() {
      return multiAsset.trust(accounts[3], {from: recoverTo});
    }).then(function() {
      return multiAsset.recover.call(holder, recoverTo, {from: trusty});
    }).then(function(result) {
      assert.isFalse(result);
    }).then(done).catch(done);
  });
  it('should not be possible to recover by untrusted', function(done) {
    var holder = accounts[0];
    var trusty = accounts[1];
    var untrusty = accounts[2];
    var recoverTo = accounts[3];
    multiAsset.trust(trusty).then(function() {
      return multiAsset.recover.call(holder, recoverTo, {from: untrusty});
    }).then(function(result) {
      assert.isFalse(result);
    }).then(done).catch(done);
  });
  it('should not be possible to recover from missing holder', function(done) {
    var holder = accounts[0];
    var untrusty = accounts[2];
    var recoverTo = accounts[3];
    multiAsset.recover.call(holder, recoverTo, {from: untrusty}).then(function(result) {
      assert.isFalse(result);
    }).then(done).catch(done);
  });
  it('should not be possible to recover by oneself', function(done) {
    var holder = accounts[0];
    var trusty = accounts[1];
    var recoverTo = accounts[3];
    multiAsset.trust(trusty).then(function() {
      return multiAsset.recover.call(holder, recoverTo, {from: holder});
    }).then(function(result) {
      assert.isFalse(result);
    }).then(done).catch(done);
  });
  it('should not be possible to recover to oneself', function(done) {
    var holder = accounts[0];
    var trusty = accounts[1];
    multiAsset.trust(trusty).then(function() {
      return multiAsset.recover.call(holder, holder, {from: trusty});
    }).then(function(result) {
      assert.isFalse(result);
    }).then(done).catch(done);
  });
  it('should not be possible to recover to the same address', function(done) {
    // Covered by 'should not be possible to recover to oneself'.
    done(); 
  });
  it('should not be possible to do transfer by target after failed recovery', function(done) {
    var holder = accounts[0];
    var untrusty = accounts[2];
    var recoverTo = accounts[3];
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.recover(holder, recoverTo, {from: untrusty});
    }).then(function() {
      return multiAsset.transfer(untrusty, 100, SYMBOL, {from: recoverTo});
    }).then(function() {
      return multiAsset.balanceOf.call(untrusty, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should be possible to do transfer by holder after failed recovery', function(done) {
    var holder = accounts[0];
    var trusty = accounts[1];
    var untrusty = accounts[2];
    var recoverTo = accounts[3];
    var amount = 100;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.recover(holder, recoverTo, {from: untrusty});
    }).then(function() {
      return multiAsset.transfer(untrusty, amount, SYMBOL, {from: holder});
    }).then(function() {
      return multiAsset.balanceOf.call(untrusty, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - amount);
    }).then(done).catch(done);
  });
  it('should be possible to recover', function(done) {
    var holder = accounts[0];
    var trusty = accounts[1];
    var recoverTo = accounts[2];
    var watcher;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.trust(trusty);
    }).then(function() {
      watcher = eventsHistory.Recovery();
      eventsHelper.setupEvents(eventsHistory);
      return multiAsset.recover(holder, recoverTo, {from: trusty});
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 1);
      assert.equal(events[0].args.from.valueOf(), holder);
      assert.equal(events[0].args.to.valueOf(), recoverTo);
      assert.equal(events[0].args.by.valueOf(), trusty); 
      return multiAsset.balanceOf.call(recoverTo, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should be possible to recover multiple times', function(done) {
    var holder = accounts[0];
    var trusty = accounts[1];
    var recoverTo = accounts[2];
    var recoverTo2 = accounts[3];
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.trust(trusty);
    }).then(function() {
      return multiAsset.recover(holder, recoverTo, {from: trusty});
    }).then(function() {
      return multiAsset.recover(recoverTo, recoverTo2, {from: trusty});
    }).then(function() {
      return multiAsset.balanceOf.call(recoverTo2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should be possible to recover recovered address', function(done) {
    var holder = accounts[0];
    var trusty = accounts[1];
    var recoverTo = accounts[2];
    var recoverTo2 = accounts[3];
    var watcher;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.trust(trusty);
    }).then(function() {
      return multiAsset.recover(holder, recoverTo, {from: trusty});
    }).then(function() {
      watcher = eventsHistory.Recovery();
      eventsHelper.setupEvents(eventsHistory);
      return multiAsset.recover(holder, recoverTo2, {from: trusty});
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 1);
      assert.equal(events[0].args.from.valueOf(), recoverTo);
      assert.equal(events[0].args.to.valueOf(), recoverTo2);
      assert.equal(events[0].args.by.valueOf(), trusty); 
      return multiAsset.balanceOf.call(recoverTo2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should be possible to do transfers after recovery by holder', function(done) {
    var holder = accounts[0];
    var trusty = accounts[1];
    var untrusty = accounts[2];
    var recoverTo = accounts[3];
    var amount = 100;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.trust(trusty);
    }).then(function() {
      return multiAsset.recover(holder, recoverTo, {from: trusty});
    }).then(function() {
      return multiAsset.transfer(untrusty, amount, SYMBOL, {from: holder});
    }).then(function() {
      return multiAsset.balanceOf.call(untrusty, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
      return multiAsset.balanceOf.call(recoverTo, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - amount);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - amount);
    }).then(done).catch(done);
  });
  it('should be possible to reissue after recovery', function(done) {
    var holder = accounts[0];
    var trusty = accounts[1];
    var recoverTo = accounts[3];
    var amount = 100;
    var isReissuable = true;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.trust(trusty);
    }).then(function() {
      return multiAsset.recover(holder, recoverTo, {from: trusty});
    }).then(function() {
      return multiAsset.reissueAsset(SYMBOL, amount, {from: recoverTo});
    }).then(function() {
      return multiAsset.balanceOf.call(recoverTo, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE + amount);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE + amount);
    }).then(done).catch(done);
  });
  it('should be possible to revoke after recovery', function(done) {
    var holder = accounts[0];
    var trusty = accounts[1];
    var recoverTo = accounts[3];
    var amount = 100;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.trust(trusty);
    }).then(function() {
      return multiAsset.recover(holder, recoverTo, {from: trusty});
    }).then(function() {
      return multiAsset.revokeAsset(SYMBOL, amount, {from: recoverTo});
    }).then(function() {
      return multiAsset.balanceOf.call(recoverTo, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - amount);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - amount);
    }).then(done).catch(done);
  });
  it('should be possible to change ownership after recovery', function(done) {
    var holder = accounts[0];
    var trusty = accounts[1];
    var newOwner = accounts[2];
    var recoverTo = accounts[3];
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.trust(trusty);
    }).then(function() {
      return multiAsset.recover(holder, recoverTo, {from: trusty});
    }).then(function() {
      return multiAsset.changeOwnership(SYMBOL, newOwner, {from: recoverTo});
    }).then(function() {
      return multiAsset.owner.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), newOwner);
      return multiAsset.isOwner.call(holder, SYMBOL);
    }).then(function(result) {
      assert.isFalse(result.valueOf());
      return multiAsset.isOwner.call(recoverTo, SYMBOL);
    }).then(function(result) {
      assert.isFalse(result.valueOf());
    }).then(done).catch(done);
  });
  it('should be possible to reissue after recovery by holder', function(done) {
    var holder = accounts[0];
    var trusty = accounts[1];
    var recoverTo = accounts[3];
    var amount = 100;
    var isReissuable = true;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, isReissuable).then(function() {
      return multiAsset.trust(trusty);
    }).then(function() {
      return multiAsset.recover(holder, recoverTo, {from: trusty});
    }).then(function() {
      return multiAsset.reissueAsset(SYMBOL, amount);
    }).then(function() {
      return multiAsset.balanceOf.call(recoverTo, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE + amount);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE + amount);
    }).then(done).catch(done);
  });
  it('should be possible to revoke after recovery by holder', function(done) {
    var holder = accounts[0];
    var trusty = accounts[1];
    var recoverTo = accounts[3];
    var amount = 100;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.trust(trusty);
    }).then(function() {
      return multiAsset.recover(holder, recoverTo, {from: trusty});
    }).then(function() {
      return multiAsset.revokeAsset(SYMBOL, amount);
    }).then(function() {
      return multiAsset.balanceOf.call(recoverTo, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - amount);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - amount);
    }).then(done).catch(done);
  });
  it('should be possible to change ownership after recovery by holder', function(done) {
    var holder = accounts[0];
    var trusty = accounts[1];
    var newOwner = accounts[2];
    var recoverTo = accounts[3];
    var watcher;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.trust(trusty);
    }).then(function() {
      return multiAsset.recover(holder, recoverTo, {from: trusty});
    }).then(function() {
      watcher = eventsHistory.OwnershipChange();
      eventsHelper.setupEvents(eventsHistory);
      return multiAsset.changeOwnership(SYMBOL, newOwner, {from: holder});
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 1);
      assert.equal(events[0].args.from.valueOf(), recoverTo);
      assert.equal(events[0].args.to.valueOf(), newOwner);
      assert.equal(events[0].args.symbol.valueOf(), SYMBOL); 
      return multiAsset.owner.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), newOwner);
      return multiAsset.isOwner.call(holder, SYMBOL);
    }).then(function(result) {
      assert.isFalse(result.valueOf());
      return multiAsset.isOwner.call(recoverTo, SYMBOL);
    }).then(function(result) {
      assert.isFalse(result.valueOf());
    }).then(done).catch(done);
  });
  it('should be possible to do transfers after recovery by recovered address', function(done) {
    var holder = accounts[0];
    var trusty = accounts[1];
    var untrusty = accounts[2];
    var recoverTo = accounts[3];
    var amount = 100;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.trust(trusty);
    }).then(function() {
      return multiAsset.recover(holder, recoverTo, {from: trusty});
    }).then(function() {
      return multiAsset.transfer(untrusty, amount, SYMBOL, {from: recoverTo});
    }).then(function() {
      return multiAsset.balanceOf.call(untrusty, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
      return multiAsset.balanceOf.call(recoverTo, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - amount);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - amount);
    }).then(done).catch(done);
  });
  it('should recover asset ownership', function(done) {
    var holder = accounts[0];
    var trusty = accounts[1];
    var recoverTo = accounts[2];
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.trust(trusty);
    }).then(function() {
      return multiAsset.recover(holder, recoverTo, {from: trusty});
    }).then(function() {
      return multiAsset.owner.call(SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), recoverTo);
    }).then(done).catch(done);
  });
  it('should recover balances', function(done) {
    var holder = accounts[0];
    var trusty = accounts[1];
    var recoverTo = accounts[2];
    var symbol1 = bytes32(31);
    var symbol2 = bytes32(32);
    var value1 = 100;
    var value2 = 200;
    multiAsset.issueAsset(symbol1, value1, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.issueAsset(symbol2, value2, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE);
    }).then(function() {
      return multiAsset.trust(trusty);
    }).then(function() {
      return multiAsset.recover(holder, recoverTo, {from: trusty});
    }).then(function() {
      return multiAsset.balanceOf.call(recoverTo, symbol1);
    }).then(function(result) {
      assert.equal(result.valueOf(), value1);
      return multiAsset.balanceOf.call(recoverTo, symbol2);
    }).then(function(result) {
      assert.equal(result.valueOf(), value2);
    }).then(done).catch(done);
  });
  it('should recover allowances', function(done) {
    var holder = accounts[0];
    var trusty = accounts[1];
    var recoverTo = accounts[2];
    var symbol1 = bytes32(31);
    var symbol2 = bytes32(32);
    var spender1 = accounts[3];
    var spender2 = accounts[4];
    var value1 = 100;
    var value2 = 200;
    multiAsset.issueAsset(symbol1, value1, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.issueAsset(symbol2, value2, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE);
    }).then(function() {
      return multiAsset.approve(spender1, value1, symbol1);
    }).then(function() {
      return multiAsset.approve(spender2, value2, symbol2);
    }).then(function() {
      return multiAsset.trust(trusty);
    }).then(function() {
      return multiAsset.recover(holder, recoverTo, {from: trusty});
    }).then(function() {
      return multiAsset.allowance.call(recoverTo, spender1, symbol1);
    }).then(function(result) {
      assert.equal(result.valueOf(), value1);
      return multiAsset.allowance.call(recoverTo, spender2, symbol2);
    }).then(function(result) {
      assert.equal(result.valueOf(), value2);
    }).then(done).catch(done);
  });
  it('should recover trusts', function(done) {
    var holder = accounts[0];
    var trusty1 = accounts[1];
    var trusty2 = accounts[2];
    var recoverTo = accounts[3];
    var untrusty = accounts[5];
    multiAsset.trust(trusty1).then(function() {
      return multiAsset.trust(trusty2);
    }).then(function() {
      return multiAsset.recover(holder, recoverTo, {from: trusty1});
    }).then(function() {
      return multiAsset.isTrusted.call(recoverTo, trusty1);
    }).then(function(result) {
      assert.isTrue(result);
      return multiAsset.isTrusted.call(recoverTo, trusty2);
    }).then(function(result) {
      assert.isTrue(result);
      return multiAsset.isTrusted.call(recoverTo, untrusty);
    }).then(function(result) {
      assert.isFalse(result);
    }).then(done).catch(done);
  });
  it('should checkSigned on recovery', function(done) {
    multiAsset.trust(accounts[0], {from: accounts[1]}).then(function() {
      return multiAsset.recover(accounts[1], accounts[2]);
    }).then(function() {
      return multiAsset.signChecks.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), 1);
      return multiAsset.lastOperation.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), sha3(multiAssetAbi.recover.getData(accounts[1], accounts[2]), bytes32(1)));
    }).then(done).catch(done);
  });

  it('should be possible to switch off asset issue', function(done) {
    multiAsset.setSwitch(sha3(SYMBOL, IS_REISSUABLE, Features.Issue), true).then(function() {
      return multiAsset.issueAsset.call(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE);
    }).then(function(result) {
      assert.isFalse(result.valueOf());
    }).then(done).catch(done);
  });
  it('should be possible to switch off transfer with reference', function(done) {
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.setSwitch(sha3(SYMBOL, Features.TransferWithReference), true);
    }).then(function() {
      return multiAsset.transferWithReference.call(accounts[1], VALUE, SYMBOL, "Invoice#AS001");
    }).then(function(result) {
      assert.isFalse(result.valueOf());
    }).then(done).catch(done);
  });
  it('should be possible to switch off transfer from with reference', function(done) {
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.setSwitch(sha3(SYMBOL, Features.TransferWithReference), true);
    }).then(function() {
      return multiAsset.approve(accounts[1], 100, SYMBOL);
    }).then(function(result) {
      return multiAsset.transferFromWithReference.call(accounts[0], accounts[1], 50, SYMBOL, "Invoice#AS001", {from: accounts[1]});
    }).then(function(result) {
      assert.isFalse(result.valueOf());
    }).then(done).catch(done);
  });
  it('should be possible to switch off revokation', function(done) {
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.setSwitch(sha3(SYMBOL, Features.Revoke), true);
    }).then(function() {
      return multiAsset.revokeAsset.call(SYMBOL, 100);
    }).then(function(result) {
      assert.isFalse(result.valueOf());
    }).then(done).catch(done);
  });
  it('should be possible to switch off ownership change', function(done) {
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.setSwitch(sha3(SYMBOL, Features.ChangeOwnership), true);
    }).then(function() {
      return multiAsset.changeOwnership.call(SYMBOL, accounts[1]);
    }).then(function(result) {
      assert.isFalse(result.valueOf());
    }).then(done).catch(done);
  });
  it.skip('should be possible to switch off recovery', function(done) {
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.setSwitch(sha3(bytes32(1), Features.Recovery), true);
    }).then(function() {
      return multiAsset.trust(accounts[1]);
    }).then(function() {
      return multiAsset.recover.call(accounts[0], accounts[2], {from: accounts[1]});
    }).then(function(result) {
      assert.isFalse(result.valueOf());
    }).then(done).catch(done);
  });
  it('should be possible to switch off allowances', function(done) {
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.setSwitch(sha3(SYMBOL, Features.Allowances), true);
    }).then(function() {
      return multiAsset.approve.call(accounts[1], 100, SYMBOL);
    }).then(function(result) {
      assert.isFalse(result.valueOf());
    }).then(done).catch(done);
  });
  it('should be possible to switch off transfer to ICAP', function(done) {
    var icap = RegistryICAP.deployed();
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.setupRegistryICAP(icap.address);
    }).then(function() {
      return icap.registerAsset("TST", SYMBOL);
    }).then(function() {
      return icap.registerInstitution("XREG", accounts[2]);
    }).then(function() {
      return icap.registerInstitutionAsset("TST", "XREG", accounts[2], {from: accounts[2]});
    }).then(function() {
      return multiAsset.setSwitch(sha3(SYMBOL, Features.ICAP), true);
    }).then(function() {
      return multiAsset.transferToICAP.call("XE73TSTXREG123456789", 100);
    }).then(function(result) {
      assert.isFalse(result.valueOf());
    }).then(done).catch(done);
  });
  it('should be possible to switch off transfer to ICAP with reference', function(done) {
    var icap = RegistryICAP.deployed();
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.setupRegistryICAP(icap.address);
    }).then(function() {
      return icap.registerAsset("TST", SYMBOL);
    }).then(function() {
      return icap.registerInstitution("XREG", accounts[2]);
    }).then(function() {
      return icap.registerInstitutionAsset("TST", "XREG", accounts[2], {from: accounts[2]});
    }).then(function() {
      return multiAsset.setSwitch(sha3(SYMBOL, Features.TransferWithReference), true);
    }).then(function() {
      return multiAsset.transferToICAPWithReference.call("XE73TSTXREG123456789", 100, "Ref");
    }).then(function(result) {
      assert.isFalse(result.valueOf());
    }).then(done).catch(done);
  });
  it.skip('should be possible to switch off cosigning configuration per user per asset', function(done) {
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.setSwitch(sha3(bytes32(1), Features.Cosigning), true);
    }).then(function() {
      return multiAsset.setCosignerAddress.call(accounts[1], SYMBOL);
    }).then(function(result) {
      assert.isFalse(result.valueOf());
    }).then(done).catch(done);
  });
  it.skip('should be possible to switch off cosigning configuration per asset', function(done) {
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.setSwitch(sha3(SYMBOL, Features.Cosigning), true);
    }).then(function() {
      return multiAsset.setCosignerAddressForAsset.call(accounts[1], SYMBOL);
    }).then(function(result) {
      assert.isFalse(result.valueOf());
    }).then(done).catch(done);
  });
  it.skip('should be possible to switch off cosigning configuration per user', function(done) {
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.setSwitch(sha3(bytes32(1), Features.Cosigning), true);
    }).then(function() {
      return multiAsset.setCosignerAddressForUser.call(accounts[1]);
    }).then(function(result) {
      assert.isFalse(result.valueOf());
    }).then(done).catch(done);
  });
  it.skip('should not be possible to set cosigning address per asset by non-asset-owner', function(done) {
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.setCosignerAddressForAsset.call(accounts[1], SYMBOL, {from: accounts[1]});
    }).then(function(result) {
      assert.isFalse(result.valueOf());
    }).then(done).catch(done);
  });
  it.skip('should not be possible to set cosigning address per asset for non-existing asset', function(done) {
    multiAsset.setCosignerAddressForAsset.call(accounts[1], SYMBOL).then(function(result) {
      assert.isFalse(result.valueOf());
    }).then(done).catch(done);
  });
  it.skip('should checkSigned when setting cosigning address per asset', function(done) {
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.setCosignerAddressForAsset(accounts[1], SYMBOL);
    }).then(function() {
      return multiAsset.signChecks.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), 1);
      return multiAsset.lastOperation.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), sha3(multiAssetAbi.setCosignerAddressForAsset.getData(accounts[1], SYMBOL), bytes32(1)));
    }).then(done).catch(done);
  });
  it('should checkSigned when setting cosigning address per user', function(done) {
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.setCosignerAddressForUser(accounts[1]);
    }).then(function() {
      return multiAsset.signChecks.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), 1);
      return multiAsset.lastOperation.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), sha3(multiAssetAbi.setCosignerAddressForUser.getData(accounts[1]), bytes32(1)));
    }).then(done).catch(done);
  });
  it('should checkSigned when setting cosigning address per user per asset', function(done) {
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.setCosignerAddress(accounts[1], SYMBOL);
    }).then(function() {
      return multiAsset.signChecks.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), 1);
      return multiAsset.lastOperation.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), sha3(multiAssetAbi.setCosignerAddress.getData(accounts[1], SYMBOL), bytes32(1)));
    }).then(done).catch(done);
  });

  it.skip('should checkSigned on asset above others', function(done) {
    var cosignerAsset = Cosigner1.deployed();
    var cosignerUserAsset = Cosigner2.deployed();
    var cosignerUser = Cosigner3.deployed();
    var cosignerAssetChecks = 0;
    var cosignerUserAssetChecks = 0;
    var cosignerUserChecks = 0;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.setCosignerAddressForAsset(cosignerAsset.address, SYMBOL);
    }).then(function() {
      return multiAsset.setCosignerAddress(cosignerUserAsset.address, SYMBOL);
    }).then(function() {
      return multiAsset.setCosignerAddressForUser(cosignerUser.address);
    }).then(function() {
      return cosignerAsset.signChecks.call();
    }).then(function(result) {
      cosignerAssetChecks = result.toNumber();
      return cosignerUserAsset.signChecks.call();
    }).then(function(result) {
      cosignerUserAssetChecks = result.toNumber();
      return cosignerUser.signChecks.call();
    }).then(function(result) {
      cosignerUserChecks = result.toNumber();
      return multiAsset.transfer(accounts[0], 10, SYMBOL);
    }).then(function() {
      return cosignerAsset.signChecks.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), cosignerAssetChecks + 1);
      return cosignerUserAsset.signChecks.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), cosignerUserAssetChecks);
      return cosignerUser.signChecks.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), cosignerUserChecks);
    }).then(done).catch(done);
  });
  it('should checkSigned on user asset above user', function(done) {
    var cosignerUserAsset = Cosigner2.deployed();
    var cosignerUser = Cosigner3.deployed();
    var cosignerUserAssetChecks = 0;
    var cosignerUserChecks = 0;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.setCosignerAddress(cosignerUserAsset.address, SYMBOL);
    }).then(function() {
      return multiAsset.setCosignerAddressForUser(cosignerUser.address);
    }).then(function() {
      return cosignerUserAsset.signChecks.call();
    }).then(function(result) {
      cosignerUserAssetChecks = result.toNumber();
      return cosignerUser.signChecks.call();
    }).then(function(result) {
      cosignerUserChecks = result.toNumber();
      return multiAsset.transfer(accounts[0], 10, SYMBOL);
    }).then(function() {
      return cosignerUserAsset.signChecks.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), cosignerUserAssetChecks + 1);
      return cosignerUser.signChecks.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), cosignerUserChecks);
    }).then(done).catch(done);
  });
  it('should checkSigned on user if others not set', function(done) {
    var cosignerUser = Cosigner3.deployed();
    var cosignerUserChecks = 0;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.setCosignerAddressForUser(cosignerUser.address);
    }).then(function() {
      return cosignerUser.signChecks.call();
    }).then(function(result) {
      cosignerUserChecks = result.toNumber();
      return multiAsset.transfer(accounts[0], 10, SYMBOL);
    }).then(function() {
      return cosignerUser.signChecks.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), cosignerUserChecks + 1);
    }).then(done).catch(done);
  });
  it('should checkSignedHolder on user above others', function(done) {
    //var cosignerAsset = Cosigner1.deployed();
    var cosignerUserAsset = Cosigner2.deployed();
    var cosignerUser = Cosigner3.deployed();
    //var cosignerAssetChecks = 0;
    var cosignerUserAssetChecks = 0;
    var cosignerUserChecks = 0;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
    //  return multiAsset.setCosignerAddressForAsset(cosignerAsset.address, SYMBOL);
    //}).then(function() {
      return multiAsset.setCosignerAddress(cosignerUserAsset.address, SYMBOL);
    }).then(function() {
      return multiAsset.setCosignerAddressForUser(cosignerUser.address);
    }).then(function() {
    //  return cosignerAsset.signChecks.call();
    //}).then(function(result) {
    //  cosignerAssetChecks = result.toNumber();
      return cosignerUserAsset.signChecks.call();
    }).then(function(result) {
      cosignerUserAssetChecks = result.toNumber();
      return cosignerUser.signChecks.call();
    }).then(function(result) {
      cosignerUserChecks = result.toNumber();
      return multiAsset.trust(accounts[2]);
    }).then(function() {
      return multiAsset.recover(accounts[0], accounts[1], {from: accounts[2]});
    }).then(function() {
    //  return cosignerAsset.signChecks.call();
    //}).then(function(result) {
    //  assert.equal(result.valueOf(), cosignerAssetChecks);
      return cosignerUserAsset.signChecks.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), cosignerUserAssetChecks);
      return cosignerUser.signChecks.call();
    }).then(function(result) {
      assert.equal(result.valueOf(), cosignerUserChecks + 1);
    }).then(done).catch(done);
  });
  it('should be possible to do transfer to ICAP', function(done) {
    var icap = RegistryICAP.deployed();
    var _icap = "XE73TSTXREG123456789";
    var watcher;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.setupRegistryICAP(icap.address);
    }).then(function() {
      return icap.registerAsset("TST", SYMBOL);
    }).then(function() {
      return icap.registerInstitution("XREG", accounts[2]);
    }).then(function() {
      return icap.registerInstitutionAsset("TST", "XREG", accounts[2], {from: accounts[2]});
    }).then(function() {
      watcher = eventsHistory.TransferToICAP();
      eventsHelper.setupEvents(eventsHistory);
      return multiAsset.transferToICAP(_icap, 100);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 1);
      assert.equal(events[0].args.from.valueOf(), accounts[0]);
      assert.equal(events[0].args.to.valueOf(), accounts[2]);
      assert.equal(web3.toAscii(events[0].args.icap.valueOf().substr(0, 42)), _icap);
      assert.equal(events[0].args.value.toNumber(), 100);
      assert.equal(events[0].args.reference.valueOf(), "");
    }).then(function() {
      return multiAsset.balanceOf(accounts[2], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 100);
      return multiAsset.balanceOf(accounts[0], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE-100);
    }).then(done).catch(done);
  });
  it('should be possible to do transfer to ICAP with reference', function(done) {
    var icap = RegistryICAP.deployed();
    var _icap = "XE73TSTXREG123456789";
    var watcher;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.setupRegistryICAP(icap.address);
    }).then(function() {
      return icap.registerAsset("TST", SYMBOL);
    }).then(function() {
      return icap.registerInstitution("XREG", accounts[2]);
    }).then(function() {
      return icap.registerInstitutionAsset("TST", "XREG", accounts[2], {from: accounts[2]});
    }).then(function() {
      watcher = eventsHistory.TransferToICAP();
      eventsHelper.setupEvents(eventsHistory);
      return multiAsset.transferToICAPWithReference(_icap, 100, "Ref");
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 1);
      assert.equal(events[0].args.from.valueOf(), accounts[0]);
      assert.equal(events[0].args.to.valueOf(), accounts[2]);
      assert.equal(web3.toAscii(events[0].args.icap.valueOf().substr(0, 42)), _icap);
      assert.equal(events[0].args.value.toNumber(), 100);
      assert.equal(events[0].args.reference.valueOf(), "Ref");
    }).then(function() {
      return multiAsset.balanceOf(accounts[2], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 100);
      return multiAsset.balanceOf(accounts[0], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE-100);
    }).then(done).catch(done);
  });
  it('should be possible to do transfer from to ICAP', function(done) {
    var icap = RegistryICAP.deployed();
    var _icap = "XE73TSTXREG123456789";
    var watcher;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.setupRegistryICAP(icap.address);
    }).then(function() {
      return icap.registerAsset("TST", SYMBOL);
    }).then(function() {
      return icap.registerInstitution("XREG", accounts[2]);
    }).then(function() {
      return icap.registerInstitutionAsset("TST", "XREG", accounts[2], {from: accounts[2]});
    }).then(function() {
      return multiAsset.approve(accounts[1], 200, SYMBOL);
    }).then(function() {
      watcher = eventsHistory.TransferToICAP();
      eventsHelper.setupEvents(eventsHistory);
      return multiAsset.transferFromToICAP(accounts[0], _icap, 100, {from: accounts[1]});
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 1);
      assert.equal(events[0].args.from.valueOf(), accounts[0]);
      assert.equal(events[0].args.to.valueOf(), accounts[2]);
      assert.equal(web3.toAscii(events[0].args.icap.valueOf().substr(0, 42)), _icap);
      assert.equal(events[0].args.value.toNumber(), 100);
      assert.equal(events[0].args.reference.valueOf(), "");
    }).then(function() {
      return multiAsset.balanceOf(accounts[2], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 100);
      return multiAsset.balanceOf(accounts[0], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE-100);
      return multiAsset.allowance(accounts[0], accounts[1], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 100);
    }).then(done).catch(done);
  });
  it('should be possible to do transfer from to ICAP with reference', function(done) {
    var icap = RegistryICAP.deployed();
    var _icap = "XE73TSTXREG123456789";
    var watcher;
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.setupRegistryICAP(icap.address);
    }).then(function() {
      return icap.registerAsset("TST", SYMBOL);
    }).then(function() {
      return icap.registerInstitution("XREG", accounts[2]);
    }).then(function() {
      return icap.registerInstitutionAsset("TST", "XREG", accounts[2], {from: accounts[2]});
    }).then(function() {
      return multiAsset.approve(accounts[1], 200, SYMBOL);
    }).then(function() {
      watcher = eventsHistory.TransferToICAP();
      eventsHelper.setupEvents(eventsHistory);
      return multiAsset.transferFromToICAPWithReference(accounts[0], _icap, 100, "Ref", {from: accounts[1]});
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 1);
      assert.equal(events[0].args.from.valueOf(), accounts[0]);
      assert.equal(events[0].args.to.valueOf(), accounts[2]);
      assert.equal(web3.toAscii(events[0].args.icap.valueOf().substr(0, 42)), _icap);
      assert.equal(events[0].args.value.toNumber(), 100);
      assert.equal(events[0].args.reference.valueOf(), "Ref");
    }).then(function() {
      return multiAsset.balanceOf(accounts[2], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 100);
      return multiAsset.balanceOf(accounts[0], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE-100);
      return multiAsset.allowance(accounts[0], accounts[1], SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 100);
    }).then(done).catch(done);
  });

  it('should not be possible to do proxy transfer recursively when doing transfer', function(done) {
    var icap = RegistryICAP.deployed();
    var _icap = "XE73TSTXREG123456789";
    var holder = accounts[0];
    var holder2 = accounts[1];
    var amount = 1;
    var recursiveAttackAsset = RecursiveAttackAsset.deployed();
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.setupRegistryICAP(icap.address);
    }).then(function() {
      return icap.registerAsset("TST", SYMBOL);
    }).then(function() {
      return icap.registerInstitution("XREG", accounts[2]);
    }).then(function() {
      return icap.registerInstitutionAsset("TST", "XREG", recursiveAttackAsset.address, {from: accounts[2]});
    }).then(function() {
      return multiAsset.setProxy(recursiveAttackAsset.address, true, SYMBOL);
    }).then(function() {
      return multiAsset.setEventsProxy(recursiveAttackAsset.address, SYMBOL);
    }).then(function() {
      return recursiveAttackAsset.init(multiAsset.address, SYMBOL);
    }).then(function() {
      return recursiveAttackAsset.setIcap(_icap);
    }).then(function() {
      return multiAsset.transfer(holder2, amount, SYMBOL);
    }).then(function() {
      return multiAsset.balanceOf.call(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - amount);
      return multiAsset.balanceOf.call(recursiveAttackAsset.address, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.allowance.call(holder, recursiveAttackAsset.address, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.cosigners.call(sha3(bytes32(1), SYMBOL));
    }).then(function(result) {
      assert.equal(result.valueOf(), ADDRESS_ZERO);
    }).then(done).catch(done);
  });
  it('should not be possible to do proxy transfer recursively when doing approve', function(done) {
    var icap = RegistryICAP.deployed();
    var _icap = "XE73TSTXREG123456789";
    var holder = accounts[0];
    var holder2 = accounts[1];
    var amount = 1;
    var recursiveAttackAsset = RecursiveAttackAsset.deployed();
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.setupRegistryICAP(icap.address);
    }).then(function() {
      return icap.registerAsset("TST", SYMBOL);
    }).then(function() {
      return icap.registerInstitution("XREG", accounts[2]);
    }).then(function() {
      return icap.registerInstitutionAsset("TST", "XREG", recursiveAttackAsset.address, {from: accounts[2]});
    }).then(function() {
      return multiAsset.setProxy(recursiveAttackAsset.address, true, SYMBOL);
    }).then(function() {
      return multiAsset.setEventsProxy(recursiveAttackAsset.address, SYMBOL);
    }).then(function() {
      return recursiveAttackAsset.init(multiAsset.address, SYMBOL);
    }).then(function() {
      return recursiveAttackAsset.setIcap(_icap);
    }).then(function() {
      return multiAsset.approve(holder2, amount, SYMBOL);
    }).then(function() {
      return multiAsset.allowance.call(holder, holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return multiAsset.balanceOf.call(recursiveAttackAsset.address, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.allowance.call(holder, recursiveAttackAsset.address, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.cosigners.call(sha3(bytes32(1), SYMBOL));
    }).then(function(result) {
      assert.equal(result.valueOf(), ADDRESS_ZERO);
    }).then(done).catch(done);
  });
  it('should not throw on failed emit transfer by default', function(done) {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var amount = 1;
    var exceptionAttackAsset = ExceptionAttackAsset.deployed();
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.setProxy(exceptionAttackAsset.address, true, SYMBOL);
    }).then(function() {
      return multiAsset.setEventsProxy(exceptionAttackAsset.address, SYMBOL);
    }).then(function() {
      return exceptionAttackAsset.init(multiAsset.address, SYMBOL);
    }).then(function() {
      return multiAsset.transfer(holder2, amount, SYMBOL);
    }).then(function() {
      return multiAsset.balanceOf.call(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - amount);
    }).then(done).catch(done);
  });
  it('should throw on failed emit transfer if call stack depth limit reached', function(done) {
    var holder = userContract.address;
    var holder2 = accounts[1];
    var amount = 1;
    var dummyAsset = DummyAsset.deployed();
    userContract.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return userContract.setProxy(dummyAsset.address, true, SYMBOL);
    }).then(function() {
      return userContract.setEventsProxy(dummyAsset.address, SYMBOL);
    }).then(function() {
      // Might be unstable due to: https://github.com/ethereumjs/testrpc/issues/115
      return userContractPure.callStackDepthAttack(1, multiAssetAbi.transfer.getData(holder2, amount, SYMBOL));
    }).then(function() {
      return multiAsset.balanceOf.call(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it.skip('should emit transfer if call stack depth limit is not reached', function(done) {
    var holder = userContract.address;
    var holder2 = accounts[1];
    var amount = 1;
    var dummyAsset = DummyAsset.deployed();
    userContract.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return userContract.setProxy(dummyAsset.address, true, SYMBOL);
    }).then(function() {
      return userContract.setEventsProxy(dummyAsset.address, SYMBOL);
    }).then(function() {
      // Might be unstable due to: https://github.com/ethereumjs/testrpc/issues/115
      return userContractPure.callStackDepthAttack(2, multiAssetAbi.transfer.getData(holder2, amount, SYMBOL));
    }).then(function() {
      return multiAsset.balanceOf.call(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - amount);
    }).then(done).catch(done);
  });
  it('should not throw on failed emit approve by default', function(done) {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var amount = 1;
    var exceptionAttackAsset = ExceptionAttackAsset.deployed();
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.setProxy(exceptionAttackAsset.address, true, SYMBOL);
    }).then(function() {
      return multiAsset.setEventsProxy(exceptionAttackAsset.address, SYMBOL);
    }).then(function() {
      return exceptionAttackAsset.init(multiAsset.address, SYMBOL);
    }).then(function() {
      return multiAsset.approve(holder2, amount, SYMBOL);
    }).then(function() {
      return multiAsset.allowance.call(holder, holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should throw on failed emit approve if call stack depth limit reached', function(done) {
    var holder = userContract.address;
    var holder2 = accounts[1];
    var amount = 1;
    var dummyAsset = DummyAsset.deployed();
    userContract.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return userContract.setProxy(dummyAsset.address, true, SYMBOL);
    }).then(function() {
      return userContract.setEventsProxy(dummyAsset.address, SYMBOL);
    }).then(function() {
      // Might be unstable due to: https://github.com/ethereumjs/testrpc/issues/115
      return userContractPure.callStackDepthAttack(0, multiAssetAbi.approve.getData(holder2, amount, SYMBOL));
    }).then(function() {
      return multiAsset.allowance.call(holder, holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
  it('should emit approve if call stack depth limit is not reached', function(done) {
    var holder = userContract.address;
    var holder2 = accounts[1];
    var amount = 1;
    var dummyAsset = DummyAsset.deployed();
    userContract.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return userContract.setProxy(dummyAsset.address, true, SYMBOL);
    }).then(function() {
      return userContract.setEventsProxy(dummyAsset.address, SYMBOL);
    }).then(function() {
      // Might be unstable due to: https://github.com/ethereumjs/testrpc/issues/115
      return userContractPure.callStackDepthAttack(1, multiAssetAbi.approve.getData(holder2, amount, SYMBOL));
    }).then(function() {
      return multiAsset.allowance.call(holder, holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
    }).then(done).catch(done);
  });
  it('should throw on failed emit transfer if configured', function(done) {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var amount = 1;
    var throwOnFailedEmit = true;
    var exceptionAttackAsset = ExceptionAttackAsset.deployed();
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.setProxy(exceptionAttackAsset.address, true, SYMBOL);
    }).then(function() {
      return multiAsset.setEventsProxy(exceptionAttackAsset.address, SYMBOL);
    }).then(function() {
      return multiAsset.setProxyConf(false, throwOnFailedEmit, SYMBOL);
    }).then(function() {
      return exceptionAttackAsset.init(multiAsset.address, SYMBOL);
    }).then(function() {
      return multiAsset.transfer(holder2, amount, SYMBOL);
    }).then(assert.fail, function() {
      return multiAsset.balanceOf.call(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return multiAsset.balanceOf.call(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    }).then(done).catch(done);
  });
  it('should throw on failed emit approve if configured', function(done) {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var amount = 1;
    var throwOnFailedEmit = true;
    var exceptionAttackAsset = ExceptionAttackAsset.deployed();
    multiAsset.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE).then(function() {
      return multiAsset.setProxy(exceptionAttackAsset.address, true, SYMBOL);
    }).then(function() {
      return multiAsset.setEventsProxy(exceptionAttackAsset.address, SYMBOL);
    }).then(function() {
      return multiAsset.setProxyConf(false, throwOnFailedEmit, SYMBOL);
    }).then(function() {
      return exceptionAttackAsset.init(multiAsset.address, SYMBOL);
    }).then(function() {
      return multiAsset.approve(holder2, amount, SYMBOL);
    }).then(assert.fail, function() {
      return multiAsset.allowance.call(holder, holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    }).then(done).catch(done);
  });
});