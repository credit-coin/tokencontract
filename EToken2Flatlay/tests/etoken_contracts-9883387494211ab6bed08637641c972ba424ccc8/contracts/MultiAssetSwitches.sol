contract MultiAssetSwitches {
    enum Features { Issue, TransferWithReference, Revoke, ChangeOwnership, Allowances, ICAP }

    function issue(bytes32 _symbol, bool _isReissuable) constant returns(bytes32) {
        return sha3(_symbol, _isReissuable, Features.Issue);
    }

    function transferWithReference(bytes32 _symbol) constant returns(bytes32) {
        return sha3(_symbol, Features.TransferWithReference);
    }

    function revoke(bytes32 _symbol) constant returns(bytes32) {
        return sha3(_symbol, Features.Revoke);
    }

    function changeOwnership(bytes32 _symbol) constant returns(bytes32) {
        return sha3(_symbol, Features.ChangeOwnership);
    }

    function allowances(bytes32 _symbol) constant returns(bytes32) {
        return sha3(_symbol, Features.Allowances);
    }

    function icap(bytes32 _symbol) constant returns(bytes32) {
        return sha3(_symbol, Features.ICAP);
    }
}
