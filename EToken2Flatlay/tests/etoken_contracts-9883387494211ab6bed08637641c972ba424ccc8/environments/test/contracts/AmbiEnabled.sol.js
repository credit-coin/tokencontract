// Factory "morphs" into a Pudding class.
// The reasoning is that calling load in each context
// is cumbersome.

(function() {

  var contract_data = {
    abi: [{"constant":false,"inputs":[{"name":"_name","type":"bytes32"}],"name":"getAddress","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"index","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_addr","type":"address"}],"name":"setAddress","outputs":[],"type":"function"}],
    binary: "606060405260bb8060106000396000f3606060405260e060020a600035046321f8a7218114602e5780635250fec7146067578063ca446dd9146087575b005b600435600090815260208190526040902054600160a060020a03165b60408051600160a060020a03929092168252519081900360200190f35b604a600435600060208190529081526040902054600160a060020a031681565b6004356000908152602081905260409020805473ffffffffffffffffffffffffffffffffffffffff1916602435179055602c56",
    unlinked_binary: "606060405260bb8060106000396000f3606060405260e060020a600035046321f8a7218114602e5780635250fec7146067578063ca446dd9146087575b005b600435600090815260208190526040902054600160a060020a03165b60408051600160a060020a03929092168252519081900360200190f35b604a600435600060208190529081526040902054600160a060020a031681565b6004356000908152602081905260409020805473ffffffffffffffffffffffffffffffffffffffff1916602435179055602c56",
    address: "",
    generated_with: "2.0.9",
    contract_name: "AmbiEnabled"
  };

  function Contract() {
    if (Contract.Pudding == null) {
      throw new Error("AmbiEnabled error: Please call load() first before creating new instance of this contract.");
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
      throw new Error("AmbiEnabled error: Please call load() first before calling new().");
    }

    return Contract.Pudding.new.apply(Contract, arguments);
  };

  Contract.at = function() {
    if (Contract.Pudding == null) {
      throw new Error("AmbiEnabled error: Please call load() first before calling at().");
    }

    return Contract.Pudding.at.apply(Contract, arguments);
  };

  Contract.deployed = function() {
    if (Contract.Pudding == null) {
      throw new Error("AmbiEnabled error: Please call load() first before calling deployed().");
    }

    return Contract.Pudding.deployed.apply(Contract, arguments);
  };

  if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = Contract;
  } else {
    // There will only be one version of Pudding in the browser,
    // and we can use that.
    window.AmbiEnabled = Contract;
  }

})();
