// Factory "morphs" into a Pudding class.
// The reasoning is that calling load in each context
// is cumbersome.

(function() {

  var contract_data = {
    abi: [{"constant":false,"inputs":[{"name":"","type":"bytes32"}],"name":"isSigned","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"signChecks","outputs":[{"name":"","type":"uint256"}],"type":"function"}],
    binary: "606060405260438060106000396000f3606060405260e060020a60003504630a25035b81146024578063aab9af6714603b575b005b6000805460019081019091555b6060908152602090f35b60316000548156",
    unlinked_binary: "606060405260438060106000396000f3606060405260e060020a60003504630a25035b81146024578063aab9af6714603b575b005b6000805460019081019091555b6060908152602090f35b60316000548156",
    address: "0x6514b9864a175034882bfcab958dfe0fefa320ae",
    generated_with: "2.0.9",
    contract_name: "Cosigner3"
  };

  function Contract() {
    if (Contract.Pudding == null) {
      throw new Error("Cosigner3 error: Please call load() first before creating new instance of this contract.");
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
      throw new Error("Cosigner3 error: Please call load() first before calling new().");
    }

    return Contract.Pudding.new.apply(Contract, arguments);
  };

  Contract.at = function() {
    if (Contract.Pudding == null) {
      throw new Error("Cosigner3 error: Please call load() first before calling at().");
    }

    return Contract.Pudding.at.apply(Contract, arguments);
  };

  Contract.deployed = function() {
    if (Contract.Pudding == null) {
      throw new Error("Cosigner3 error: Please call load() first before calling deployed().");
    }

    return Contract.Pudding.deployed.apply(Contract, arguments);
  };

  if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = Contract;
  } else {
    // There will only be one version of Pudding in the browser,
    // and we can use that.
    window.Cosigner3 = Contract;
  }

})();
