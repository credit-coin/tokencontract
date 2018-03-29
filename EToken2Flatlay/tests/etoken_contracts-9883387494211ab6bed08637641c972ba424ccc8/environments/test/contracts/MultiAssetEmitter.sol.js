// Factory "morphs" into a Pudding class.
// The reasoning is that calling load in each context
// is cumbersome.

(function() {

  var contract_data = {
    abi: [{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_symbol","type":"bytes32"},{"name":"_value","type":"uint256"},{"name":"_reference","type":"string"}],"name":"emitTransfer","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_symbol","type":"bytes32"}],"name":"emitOwnershipChange","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_symbol","type":"bytes32"},{"name":"_value","type":"uint256"},{"name":"_by","type":"address"}],"name":"emitIssue","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_symbol","type":"bytes32"},{"name":"_value","type":"uint256"},{"name":"_by","type":"address"}],"name":"emitRevoke","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_spender","type":"address"},{"name":"_symbol","type":"bytes32"},{"name":"_value","type":"uint256"}],"name":"emitApprove","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_message","type":"bytes32"}],"name":"emitError","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_by","type":"address"}],"name":"emitRecovery","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_icap","type":"bytes32"},{"name":"_value","type":"uint256"},{"name":"_reference","type":"string"}],"name":"emitTransferToICAP","outputs":[],"type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":true,"name":"symbol","type":"bytes32"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"reference","type":"string"},{"indexed":false,"name":"version","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"symbol","type":"bytes32"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"by","type":"address"},{"indexed":false,"name":"version","type":"uint256"}],"name":"Issue","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"symbol","type":"bytes32"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"by","type":"address"},{"indexed":false,"name":"version","type":"uint256"}],"name":"Revoke","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":true,"name":"symbol","type":"bytes32"},{"indexed":false,"name":"version","type":"uint256"}],"name":"OwnershipChange","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":true,"name":"symbol","type":"bytes32"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"version","type":"uint256"}],"name":"Approve","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"by","type":"address"},{"indexed":false,"name":"version","type":"uint256"}],"name":"Recovery","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":true,"name":"icap","type":"bytes32"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"reference","type":"string"},{"indexed":false,"name":"version","type":"uint256"}],"name":"TransferToICAP","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"message","type":"bytes32"},{"indexed":false,"name":"version","type":"uint256"}],"name":"Error","type":"event"}],
    binary: "6060604052610480806100126000396000f36503063fc68da550606060405236156100745760e060020a6000350463515c14578114610079578063a9612f7214610157578063abafaa161461019b578063c70bbc13146101d3578063d54c8c871461020b578063e90459f814610253578063ea14457e14610283578063eacbc236146102cd575b610007565b604080516020601f608435600481810135928301849004840285018401909552818452610358948035946024803595604435956064359560a494930191819084018382808284375094965050505050505082600160a060020a038581169087167f940c4b3549ef0aaff95807dc27f62d88ca15532d1bf535d7d63800f40395d16c858561035a5b600030600160a060020a031663488725a0336040518260e060020a0281526004018082600160a060020a031681526020019150506020604051808303816000876161da5a03f1156100075750506040515191505090565b61035860043560243560443580600160a060020a038381169085167fa036716ab3217ba2d7f6383a8920773cfbc7185b3067a4a21976874bd6054c876103dc610100565b610358600435602435604435827f714f05963641b102fcb29deecd03fea4afc12aaae3cd7406997aded1d73c668683836103f2610100565b610358600435602435604435827f21195415ad67207115fc69a0e6ee5f2e2bdb4751d3735084da4d1874c41f216383836103f2610100565b61035860043560243560443560643581600160a060020a038481169086167f389385fc5633d833d54b67ef0b0b6f5d82b17f93ecc47a4912173ddbb63e37458461041d610100565b6103586004357f8ad05dce3378dc14d17bd145d839c5206f23b9fab3f6d3abee1906c086d256618161043b610100565b61035860043560243560443581600160a060020a031683600160a060020a03167fd38446e28363d997bb622c062a6547eec58c45aaa846edce4ad14ebd982e1d9d83610456610100565b604080516020601f608435600481810135928301849004840285018401909552818452610358948035946024803595604435956064359560a494930191819084018382808284375094965050505050505082600160a060020a038581169087167f8a95e3fbb777c23aeda3e2d69b9b9859e67501dfa72116a1c4e7749d29b0a7cb858561035a610100565b005b60405180848152602001806020018381526020018281038252848181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f1680156103c65780820380516001836020036101000a031916815260200191505b5094505050505060405180910390a45050505050565b60408051918252519081900360200190a4505050565b60408051938452600160a060020a0392909216602084015282820152519081900360600190a2505050565b6040805192835260208301919091528051918290030190a450505050565b6040805192835260208301919091528051918290030190a150565b6040518083600160a060020a031681526020018281526020019250505060405180910390a350505056",
    unlinked_binary: "6060604052610480806100126000396000f36503063fc68da550606060405236156100745760e060020a6000350463515c14578114610079578063a9612f7214610157578063abafaa161461019b578063c70bbc13146101d3578063d54c8c871461020b578063e90459f814610253578063ea14457e14610283578063eacbc236146102cd575b610007565b604080516020601f608435600481810135928301849004840285018401909552818452610358948035946024803595604435956064359560a494930191819084018382808284375094965050505050505082600160a060020a038581169087167f940c4b3549ef0aaff95807dc27f62d88ca15532d1bf535d7d63800f40395d16c858561035a5b600030600160a060020a031663488725a0336040518260e060020a0281526004018082600160a060020a031681526020019150506020604051808303816000876161da5a03f1156100075750506040515191505090565b61035860043560243560443580600160a060020a038381169085167fa036716ab3217ba2d7f6383a8920773cfbc7185b3067a4a21976874bd6054c876103dc610100565b610358600435602435604435827f714f05963641b102fcb29deecd03fea4afc12aaae3cd7406997aded1d73c668683836103f2610100565b610358600435602435604435827f21195415ad67207115fc69a0e6ee5f2e2bdb4751d3735084da4d1874c41f216383836103f2610100565b61035860043560243560443560643581600160a060020a038481169086167f389385fc5633d833d54b67ef0b0b6f5d82b17f93ecc47a4912173ddbb63e37458461041d610100565b6103586004357f8ad05dce3378dc14d17bd145d839c5206f23b9fab3f6d3abee1906c086d256618161043b610100565b61035860043560243560443581600160a060020a031683600160a060020a03167fd38446e28363d997bb622c062a6547eec58c45aaa846edce4ad14ebd982e1d9d83610456610100565b604080516020601f608435600481810135928301849004840285018401909552818452610358948035946024803595604435956064359560a494930191819084018382808284375094965050505050505082600160a060020a038581169087167f8a95e3fbb777c23aeda3e2d69b9b9859e67501dfa72116a1c4e7749d29b0a7cb858561035a610100565b005b60405180848152602001806020018381526020018281038252848181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f1680156103c65780820380516001836020036101000a031916815260200191505b5094505050505060405180910390a45050505050565b60408051918252519081900360200190a4505050565b60408051938452600160a060020a0392909216602084015282820152519081900360600190a2505050565b6040805192835260208301919091528051918290030190a450505050565b6040805192835260208301919091528051918290030190a150565b6040518083600160a060020a031681526020018281526020019250505060405180910390a350505056",
    address: "0xf81697aba996cad166c5cc65bc2f369e9e82555d",
    generated_with: "2.0.9",
    contract_name: "MultiAssetEmitter"
  };

  function Contract() {
    if (Contract.Pudding == null) {
      throw new Error("MultiAssetEmitter error: Please call load() first before creating new instance of this contract.");
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
      throw new Error("MultiAssetEmitter error: Please call load() first before calling new().");
    }

    return Contract.Pudding.new.apply(Contract, arguments);
  };

  Contract.at = function() {
    if (Contract.Pudding == null) {
      throw new Error("MultiAssetEmitter error: Please call load() first before calling at().");
    }

    return Contract.Pudding.at.apply(Contract, arguments);
  };

  Contract.deployed = function() {
    if (Contract.Pudding == null) {
      throw new Error("MultiAssetEmitter error: Please call load() first before calling deployed().");
    }

    return Contract.Pudding.deployed.apply(Contract, arguments);
  };

  if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = Contract;
  } else {
    // There will only be one version of Pudding in the browser,
    // and we can use that.
    window.MultiAssetEmitter = Contract;
  }

})();
