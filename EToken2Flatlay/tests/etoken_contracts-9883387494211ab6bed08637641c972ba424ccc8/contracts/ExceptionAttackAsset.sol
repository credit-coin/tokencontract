import "Asset.sol";

contract ExceptionAttackAsset is Asset {
    function emitTransfer(address _from, address _to, uint _value) {
        throw;
    }

    function emitApprove(address _from, address _spender, uint _value) {
        throw;
    }
}
