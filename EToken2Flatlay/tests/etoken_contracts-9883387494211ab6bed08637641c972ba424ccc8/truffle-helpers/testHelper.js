var TestHelper = function() {
  // Convert number to 32 bytes hex representation.
  this.bytes32 = function(stringOrNumber) {
    var zeros = '000000000000000000000000000000000000000000000000000000000000000';
    if (typeof stringOrNumber === "string") {
      return (web3.toHex(stringOrNumber) + zeros).substr(0, 66);
    }
    var hexNumber = stringOrNumber.toString(16);
    return '0x' + (zeros + hexNumber).substring(hexNumber.length - 1);
  };

  // Represents `sha3` function from Solidity.
  this.sha3 = function() {
    var str = "";
    for (var i = 0; i < arguments.length; i++) {
      var hex = web3.toHex(arguments[i]).substr(2);  
      str += hex.length % 2 !== 0 ? "0" + hex : hex;
    }
    return "0x" + web3.sha3(str, {encoding: 'hex'});
  };
};

module.exports = new TestHelper();