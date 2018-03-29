// Factory "morphs" into a Pudding class.
// The reasoning is that calling load in each context
// is cumbersome.

(function() {

  var contract_data = {
    abi: [{"constant":true,"inputs":[{"name":"_symbol","type":"bytes32"}],"name":"allowances","outputs":[{"name":"","type":"bytes32"}],"type":"function"},{"constant":true,"inputs":[{"name":"_symbol","type":"bytes32"}],"name":"icap","outputs":[{"name":"","type":"bytes32"}],"type":"function"},{"constant":true,"inputs":[{"name":"_symbol","type":"bytes32"}],"name":"changeOwnership","outputs":[{"name":"","type":"bytes32"}],"type":"function"},{"constant":true,"inputs":[{"name":"_symbol","type":"bytes32"},{"name":"_isReissuable","type":"bool"}],"name":"issue","outputs":[{"name":"","type":"bytes32"}],"type":"function"},{"constant":true,"inputs":[{"name":"_symbol","type":"bytes32"}],"name":"revoke","outputs":[{"name":"","type":"bytes32"}],"type":"function"},{"constant":true,"inputs":[{"name":"_symbol","type":"bytes32"}],"name":"transferWithReference","outputs":[{"name":"","type":"bytes32"}],"type":"function"}],
    binary: "6060604052610192806100126000396000f3606060405236156100565760e060020a60003504635e7c9fe881146100585780638b00717d1461008057806395feb50b146100c3578063ae73b61314610106578063b75c7dc614610144578063df48eef81461016b575b005b6101326004356040805182815260fa60020a602082015290519081900360210190205b919050565b610132600435604080518281527f05000000000000000000000000000000000000000000000000000000000000006020820152905190819003602101902061007b565b610132600435604080518281527f03000000000000000000000000000000000000000000000000000000000000006020820152905190819003602101902061007b565b604080516004358152602435151560f860020a0260208201526000602182015290519081900360220190205b60408051918252519081900360200190f35b6101326004356040805182815260f960020a6020820152905190819003602101902061007b565b6101326004356040805182815260f860020a6020820152905190819003602101902061007b56",
    unlinked_binary: "6060604052610192806100126000396000f3606060405236156100565760e060020a60003504635e7c9fe881146100585780638b00717d1461008057806395feb50b146100c3578063ae73b61314610106578063b75c7dc614610144578063df48eef81461016b575b005b6101326004356040805182815260fa60020a602082015290519081900360210190205b919050565b610132600435604080518281527f05000000000000000000000000000000000000000000000000000000000000006020820152905190819003602101902061007b565b610132600435604080518281527f03000000000000000000000000000000000000000000000000000000000000006020820152905190819003602101902061007b565b604080516004358152602435151560f860020a0260208201526000602182015290519081900360220190205b60408051918252519081900360200190f35b6101326004356040805182815260f960020a6020820152905190819003602101902061007b565b6101326004356040805182815260f860020a6020820152905190819003602101902061007b56",
    address: "",
    generated_with: "2.0.9",
    contract_name: "MultiAssetSwitches"
  };

  function Contract() {
    if (Contract.Pudding == null) {
      throw new Error("MultiAssetSwitches error: Please call load() first before creating new instance of this contract.");
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
      throw new Error("MultiAssetSwitches error: Please call load() first before calling new().");
    }

    return Contract.Pudding.new.apply(Contract, arguments);
  };

  Contract.at = function() {
    if (Contract.Pudding == null) {
      throw new Error("MultiAssetSwitches error: Please call load() first before calling at().");
    }

    return Contract.Pudding.at.apply(Contract, arguments);
  };

  Contract.deployed = function() {
    if (Contract.Pudding == null) {
      throw new Error("MultiAssetSwitches error: Please call load() first before calling deployed().");
    }

    return Contract.Pudding.deployed.apply(Contract, arguments);
  };

  if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = Contract;
  } else {
    // There will only be one version of Pudding in the browser,
    // and we can use that.
    window.MultiAssetSwitches = Contract;
  }

})();
