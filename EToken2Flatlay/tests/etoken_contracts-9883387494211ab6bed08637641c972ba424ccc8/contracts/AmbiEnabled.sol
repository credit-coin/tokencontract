// Stab.
contract AmbiEnabled {
    mapping(bytes32 => address) public index;

    modifier checkAccess(bytes32 _role) {
        _
    }

    function getAddress(bytes32 _name) returns(address) {
        return index[_name];
    }

    function setAddress(bytes32 _name, address _addr) {
        index[_name] = _addr;
    }
}