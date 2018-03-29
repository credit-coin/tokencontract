// Factory "morphs" into a Pudding class.
// The reasoning is that calling load in each context
// is cumbersome.

(function() {

  var contract_data = {
    abi: [{"constant":true,"inputs":[{"name":"n","type":"uint256"}],"name":"__dig","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"self","type":"address"},{"name":"n","type":"uint256"}],"name":"checkDepth","outputs":[{"name":"","type":"bool"}],"type":"function"}],
    binary: "6060604052610130806100126000396000f36503063fc68da550606060405260e060020a600035046321835af681146100315780633292169014610044575b610007565b6100606004358060001415610076575b50565b610062600435602435600081600014156100d65750600161012a565b005b604080519115158252519081900360200190f35b3073ffffffffffffffffffffffffffffffffffffffff166321835af6600183036040518260e060020a028152600401808281526020019150506020604051808303818660325a03f415610007575050604051511515905061004157610007565b8273ffffffffffffffffffffffffffffffffffffffff1682610190026321835af690600185036040518360e060020a0281526004018082815260200191505060006040518083038160008887f19450505050505b9291505056",
    unlinked_binary: "6060604052610130806100126000396000f36503063fc68da550606060405260e060020a600035046321835af681146100315780633292169014610044575b610007565b6100606004358060001415610076575b50565b610062600435602435600081600014156100d65750600161012a565b005b604080519115158252519081900360200190f35b3073ffffffffffffffffffffffffffffffffffffffff166321835af6600183036040518260e060020a028152600401808281526020019150506020604051808303818660325a03f415610007575050604051511515905061004157610007565b8273ffffffffffffffffffffffffffffffffffffffff1682610190026321835af690600185036040518360e060020a0281526004018082815260200191505060006040518083038160008887f19450505050505b9291505056",
    address: "0x568079da43f2c2515ac21fdb107ca058fb7d00f4",
    generated_with: "2.0.9",
    contract_name: "StackDepthLib"
  };

  function Contract() {
    if (Contract.Pudding == null) {
      throw new Error("StackDepthLib error: Please call load() first before creating new instance of this contract.");
    }

    Contract.Pudding.apply(this, arguments);
  };

  Contract.load = function(Pudding) {
    Contract.Pudding = Pudding;

    Pudding.whisk(contract_data, Contract);

    // Return itself for backwards compatibility.
    return Contract;
  }

  Contract.new = function() {
    if (Contract.Pudding == null) {
      throw new Error("StackDepthLib error: Please call load() first before calling new().");
    }

    return Contract.Pudding.new.apply(Contract, arguments);
  };

  Contract.at = function() {
    if (Contract.Pudding == null) {
      throw new Error("StackDepthLib error: Please call load() first before calling at().");
    }

    return Contract.Pudding.at.apply(Contract, arguments);
  };

  Contract.deployed = function() {
    if (Contract.Pudding == null) {
      throw new Error("StackDepthLib error: Please call load() first before calling deployed().");
    }

    return Contract.Pudding.deployed.apply(Contract, arguments);
  };

  if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = Contract;
  } else {
    // There will only be one version of Pudding in the browser,
    // and we can use that.
    window.StackDepthLib = Contract;
  }

})();
