import "Owned.sol";
import "RegistryICAP.sol";

contract Cosigner {
    function isSigned(bytes32) returns(bool);
}

contract Emitter {
    function emitTransfer(address _from, address _to, bytes32 _symbol, uint _value, string _reference);
    function emitIssue(bytes32 _symbol, uint _value, address _by);
    function emitRevoke(bytes32 _symbol, uint _value, address _by);
    function emitOwnershipChange(address _from, address _to, bytes32 _symbol);
    function emitApprove(address _from, address _spender, bytes32 _symbol, uint _value);
    function emitRecovery(address _from, address _to, address _by);
    function emitTransferToICAP(address _from, address _to, bytes32 _icap, uint _value, string _reference);
    function emitError(bytes32 _message);
}

contract MultiAsset is Owned {
    mapping(bytes32 => bool) public switches;

    function isEnabled(bytes32 _switch) constant returns(bool) {
        // DEPLOY REMOVE `!`
        return !switches[_switch];// ! - means everything is enabled by default
    }

    function setSwitch(bytes32 _switch, bool _state) noValue() onlyContractOwner() returns(bool) {
        switches[_switch] = _state;
        return true;
    }

    modifier checkEnabledSwitch(bytes32 _switch) {
        if (isEnabled(_switch)) {
            _
        }
        _error("Feature is disabled");
    }

    enum Features { Issue, TransferWithReference, Revoke, ChangeOwnership, Allowances, ICAP }

    struct Asset {
        uint owner;
        uint totalSupply;
        string name;
        string description;
        bool isReissuable;
        uint8 baseUnit;
        mapping(uint => Wallet) wallets;
    }

    struct ProxyConf {
        address proxy;
        bool onlyProxy;
        bool throwOnFailedEmit;
        mapping(address => bool) isProxy;
    }

    struct Wallet {
        uint balance;
        mapping(uint => uint) allowance;
    }

    struct Holder {
        // Iterable mapping pattern is used for trusts.
        uint trustsCount;
        // Current (last recovered to) address of the holder.
        // All the events for this holder will have this address, regardless of access address.
        address addr;
        mapping(uint => address) trusts;
        mapping(address => uint) trustIndex;
    }

    // Iterable mapping pattern is used for holders.
    uint public holdersCount;
    mapping(uint => Holder) public holders;
    // This is access address mapping. Many addresses may have access to a single holder.
    mapping(address => uint) holderIndex;
    mapping(bytes32 => Asset) public assets;
    mapping(bytes32 => ProxyConf) public proxies;

    RegistryICAP public registryICAP;
    // Should use interface of the emitter, but address of events history.
    Emitter public eventsHistory;

    function _error(bytes32 _message) internal {
        eventsHistory.emitError(_message);
    }

    function () {
        // donations
    }

    function setupRegistryICAP(address _registryICAP) onlyContractOwner() immutable(address(registryICAP)) returns(bool) {
        registryICAP = RegistryICAP(_registryICAP);
        return true;
    }

    function setupEventsHistory(address _eventsHistory) onlyContractOwner() immutable(address(eventsHistory)) returns(bool) {
        eventsHistory = Emitter(_eventsHistory);
        return true;
    }

    modifier onlyOwner(bytes32 _symbol) {
        if (_isSignedOwner(_symbol)) {
            _
        }
        _error("Only owner: access denied");
    }

    modifier onlyProxy(bytes32 _symbol) {
        if (proxies[_symbol].isProxy[msg.sender]) {
            _
        }
        _error("Only proxy: access denied");
    }

    function _isSignedOwner(bytes32 _symbol) internal checkSigned(_symbol, getHolderId(msg.sender)) returns(bool) {
        return isOwner(msg.sender, _symbol);
    }

    modifier checkTrust(address _from, address _to) {
        if (isTrusted(_from, _to)) {
            _
        }
        _error("Only trusted: access denied");
    }

    function isCreated(bytes32 _symbol) constant returns(bool) {
        return assets[_symbol].owner != 0;
    }

    function baseUnit(bytes32 _symbol) constant returns(uint8) {
        return assets[_symbol].baseUnit;
    }

    function name(bytes32 _symbol) constant returns(string) {
        return assets[_symbol].name;
    }

    function description(bytes32 _symbol) constant returns(string) {
        return assets[_symbol].description;
    }

    function isReissuable(bytes32 _symbol) constant returns(bool) {
        return assets[_symbol].isReissuable;
    }

    function owner(bytes32 _symbol) constant returns(address) {
        return holders[assets[_symbol].owner].addr;
    }

    function isOwner(address _owner, bytes32 _symbol) constant returns(bool) {
        return isCreated(_symbol) && (assets[_symbol].owner == getHolderId(_owner));
    }

    function totalSupply(bytes32 _symbol) constant returns(uint) {
        return assets[_symbol].totalSupply;
    }

    function balanceOf(address _holder, bytes32 _symbol) constant returns(uint) {
        return _balanceOf(getHolderId(_holder), _symbol);
    }

    function _balanceOf(uint _holderId, bytes32 _symbol) constant internal returns(uint) {
        return assets[_symbol].wallets[_holderId].balance;
    }

    function _address(uint _holderId) constant internal returns(address) {
        return holders[_holderId].addr;
    }

    function setProxy(address _address, bool enabled, bytes32 _symbol) onlyOwner(_symbol) returns(bool) {
        proxies[_symbol].isProxy[_address] = enabled;
        return true;
    }

    function setEventsProxy(address _address, bytes32 _symbol) onlyOwner(_symbol) returns(bool) {
        proxies[_symbol].proxy = _address;
        return true;
    }

    function setProxyConf(bool _onlyThroughProxy, bool _throwOnFailedEmit, bytes32 _symbol) onlyOwner(_symbol) returns(bool) {
        // Allow turning on special proxy conf for assets without holders only.
        if ((_onlyThroughProxy || _throwOnFailedEmit) && balanceOf(msg.sender, _symbol) != totalSupply(_symbol)) {
            _error("Cannot set with holders");
            return false;
        }
        proxies[_symbol].onlyProxy = _onlyThroughProxy;
        proxies[_symbol].throwOnFailedEmit = _throwOnFailedEmit;
        return true;
    }

    function _proxyCheckFails(bytes32 _symbol) internal constant returns(bool) {
        return proxies[_symbol].onlyProxy && !proxies[_symbol].isProxy[msg.sender];
    }

    function _transferDirect(uint _fromId, uint _toId, uint _value, bytes32 _symbol) internal {
        assets[_symbol].wallets[_fromId].balance -= _value;
        assets[_symbol].wallets[_toId].balance += _value;
    }

    function _transfer(uint _fromId, uint _toId, uint _value, bytes32 _symbol, string _reference, uint _senderId) internal checkSigned(_symbol, _senderId) returns(bool) {
        if (_proxyCheckFails(_symbol)) {
            _error("Access only through proxy");
            return false;
        }
        if (_fromId == _toId) {
            _error("Cannot send to oneself");
            return false;
        }
        if (_value == 0) {
            _error("Cannot send 0 value");
            return false;
        }
        if (_balanceOf(_fromId, _symbol) < _value) {
            _error("Insufficient balance");
            return false;
        }
        if (bytes(_reference).length > 0 && !isEnabled(sha3(_symbol, Features.TransferWithReference))) {
            _error("References feature is disabled");
            return false;
        }
        if (_fromId != _senderId && _allowance(_fromId, _senderId, _symbol) < _value) {
            _error("Not enough allowance");
            return false;
        }
        _transferDirect(_fromId, _toId, _value, _symbol);
        if (_fromId != _senderId) {
            assets[_symbol].wallets[_fromId].allowance[_senderId] -= _value;
        }
        // Internal Out Of Gas/Throw: revert this transaction too;
        // Call Stack Depth Limit reached: revert this transaction too;
        // Recursive Call: safe, all changes already made.
        eventsHistory.emitTransfer(_address(_fromId), _address(_toId), _symbol, _value, _reference);
        _proxyTransferEvent(_fromId, _toId, _value, _symbol);
        return true;
    }

    function transfer(address _to, uint _value, bytes32 _symbol) returns(bool) {
        return transferWithReference(_to, _value, _symbol, "");
    }

    function transferToICAP(bytes32 _icap, uint _value) returns(bool) {
        return transferToICAPWithReference(_icap, _value, "");
    }

    function transferToICAPWithReference(bytes32 _icap, uint _value, string _reference) returns(bool) {
        return _transferToICAPWithReference(msg.sender, _icap, _value, _reference, msg.sender);
    }

    // Feature and proxy checks done internally due to unknown symbol when the function is called.
    function _transferToICAPWithReference(address _from, bytes32 _icap, uint _value, string _reference, address _sender) internal returns(bool) {
        var (to, symbol, success) = registryICAP.parse(_icap);
        if (!success) {
            _error("ICAP is not registered");
            return false;
        }
        if (!isEnabled(sha3(symbol, Features.ICAP))) {
            _error("ICAP feature is disabled");
            return false;
        }
        if (msg.sender != _sender && !proxies[symbol].isProxy[msg.sender]) {
            _error("Only proxy: access denied");
            return false;
        }
        uint fromId = getHolderId(_from);
        uint toId = _createHolderId(to);
        if (!_transfer(fromId, toId, _value, symbol, _reference, getHolderId(_sender))) {
            return false;
        }
        // Internal Out Of Gas/Throw: revert this transaction too;
        // Call Stack Depth Limit reached: revert this transaction too;
        // Recursive Call: safe, all changes already made.
        eventsHistory.emitTransferToICAP(_address(fromId), _address(toId), _icap, _value, _reference);
        return true;
    }

    function transferWithReference(address _to, uint _value, bytes32 _symbol, string _reference) returns(bool) {
        return _transfer(getHolderId(msg.sender), _createHolderId(_to), _value, _symbol, _reference, getHolderId(msg.sender));
    }

    // this function will fail unless isProxy[msg.sender] == true
    function proxyTransferWithReference(address _to, uint _value, bytes32 _symbol, string _reference) onlyProxy(_symbol) noCallback() returns(bool) {
        return _transfer(getHolderId(tx.origin), _createHolderId(_to), _value, _symbol, _reference, getHolderId(tx.origin));
    }

    // this function will fail unless isProxy[msg.sender] == true
    function proxyTransferToICAPWithReference(bytes32 _icap, uint _value, string _reference) noCallback() returns(bool) {
        return _transferToICAPWithReference(tx.origin, _icap, _value, _reference, tx.origin);
    }

    function _proxyTransferEvent(uint _fromId, uint _toId, uint _value, bytes32 _symbol) internal requireStackDepth(1) {
        ProxyConf conf = proxies[_symbol];
        if (conf.proxy != 0x0) {
            _setupNoCallback();
            // Internal Out Of Gas/Throw: revert this transaction too if configured, or ignore;
            // Call Stack Depth Limit reached: revert this transaction too;
            // Recursive Call: safe, all changes already made, tx.origin cannot be exploited due to noCallback() modifier on every proxy function.
            if (!conf.proxy.call(bytes4(sha3("emitTransfer(address,address,uint256)")), _address(_fromId), _address(_toId), _value)) {
                if (conf.throwOnFailedEmit) {
                    throw;
                }
            }
            _finishNoCallback();
        }
    }

    function getHolderId(address _holder) constant returns(uint) {
        return holderIndex[_holder];
    }

    function _createHolderId(address _holder) internal returns(uint) {
        uint holderId = holderIndex[_holder];
        if (holderId == 0) {
            holderId = ++holdersCount;
            holders[holderId].addr = _holder;
            holderIndex[_holder] = holderId;
        }
        return holderId;
    }

    // _isReissuable is included in checkEnabledSwitch because it should be
    // explicitly allowed before issuing new asset
    function issueAsset(bytes32 _symbol, uint _value, string _name, string _description, uint8 _baseUnit, bool _isReissuable) checkEnabledSwitch(sha3(_symbol, _isReissuable, Features.Issue)) returns(bool) {
        if (_value == 0 && !_isReissuable) {
            _error("Cannot issue 0 value fixed asset");
            return false;
        }
        if (isCreated(_symbol)) {
            _error("Asset already issued");
            return false;
        }
        uint holderId = _createHolderId(msg.sender);

        assets[_symbol] = Asset(holderId, _value, _name, _description, _isReissuable, _baseUnit);
        assets[_symbol].wallets[holderId].balance = _value;
        // Internal Out Of Gas/Throw: revert this transaction too;
        // Call Stack Depth Limit reached: revert this transaction too;
        // Recursive Call: safe, all changes already made.
        eventsHistory.emitIssue(_symbol, _value, _address(holderId));
        return true;
    }

    function reissueAsset(bytes32 _symbol, uint _value) onlyOwner(_symbol) returns(bool) {
        if (_value == 0) {
            _error("Cannot reissue 0 value");
            return false;
        }
        Asset asset = assets[_symbol];
        if (!asset.isReissuable) {
            _error("Cannot reissue fixed asset");
            return false;
        }
        if (asset.totalSupply + _value < asset.totalSupply) {
            _error("Total supply overflow");
            return false;
        }
        uint holderId = getHolderId(msg.sender);
        asset.wallets[holderId].balance += _value;
        asset.totalSupply += _value;
        // Internal Out Of Gas/Throw: revert this transaction too;
        // Call Stack Depth Limit reached: revert this transaction too;
        // Recursive Call: safe, all changes already made.
        eventsHistory.emitIssue(_symbol, _value, _address(holderId));
        _proxyTransferEvent(0, holderId, _value, _symbol);
        return true;
    }

    function revokeAsset(bytes32 _symbol, uint _value) onlyOwner(_symbol) checkEnabledSwitch(sha3(_symbol, Features.Revoke)) returns(bool) {
        if (_value == 0) {
            _error("Cannot revoke 0 value");
            return false;
        }
        Asset asset = assets[_symbol];
        uint holderId = getHolderId(msg.sender);
        if (asset.wallets[holderId].balance < _value) {
            _error("Not enough tokens to revoke");
            return false;
        }
        asset.wallets[holderId].balance -= _value;
        asset.totalSupply -= _value;
        // Internal Out Of Gas/Throw: revert this transaction too;
        // Call Stack Depth Limit reached: revert this transaction too;
        // Recursive Call: safe, all changes already made.
        eventsHistory.emitRevoke(_symbol, _value, _address(holderId));
        _proxyTransferEvent(holderId, 0, _value, _symbol);
        return true;
    }

    function changeOwnership(bytes32 _symbol, address _newOwner) onlyOwner(_symbol) checkEnabledSwitch(sha3(_symbol, Features.ChangeOwnership)) returns(bool) {
        Asset asset = assets[_symbol];
        uint newOwnerId = _createHolderId(_newOwner);
        if (asset.owner == newOwnerId) {
            _error("Cannot pass ownership to oneself");
            return false;
        }
        address oldOwner = _address(asset.owner);
        asset.owner = newOwnerId;
        // Internal Out Of Gas/Throw: revert this transaction too;
        // Call Stack Depth Limit reached: revert this transaction too;
        // Recursive Call: safe, all changes already made.
        eventsHistory.emitOwnershipChange(oldOwner, _address(newOwnerId), _symbol);
        return true;
    }

    function isTrusted(address _from, address _to) constant returns(bool) {
        return holders[getHolderId(_from)].trustIndex[_to] != 0;
    }

    function trust(address _to) returns(bool) {
        uint fromId = _createHolderId(msg.sender);
        if (fromId == getHolderId(_to)) {
            _error("Cannot trust to oneself");
            return false;
        }
        if (isTrusted(msg.sender, _to)) {
            _error("Already trusted");
            return false;
        }
        uint trustId = ++holders[fromId].trustsCount;
        holders[fromId].trustIndex[_to] = trustId;
        holders[fromId].trusts[trustId] = _to;
        return true;
    }

    function distrust(address _to) checkTrust(msg.sender, _to) returns(bool) {
        uint fromId = getHolderId(msg.sender);
        uint trustId = holders[fromId].trustIndex[_to];
        if (trustId < holders[fromId].trustsCount) {
            address last = holders[fromId].trusts[holders[fromId].trustsCount];
            holders[fromId].trusts[trustId] = last;
            holders[fromId].trustIndex[last] = trustId;
        }
        delete holders[fromId].trusts[--holders[fromId].trustsCount];
        delete holders[fromId].trustIndex[_to];
        return true;
    }

    function distrustAll() returns(bool) {
        uint fromId = getHolderId(msg.sender);
        if (fromId == 0) {
            _error("Didn't trust yet");
            return false;
        }
        if (holders[fromId].trustsCount == 0) {
            _error("Didn't trust yet");
            return false;
        }
        for (uint i = 1; i <= holders[fromId].trustsCount; i++) {
            address j = holders[fromId].trusts[i];
            delete holders[fromId].trustIndex[j];
            delete holders[fromId].trusts[i];
        }
        holders[fromId].trustsCount = 0;
        return true;
    }

    // This function logic is actually more of a addAccess(uint _holderId, address _to).
    // It just grants another address access to this holder.
    function recover(address _from, address _to) checkTrust(_from, msg.sender) checkSignedHolder(getHolderId(_from)) returns(bool) {
        if (getHolderId(_to) != 0) {
            _error("Should recover to new address");
            return false;
        }
        // We take current holder address because it might not equal _from.
        // It is possible to recover from any old holder address, but event should have the current one.
        address from = holders[getHolderId(_from)].addr;
        holders[getHolderId(_from)].addr = _to;
        holderIndex[_to] = getHolderId(_from);
        // Internal Out Of Gas/Throw: revert this transaction too;
        // Call Stack Depth Limit reached: revert this transaction too;
        // Recursive Call: safe, all changes already made.
        eventsHistory.emitRecovery(from, _to, msg.sender);
        return true;
    }

    function _approve(uint _spenderId, uint _value, bytes32 _symbol, uint _senderId) internal requireStackDepth(1) checkEnabledSwitch(sha3(_symbol, Features.Allowances)) checkSigned(_symbol, _senderId) returns(bool) {
        if (_proxyCheckFails(_symbol)) {
            _error("Access only through proxy");
            return false;
        }
        if (!isCreated(_symbol)) {
            _error("Asset is not issued");
            return false;
        }
        if (_senderId == _spenderId) {
            _error("Cannot approve to oneself");
            return false;
        }
        assets[_symbol].wallets[_senderId].allowance[_spenderId] = _value;
        // Internal Out Of Gas/Throw: revert this transaction too;
        // Call Stack Depth Limit reached: revert this transaction too;
        // Recursive Call: safe, all changes already made.
        eventsHistory.emitApprove(_address(_senderId), _address(_spenderId), _symbol, _value);
        ProxyConf conf = proxies[_symbol];
        if (conf.proxy != 0x0) {
            _setupNoCallback();
            // Internal Out Of Gas/Throw: revert this transaction too;
            // Call Stack Depth Limit reached: revert this transaction too;
            // Recursive Call: safe, all changes already made, tx.origin cannot be exploited due to noCallback() modifier on every proxy funtion.
            if (!conf.proxy.call(bytes4(sha3("emitApprove(address,address,uint256)")), _address(_senderId), _address(_spenderId), _value)) {
                if (conf.throwOnFailedEmit) {
                    throw;
                }
            }
            _finishNoCallback();
        }
        return true;
    }

    function approve(address _spender, uint _value, bytes32 _symbol) returns(bool) {
        return _approve(_createHolderId(_spender), _value, _symbol, _createHolderId(msg.sender));
    }

    function proxyApprove(address _spender, uint _value, bytes32 _symbol) onlyProxy(_symbol) noCallback() returns(bool) {
        return _approve(_createHolderId(_spender), _value, _symbol, _createHolderId(tx.origin));
    }

    function allowance(address _from, address _spender, bytes32 _symbol) constant returns(uint) {
        return _allowance(getHolderId(_from), getHolderId(_spender), _symbol);
    }

    function _allowance(uint _fromId, uint _toId, bytes32 _symbol) constant internal returns(uint) {
        return assets[_symbol].wallets[_fromId].allowance[_toId];
    }

    function transferFrom(address _from, address _to, uint _value, bytes32 _symbol) returns(bool) {
        return transferFromWithReference(_from, _to, _value, _symbol, "");
    }

    function transferFromWithReference(address _from, address _to, uint _value, bytes32 _symbol, string _reference) returns(bool) {
        return _transfer(getHolderId(_from), _createHolderId(_to), _value, _symbol, _reference, getHolderId(msg.sender));
    }

    function transferFromToICAP(address _from, bytes32 _icap, uint _value) returns(bool) {
        return transferFromToICAPWithReference(_from, _icap, _value, "");
    }

    function transferFromToICAPWithReference(address _from, bytes32 _icap, uint _value, string _reference) returns(bool) {
        return _transferToICAPWithReference(_from, _icap, _value, _reference, msg.sender);
    }

    function proxyTransferFromWithReference(address _from, address _to, uint _value, bytes32 _symbol, string _reference) onlyProxy(_symbol) noCallback() returns(bool) {
        return _transfer(getHolderId(_from), _createHolderId(_to), _value, _symbol, _reference, getHolderId(tx.origin));
    }

    function proxyTransferFromToICAPWithReference(address _from, bytes32 _icap, uint _value, string _reference) noCallback() returns(bool) {
        return _transferToICAPWithReference(_from, _icap, _value, _reference, tx.origin);
    }

    mapping(bytes32 => Cosigner) public cosigners;
    uint public signChecks; // DEPLOY REMOVE
    bytes32 public lastOperation; // DEPLOY REMOVE

    modifier checkSigned(bytes32 _symbol, uint _senderId) {
        signChecks++; // DEPLOY REMOVE
        lastOperation = sha3(msg.data, _senderId); // DEPLOY REMOVE
        bytes32 perUserPerAsset = sha3(_senderId, _symbol);
        bytes32 perUser = sha3(_senderId);
        if (address(cosigners[perUserPerAsset]) != 0x0) {
            // Internal Out Of Gas/Throw: revert this transaction too;
            // Call Stack Depth Limit reached: revert this transaction too;
            // Recursive Call: safe, no any changes applied yet, we are inside of modifier.
            if (cosigners[perUserPerAsset].isSigned(sha3(msg.data, _senderId))) {
                _
            } else {
                _error("Operation is not cosigned");
            }
        } else if (address(cosigners[perUser]) != 0x0) {
            // Internal Out Of Gas/Throw: revert this transaction too;
            // Call Stack Depth Limit reached: revert this transaction too;
            // Recursive Call: safe, no any changes applied yet, we are inside of modifier.
            if (cosigners[perUser].isSigned(sha3(msg.data, _senderId))) {
                _
            } else {
                _error("Operation is not cosigned");
            }
        } else {
            _
        }
    }

    modifier checkSignedHolder(uint _senderId) {
        signChecks++; // DEPLOY REMOVE
        lastOperation = sha3(msg.data, _senderId); // DEPLOY REMOVE
        bytes32 perUser = sha3(_senderId);
        if (address(cosigners[perUser]) != 0x0) {
            // Internal Out Of Gas/Throw: revert this transaction too;
            // Call Stack Depth Limit reached: revert this transaction too;
            // Recursive Call: safe, no any changes applied yet, we are inside of modifier.
            if (cosigners[perUser].isSigned(sha3(msg.data, _senderId))) {
                _
            } else {
                _error("Operation is not cosigned");
            }
        } else {
            _
        }
    }

    function setCosignerAddress(address _address, bytes32 _symbol) checkSigned(_symbol, getHolderId(msg.sender)) returns(bool) {
        return _setCosignerAddress(_address, sha3(_createHolderId(msg.sender), _symbol));
    }

    function setCosignerAddressForUser(address _address) checkSignedHolder(getHolderId(msg.sender)) returns(bool) {
        return _setCosignerAddress(_address, sha3(_createHolderId(msg.sender)));
    }

    function proxySetCosignerAddress(address _address, bytes32 _symbol) onlyProxy(_symbol) noCallback() checkSigned(_symbol, getHolderId(tx.origin)) returns(bool) {
        return _setCosignerAddress(_address, sha3(_createHolderId(tx.origin), _symbol));
    }

    function _setCosignerAddress(address _address, bytes32 _identity) internal returns(bool) {
        cosigners[_identity] = Cosigner(_address);
        return true;
    }
}

// RegEx to remove all admin functions from ABI: (?s)\{\s+"constant"[^[]+\[[^\]]*\][^:]+:\s*"(proxy[^"]+|claimContractOwnership|issueAsset|reissueAsset|revokeAsset|changeOwnership|setSwitch|[^"]+Proxy|isEnabled|setup|changeContractOwnership)"[^\]]+[^}]+},\s+
