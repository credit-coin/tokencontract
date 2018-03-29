import "Asset.sol";

contract DummyAsset is Asset {
    function emitTransfer(address _from, address _to, uint _value) {}
    function emitApprove(address _from, address _spender, uint _value) {}
}
