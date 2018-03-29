// Factory "morphs" into a Pudding class.
// The reasoning is that calling load in each context
// is cumbersome.

(function() {

  var contract_data = {
    abi: [{"constant":true,"inputs":[{"name":"_symbol","type":"bytes32"}],"name":"owner","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"_from","type":"address"},{"name":"_spender","type":"address"},{"name":"_symbol","type":"bytes32"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"_symbol","type":"bytes32"}],"name":"isCreated","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_holder","type":"address"},{"name":"_symbol","type":"bytes32"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"},{"name":"_symbol","type":"bytes32"}],"name":"proxyApprove","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_symbol","type":"bytes32"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_symbol","type":"bytes32"},{"name":"_reference","type":"string"}],"name":"proxyTransferWithReference","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_symbol","type":"bytes32"}],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_icap","type":"bytes32"},{"name":"_value","type":"uint256"},{"name":"_reference","type":"string"}],"name":"proxyTransferToICAPWithReference","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_address","type":"address"},{"name":"_symbol","type":"bytes32"}],"name":"proxySetCosignerAddress","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_icap","type":"bytes32"},{"name":"_value","type":"uint256"},{"name":"_reference","type":"string"}],"name":"proxyTransferFromToICAPWithReference","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_symbol","type":"bytes32"},{"name":"_reference","type":"string"}],"name":"proxyTransferFromWithReference","outputs":[{"name":"","type":"bool"}],"type":"function"}],
    binary: "",
    unlinked_binary: "",
    address: "",
    generated_with: "2.0.9",
    contract_name: "MultiAssetInterface"
  };

  function Contract() {
    if (Contract.Pudding == null) {
      throw new Error("MultiAssetInterface error: Please call load() first before creating new instance of this contract.");
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
      throw new Error("MultiAssetInterface error: Please call load() first before calling new().");
    }

    return Contract.Pudding.new.apply(Contract, arguments);
  };

  Contract.at = function() {
    if (Contract.Pudding == null) {
      throw new Error("MultiAssetInterface error: Please call load() first before calling at().");
    }

    return Contract.Pudding.at.apply(Contract, arguments);
  };

  Contract.deployed = function() {
    if (Contract.Pudding == null) {
      throw new Error("MultiAssetInterface error: Please call load() first before calling deployed().");
    }

    return Contract.Pudding.deployed.apply(Contract, arguments);
  };

  if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = Contract;
  } else {
    // There will only be one version of Pudding in the browser,
    // and we can use that.
    window.MultiAssetInterface = Contract;
  }

})();
