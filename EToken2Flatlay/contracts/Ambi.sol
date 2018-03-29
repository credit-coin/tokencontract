// This software is a subject to Ambisafe License Agreement.
// No use or distribution is allowed without written permission from Ambisafe.
// https://www.ambisafe.co/terms-of-use/

contract Ambi {
    function getNodeAddress(bytes32 _nodeName) constant returns(address);
    function hasRelation(bytes32 _nodeName, bytes32 _relation, address _to) constant returns(bool);
    function addNode(bytes32 _nodeName, address _nodeAddress) constant returns(bool);
}