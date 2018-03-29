// Factory "morphs" into a Pudding class.
// The reasoning is that calling load in each context
// is cumbersome.

(function() {

  var contract_data = {
    abi: [{"constant":false,"inputs":[{"name":"_stackDepthLib","type":"address"}],"name":"setupStackDepthLib","outputs":[{"name":"","type":"bool"}],"type":"function"}],
    binary: "60606040526000805460a060020a60ff02191681556082908190602190396000f3606060405260e060020a600035046312ab72428114601a575b005b60676004356000805473ffffffffffffffffffffffffffffffffffffffff1680821415607b5750506000805473ffffffffffffffffffffffffffffffffffffffff1916821790556001607d565b604080519115158252519081900360200190f35b505b91905056",
    unlinked_binary: "60606040526000805460a060020a60ff02191681556082908190602190396000f3606060405260e060020a600035046312ab72428114601a575b005b60676004356000805473ffffffffffffffffffffffffffffffffffffffff1680821415607b5750506000805473ffffffffffffffffffffffffffffffffffffffff1916821790556001607d565b604080519115158252519081900360200190f35b505b91905056",
    address: "",
    generated_with: "2.0.9",
    contract_name: "Safe"
  };

  function Contract() {
    if (Contract.Pudding == null) {
      throw new Error("Safe error: Please call load() first before creating new instance of this contract.");
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
      throw new Error("Safe error: Please call load() first before calling new().");
    }

    return Contract.Pudding.new.apply(Contract, arguments);
  };

  Contract.at = function() {
    if (Contract.Pudding == null) {
      throw new Error("Safe error: Please call load() first before calling at().");
    }

    return Contract.Pudding.at.apply(Contract, arguments);
  };

  Contract.deployed = function() {
    if (Contract.Pudding == null) {
      throw new Error("Safe error: Please call load() first before calling deployed().");
    }

    return Contract.Pudding.deployed.apply(Contract, arguments);
  };

  if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = Contract;
  } else {
    // There will only be one version of Pudding in the browser,
    // and we can use that.
    window.Safe = Contract;
  }

})();
