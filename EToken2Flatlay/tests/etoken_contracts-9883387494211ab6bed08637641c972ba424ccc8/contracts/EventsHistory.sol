import "AmbiEnabled.sol";
import "Safe.sol";

contract EventsHistory is AmbiEnabled, Safe {
    mapping(bytes4 => address) public emitters;
    mapping(address => uint) public versions;
    mapping(uint => VersionInfo) public versionInfo;
    uint public latestVersion;

    struct VersionInfo {
        uint block;
        address by;
        address caller;
        string name;
        string changelog;
    }

    function addEmitter(bytes4 _eventSignature, address _emitter) noValue() checkAccess("admin") returns(bool) {
        if (emitters[_eventSignature] != 0x0) {
            return false;
        }
        emitters[_eventSignature] = _emitter;
        return true;
    }

    function addVersion(address _caller, string _name, string _changelog) noValue() checkAccess("admin") returns(bool) {
        if (versions[_caller] != 0) {
            return false;
        }
        if (bytes(_name).length == 0) {
            return false;
        }
        if (bytes(_changelog).length == 0) {
            return false;
        }
        uint version = ++latestVersion;
        versions[_caller] = version;
        versionInfo[version] = VersionInfo(block.number, msg.sender, _caller, _name, _changelog);
        return true;
    }
    
    function () noValue() {
        if (versions[msg.sender] == 0) {
            return;
        }
        // Internal Out Of Gas/Throw: revert this transaction too;
        // Call Stack Depth Limit reached: revert this transaction too;
        // Recursive Call: safe, all changes already made.
        if (!emitters[msg.sig].delegatecall(msg.data)) {
            throw;
        }
    }
}