// Factory "morphs" into a Pudding class.
// The reasoning is that calling load in each context
// is cumbersome.

(function() {

  var contract_data = {
    abi: [{"constant":false,"inputs":[{"name":"_stackDepthLib","type":"address"}],"name":"setupStackDepthLib","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"}],"name":"getAddress","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"_institution","type":"bytes32"}],"name":"addr","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"_icap","type":"bytes32"}],"name":"parse","outputs":[{"name":"","type":"address"},{"name":"","type":"bytes32"},{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"index","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"registered","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_institution","type":"string"},{"name":"_address","type":"address"}],"name":"changeInstitutionOwner","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_asset","type":"string"},{"name":"_institution","type":"string"},{"name":"_address","type":"address"}],"name":"updateInstitutionAsset","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_asset","type":"string"},{"name":"_symbol","type":"bytes32"}],"name":"registerAsset","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_asset","type":"string"},{"name":"_institution","type":"string"},{"name":"_address","type":"address"}],"name":"registerInstitutionAsset","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"institutions","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"assets","outputs":[{"name":"","type":"bytes32"}],"type":"function"},{"constant":false,"inputs":[{"name":"_institution","type":"string"},{"name":"_address","type":"address"}],"name":"registerInstitution","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"institutionOwners","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_addr","type":"address"}],"name":"setAddress","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_asset","type":"string"},{"name":"_institution","type":"string"}],"name":"removeInstitutionAsset","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_bban","type":"bytes"}],"name":"prepare","outputs":[{"name":"","type":"bytes"}],"type":"function"},{"constant":true,"inputs":[{"name":"_prepared","type":"bytes"}],"name":"mod9710","outputs":[{"name":"","type":"uint8"}],"type":"function"},{"constant":true,"inputs":[{"name":"_bban","type":"bytes"}],"name":"decodeIndirect","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"}],"type":"function"}],
    binary: "60606040526001805460a060020a60ff0219169055611722806100226000396000f3606060405236156100e55760e060020a600035046312ab724281146100e757806321f8a7211461011d5780633b3b57de146101405780634f71ef81146101ed5780635250fec7146102bd5780635524d548146102de57806365bdfd2e146102f957806367f10e8c146103855780637e32fc47146104265780638f87b78614610489578063958297381461052a5780639fda5b661461054b578063bd23cd3014610563578063c221c620146105c4578063ca446dd9146105e5578063cf82601b14610611578063d7768c47146106b0578063e98c760814610797578063ee9ce0901461083d575b005b6109bb600435600154600090600160a060020a031680821415610bd857505060018054600160a060020a03191682178155610bda565b6109cf600435600081815260208190526040902054600160a060020a0316610bda565b6109cf60043560006003818381505083811a60f860020a028460011a60f860020a028560021a60f860020a0286855050604080517f45544800000000000000000000000000000000000000000000000000000000008152600160f860020a0319948516818801529284166004840152908316600583015286851a60f860020a0290921660068201528151908190036007019020909152602091909152902054600160a060020a0316610bda565b60408051602081810183526000808352835180830185528181528451808401865282815285519384019095528183526109eb9460043594929384938493849391928492908380807f58000000000000000000000000000000000000000000000000000000000000008d821a60f860020a02600160f860020a0319161415806102a9575060018d901a60f860020a02600160f860020a0319167f450000000000000000000000000000000000000000000000000000000000000014155b15610c895760009b508b9a508a9950610c79565b6109cf600435600060208190529081526040902054600160a060020a031681565b6109bb60043560026020526000908152604090205460ff1681565b6109bb6004808035906020019082018035906020019191908080601f01602080910402602001604051908101604052809392919081815260200183838082843750949650509335935050505060006000341115610ecf57610ecf33345b6117178282604051600090600160a060020a0384169083908381818185876185025a03f1925050509050610ec9565b6109bb6004808035906020019082018035906020019191908080601f01602080910402602001604051908101604052809392919081815260200183838082843750506040805160208835808b0135601f81018390048302840183019094528383529799986044989297509190910194509092508291508401838280828437509496505093359350505050600060006000341115610fc557610fc53334610356565b6109bb6004808035906020019082018035906020019191908080601f0160208091040260200160405190810160405280939291908181526020018383808284375094965050933593505050506000600060003411156110f9576110f93334610356565b6109bb6004808035906020019082018035906020019191908080601f01602080910402602001604051908101604052809392919081815260200183838082843750506040805160208835808b0135601f81018390048302840183019094528383529799986044989297509190910194509092508291508401838280828437509496505093359350505050600060006000341115611185576111853334610356565b6109cf600435600360205260009081526040902054600160a060020a031681565b610a1560043560056020526000908152604090205481565b6109bb6004808035906020019082018035906020019191908080601f01602080910402602001604051908101604052809392919081815260200183838082843750949650509335935050505060006000341115611339576113393334610356565b6109cf600435600460205260009081526040902054600160a060020a031681565b6100e560043560243560008281526020819052604090208054600160a060020a031916821790555b5050565b6109bb6004808035906020019082018035906020019191908080601f01602080910402602001604051908101604052809392919081815260200183838082843750506040805160208835808b0135601f8101839004830284018301909452838352979998604498929750919091019450909250829150840183828082843750949650505050505050600060006000341115611447576114473334610356565b610a276004808035906020019082018035906020019191908080601f016020809104026020016040519081016040528093929190818152602001838380828437509496505050505050505b60408051602081019091526000808252805b60108260ff16101561159357838260ff16815181101561000257016020015160f860020a908190048102049050604160ff8216108015906107525750605a8160ff1611155b1561078b5760418103600a0160f860020a02848360ff16815181101561000257906020010190600160f860020a031916908160001a9053505b6001919091019061070d565b610a956004808035906020019082018035906020019191908080601f016020809104026020016040519081016040528093929190818152602001838380828437509496505050505050505b60008080805b60128260ff1610156115f357848260ff16815181101561000257016020015160f860020a908190048102049050603060ff821610611609576061602f19820160ff16600a909402939093019290920691611633565b610aac6004808035906020019082018035906020019191908080601f016020809104026020016040519081016040528093929190818152602001838380828437509496505050505050505b60408051602081810183526000808352835180830185528181528451808401865282815285518085018752838152865180860188528481528751958601885284865296519596929591949093909181906003908059106108e55750595b9080825280602002602001820160405280156108fc575b509450600460405180591061090e5750595b908082528060200260200182016040528015610925575b50935060096040518059106109375750595b90808252806020026020018201604052801561094e575b50925060009150600090505b84518160ff16101561163f57888280600101935060ff1681518110156100025790602001015160f860020a900460f860020a02858260ff16815181101561000257906020010190600160f860020a031916908160001a90535060010161095a565b604080519115158252519081900360200190f35b60408051600160a060020a039092168252519081900360200190f35b60408051600160a060020a0390941684526020840192909252151582820152519081900360600190f35b60408051918252519081900360200190f35b60405180806020018281038252838181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f168015610a875780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6040805160ff929092168252519081900360200190f35b604051808060200180602001806020018481038452878181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f168015610b145780820380516001836020036101000a031916815260200191505b508481038352868181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f168015610b6d5780820380516001836020036101000a031916815260200191505b508481038252858181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f168015610bc65780820380516001836020036101000a031916815260200191505b50965050505050505060405180910390f35b505b919050565b60008381526003602081815260408084205490518a51600160a060020a039092169460059490938c9383928583019282918591839186918b91600491601f86010402600f01f150905001915050604051809103902060001916815260200190815260200160002060005054600260005060008660001916815260200190815260200160002060009054906101000a900460ff169b509b509b505b5050505050505050509193909250565b601498505b60208960ff161015610ccf578c8960ff166020811015610002571a60f860020a02600160f860020a031916600014610d535760009b508b9a508a9950610c79565b6012604051805910610cde5750595b908082528060200260200182016040528015610cf5575b509750600096505b60108760ff161015610d5f578c8760040160ff166020811015610002571a60f860020a02888860ff16815181101561000257906020010190600160f860020a031916908160001a90535060019690960195610cfd565b60019890980197610c8e565b610d6888610888565b9550955095508585604051808380519060200190808383829060006004602084601f0104600302600f01f1509050018280519060200190808383829060006004602084601f0104600302600f01f150905001925050506040518091039020925060308d600360208110156100025760f860020a91901a810204602f1901908e60021a60f860020a0260f860020a900403600a02019150610e0a610e94896106fb565b606203905060ff81811690831614610bdf5760008381526003602081815260408084205490518a51600160a060020a039092169460059490938c9383928583019282918591839186918b91600491601f86010402600f01f15090500191505060405180910390206000191681526020019081526020016000206000505460009b509b509b50610c79565b6107e2565b506000818152600260209081526040808320805460ff19166001908117909155600590925290912084905591505b505b92915050565b826004600050600082604051808280519060200190808383829060006004602084601f0104600302600f01f150905001915050604051809103902060001916815260200190815260200160002060009054906101000a9004600160a060020a0316600160a060020a031633600160a060020a03161415610ec757826004600050600086604051808280519060200190808383829060006004602084601f0104600302600f01f150905001915050604051809103902060001916815260200190815260200160002060006101000a815481600160a060020a03021916908302179055506001915050610ec9565b505b509392505050565b836004600050600082604051808280519060200190808383829060006004602084601f0104600302600f01f150905001915050604051809103902060001916815260200190815260200160002060009054906101000a9004600160a060020a0316600160a060020a031633600160a060020a03161415610fbb578585604051808380519060200190808383829060006004602084601f0104600302600f01f1509050018280519060200190808383829060006004602084601f0104600302600f01f1509050019250505060405180910390209150600260005060008360001916815260200190815260200160002060009054906101000a900460ff1615156110d1576000925050610fbd565b5060008181526003602052604090208054600160a060020a0319168417905560019150610fbd565b835160d960020a6430b236b4b70290600314611119576000925050610ec7565b84604051808280519060200190808383829060006004602084601f0104600302600f01f15090500191505060405180910390209150600260005060008360001916815260200190815260200160002060009054906101000a900460ff1615610e99576000925050610ec7565b836004600050600082604051808280519060200190808383829060006004602084601f0104600302600f01f150905001915050604051809103902060001916815260200190815260200160002060009054906101000a9004600160a060020a0316600160a060020a031633600160a060020a03161415610fbb576002600050600087604051808280519060200190808383829060006004602084601f0104600302600f01f150905001915050604051809103902060001916815260200190815260200160002060009054906101000a900460ff161515611269576000925050610fbd565b8585604051808380519060200190808383829060006004602084601f0104600302600f01f1509050018280519060200190808383829060006004602084601f0104600302600f01f1509050019250505060405180910390209150600260005060008360001916815260200190815260200160002060009054906101000a900460ff16156112fa576000925050610fbd565b506000818152600260209081526040808320805460ff1916600190811790915560039092529091208054600160a060020a031916851790559150610fbd565b825160d960020a6430b236b4b70290600414611359576000915050610ec9565b6004600050600085604051808280519060200190808383829060006004602084601f0104600302600f01f150905001915050604051809103902060001916815260200190815260200160002060009054906101000a9004600160a060020a0316600160a060020a031660001415156113d5576000915050610ec9565b826004600050600086604051808280519060200190808383829060006004602084601f0104600302600f01f150905001915050604051809103902060001916815260200190815260200160002060006101000a815481600160a060020a03021916908302179055506001915050610ec9565b826004600050600082604051808280519060200190808383829060006004602084601f0104600302600f01f150905001915050604051809103902060001916815260200190815260200160002060009054906101000a9004600160a060020a0316600160a060020a031633600160a060020a03161415611553578484604051808380519060200190808383829060006004602084601f0104600302600f01f1509050018280519060200190808383829060006004602084601f0104600302600f01f1509050019250505060405180910390209150600260005060008360001916815260200190815260200160002060009054906101000a900460ff16151561155b576000925050610ec7565b505092915050565b506000818152600260209081526040808320805460ff19169055600390915290208054600160a060020a031916905560019150610ec7565b602160f860020a02846010815181101561000257906020010190600160f860020a031916908160001a905350600e60f860020a02846011815181101561000257906020010190600160f860020a031916908160001a905350929392505050565b50506061600a9182028190069091020692915050565b6061600a60ff83811682810682169083900490911695820295909501829006029390930192909206915b600191909101906107e8565b5060005b83518160ff1610156116a457888280600101935060ff1681518110156100025790602001015160f860020a900460f860020a02848260ff16815181101561000257906020010190600160f860020a031916908160001a905350600101611643565b5060005b82518160ff16101561170957888280600101935060ff1681518110156100025790602001015160f860020a900460f860020a02838260ff16815181101561000257906020010190600160f860020a031916908160001a9053506001016116a8565b509297919650945092505050565b151561060d5761000256",
    unlinked_binary: "60606040526001805460a060020a60ff0219169055611722806100226000396000f3606060405236156100e55760e060020a600035046312ab724281146100e757806321f8a7211461011d5780633b3b57de146101405780634f71ef81146101ed5780635250fec7146102bd5780635524d548146102de57806365bdfd2e146102f957806367f10e8c146103855780637e32fc47146104265780638f87b78614610489578063958297381461052a5780639fda5b661461054b578063bd23cd3014610563578063c221c620146105c4578063ca446dd9146105e5578063cf82601b14610611578063d7768c47146106b0578063e98c760814610797578063ee9ce0901461083d575b005b6109bb600435600154600090600160a060020a031680821415610bd857505060018054600160a060020a03191682178155610bda565b6109cf600435600081815260208190526040902054600160a060020a0316610bda565b6109cf60043560006003818381505083811a60f860020a028460011a60f860020a028560021a60f860020a0286855050604080517f45544800000000000000000000000000000000000000000000000000000000008152600160f860020a0319948516818801529284166004840152908316600583015286851a60f860020a0290921660068201528151908190036007019020909152602091909152902054600160a060020a0316610bda565b60408051602081810183526000808352835180830185528181528451808401865282815285519384019095528183526109eb9460043594929384938493849391928492908380807f58000000000000000000000000000000000000000000000000000000000000008d821a60f860020a02600160f860020a0319161415806102a9575060018d901a60f860020a02600160f860020a0319167f450000000000000000000000000000000000000000000000000000000000000014155b15610c895760009b508b9a508a9950610c79565b6109cf600435600060208190529081526040902054600160a060020a031681565b6109bb60043560026020526000908152604090205460ff1681565b6109bb6004808035906020019082018035906020019191908080601f01602080910402602001604051908101604052809392919081815260200183838082843750949650509335935050505060006000341115610ecf57610ecf33345b6117178282604051600090600160a060020a0384169083908381818185876185025a03f1925050509050610ec9565b6109bb6004808035906020019082018035906020019191908080601f01602080910402602001604051908101604052809392919081815260200183838082843750506040805160208835808b0135601f81018390048302840183019094528383529799986044989297509190910194509092508291508401838280828437509496505093359350505050600060006000341115610fc557610fc53334610356565b6109bb6004808035906020019082018035906020019191908080601f0160208091040260200160405190810160405280939291908181526020018383808284375094965050933593505050506000600060003411156110f9576110f93334610356565b6109bb6004808035906020019082018035906020019191908080601f01602080910402602001604051908101604052809392919081815260200183838082843750506040805160208835808b0135601f81018390048302840183019094528383529799986044989297509190910194509092508291508401838280828437509496505093359350505050600060006000341115611185576111853334610356565b6109cf600435600360205260009081526040902054600160a060020a031681565b610a1560043560056020526000908152604090205481565b6109bb6004808035906020019082018035906020019191908080601f01602080910402602001604051908101604052809392919081815260200183838082843750949650509335935050505060006000341115611339576113393334610356565b6109cf600435600460205260009081526040902054600160a060020a031681565b6100e560043560243560008281526020819052604090208054600160a060020a031916821790555b5050565b6109bb6004808035906020019082018035906020019191908080601f01602080910402602001604051908101604052809392919081815260200183838082843750506040805160208835808b0135601f8101839004830284018301909452838352979998604498929750919091019450909250829150840183828082843750949650505050505050600060006000341115611447576114473334610356565b610a276004808035906020019082018035906020019191908080601f016020809104026020016040519081016040528093929190818152602001838380828437509496505050505050505b60408051602081019091526000808252805b60108260ff16101561159357838260ff16815181101561000257016020015160f860020a908190048102049050604160ff8216108015906107525750605a8160ff1611155b1561078b5760418103600a0160f860020a02848360ff16815181101561000257906020010190600160f860020a031916908160001a9053505b6001919091019061070d565b610a956004808035906020019082018035906020019191908080601f016020809104026020016040519081016040528093929190818152602001838380828437509496505050505050505b60008080805b60128260ff1610156115f357848260ff16815181101561000257016020015160f860020a908190048102049050603060ff821610611609576061602f19820160ff16600a909402939093019290920691611633565b610aac6004808035906020019082018035906020019191908080601f016020809104026020016040519081016040528093929190818152602001838380828437509496505050505050505b60408051602081810183526000808352835180830185528181528451808401865282815285518085018752838152865180860188528481528751958601885284865296519596929591949093909181906003908059106108e55750595b9080825280602002602001820160405280156108fc575b509450600460405180591061090e5750595b908082528060200260200182016040528015610925575b50935060096040518059106109375750595b90808252806020026020018201604052801561094e575b50925060009150600090505b84518160ff16101561163f57888280600101935060ff1681518110156100025790602001015160f860020a900460f860020a02858260ff16815181101561000257906020010190600160f860020a031916908160001a90535060010161095a565b604080519115158252519081900360200190f35b60408051600160a060020a039092168252519081900360200190f35b60408051600160a060020a0390941684526020840192909252151582820152519081900360600190f35b60408051918252519081900360200190f35b60405180806020018281038252838181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f168015610a875780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6040805160ff929092168252519081900360200190f35b604051808060200180602001806020018481038452878181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f168015610b145780820380516001836020036101000a031916815260200191505b508481038352868181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f168015610b6d5780820380516001836020036101000a031916815260200191505b508481038252858181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f168015610bc65780820380516001836020036101000a031916815260200191505b50965050505050505060405180910390f35b505b919050565b60008381526003602081815260408084205490518a51600160a060020a039092169460059490938c9383928583019282918591839186918b91600491601f86010402600f01f150905001915050604051809103902060001916815260200190815260200160002060005054600260005060008660001916815260200190815260200160002060009054906101000a900460ff169b509b509b505b5050505050505050509193909250565b601498505b60208960ff161015610ccf578c8960ff166020811015610002571a60f860020a02600160f860020a031916600014610d535760009b508b9a508a9950610c79565b6012604051805910610cde5750595b908082528060200260200182016040528015610cf5575b509750600096505b60108760ff161015610d5f578c8760040160ff166020811015610002571a60f860020a02888860ff16815181101561000257906020010190600160f860020a031916908160001a90535060019690960195610cfd565b60019890980197610c8e565b610d6888610888565b9550955095508585604051808380519060200190808383829060006004602084601f0104600302600f01f1509050018280519060200190808383829060006004602084601f0104600302600f01f150905001925050506040518091039020925060308d600360208110156100025760f860020a91901a810204602f1901908e60021a60f860020a0260f860020a900403600a02019150610e0a610e94896106fb565b606203905060ff81811690831614610bdf5760008381526003602081815260408084205490518a51600160a060020a039092169460059490938c9383928583019282918591839186918b91600491601f86010402600f01f15090500191505060405180910390206000191681526020019081526020016000206000505460009b509b509b50610c79565b6107e2565b506000818152600260209081526040808320805460ff19166001908117909155600590925290912084905591505b505b92915050565b826004600050600082604051808280519060200190808383829060006004602084601f0104600302600f01f150905001915050604051809103902060001916815260200190815260200160002060009054906101000a9004600160a060020a0316600160a060020a031633600160a060020a03161415610ec757826004600050600086604051808280519060200190808383829060006004602084601f0104600302600f01f150905001915050604051809103902060001916815260200190815260200160002060006101000a815481600160a060020a03021916908302179055506001915050610ec9565b505b509392505050565b836004600050600082604051808280519060200190808383829060006004602084601f0104600302600f01f150905001915050604051809103902060001916815260200190815260200160002060009054906101000a9004600160a060020a0316600160a060020a031633600160a060020a03161415610fbb578585604051808380519060200190808383829060006004602084601f0104600302600f01f1509050018280519060200190808383829060006004602084601f0104600302600f01f1509050019250505060405180910390209150600260005060008360001916815260200190815260200160002060009054906101000a900460ff1615156110d1576000925050610fbd565b5060008181526003602052604090208054600160a060020a0319168417905560019150610fbd565b835160d960020a6430b236b4b70290600314611119576000925050610ec7565b84604051808280519060200190808383829060006004602084601f0104600302600f01f15090500191505060405180910390209150600260005060008360001916815260200190815260200160002060009054906101000a900460ff1615610e99576000925050610ec7565b836004600050600082604051808280519060200190808383829060006004602084601f0104600302600f01f150905001915050604051809103902060001916815260200190815260200160002060009054906101000a9004600160a060020a0316600160a060020a031633600160a060020a03161415610fbb576002600050600087604051808280519060200190808383829060006004602084601f0104600302600f01f150905001915050604051809103902060001916815260200190815260200160002060009054906101000a900460ff161515611269576000925050610fbd565b8585604051808380519060200190808383829060006004602084601f0104600302600f01f1509050018280519060200190808383829060006004602084601f0104600302600f01f1509050019250505060405180910390209150600260005060008360001916815260200190815260200160002060009054906101000a900460ff16156112fa576000925050610fbd565b506000818152600260209081526040808320805460ff1916600190811790915560039092529091208054600160a060020a031916851790559150610fbd565b825160d960020a6430b236b4b70290600414611359576000915050610ec9565b6004600050600085604051808280519060200190808383829060006004602084601f0104600302600f01f150905001915050604051809103902060001916815260200190815260200160002060009054906101000a9004600160a060020a0316600160a060020a031660001415156113d5576000915050610ec9565b826004600050600086604051808280519060200190808383829060006004602084601f0104600302600f01f150905001915050604051809103902060001916815260200190815260200160002060006101000a815481600160a060020a03021916908302179055506001915050610ec9565b826004600050600082604051808280519060200190808383829060006004602084601f0104600302600f01f150905001915050604051809103902060001916815260200190815260200160002060009054906101000a9004600160a060020a0316600160a060020a031633600160a060020a03161415611553578484604051808380519060200190808383829060006004602084601f0104600302600f01f1509050018280519060200190808383829060006004602084601f0104600302600f01f1509050019250505060405180910390209150600260005060008360001916815260200190815260200160002060009054906101000a900460ff16151561155b576000925050610ec7565b505092915050565b506000818152600260209081526040808320805460ff19169055600390915290208054600160a060020a031916905560019150610ec7565b602160f860020a02846010815181101561000257906020010190600160f860020a031916908160001a905350600e60f860020a02846011815181101561000257906020010190600160f860020a031916908160001a905350929392505050565b50506061600a9182028190069091020692915050565b6061600a60ff83811682810682169083900490911695820295909501829006029390930192909206915b600191909101906107e8565b5060005b83518160ff1610156116a457888280600101935060ff1681518110156100025790602001015160f860020a900460f860020a02848260ff16815181101561000257906020010190600160f860020a031916908160001a905350600101611643565b5060005b82518160ff16101561170957888280600101935060ff1681518110156100025790602001015160f860020a900460f860020a02838260ff16815181101561000257906020010190600160f860020a031916908160001a9053506001016116a8565b509297919650945092505050565b151561060d5761000256",
    address: "0x92eb9da9f25e03e789f13f83fe8a4201dc236adb",
    generated_with: "2.0.9",
    contract_name: "RegistryICAP"
  };

  function Contract() {
    if (Contract.Pudding == null) {
      throw new Error("RegistryICAP error: Please call load() first before creating new instance of this contract.");
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
      throw new Error("RegistryICAP error: Please call load() first before calling new().");
    }

    return Contract.Pudding.new.apply(Contract, arguments);
  };

  Contract.at = function() {
    if (Contract.Pudding == null) {
      throw new Error("RegistryICAP error: Please call load() first before calling at().");
    }

    return Contract.Pudding.at.apply(Contract, arguments);
  };

  Contract.deployed = function() {
    if (Contract.Pudding == null) {
      throw new Error("RegistryICAP error: Please call load() first before calling deployed().");
    }

    return Contract.Pudding.deployed.apply(Contract, arguments);
  };

  if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = Contract;
  } else {
    // There will only be one version of Pudding in the browser,
    // and we can use that.
    window.RegistryICAP = Contract;
  }

})();