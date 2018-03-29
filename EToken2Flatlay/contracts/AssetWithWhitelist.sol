// This software is a subject to Ambisafe License Agreement.
// No use or distribution is allowed without written permission from Ambisafe.
// https://www.ambisafe.co/terms-of-use/

pragma solidity 0.4.15;

import './AssetWithAmbi.sol';
import {AssetProxyInterface as AssetProxy} from './AssetProxyInterface.sol';

/**
 * @title EToken2 Asset with whitelist implementation contract.
 */
contract AssetWithWhitelist is AssetWithAmbi {
    mapping(address => bool) public whitelist;
    uint public restrictionExpiraton;
    bool public restrictionRemoved;

    event Error(bytes32 _errorText);

    function allowTransferFrom(address _from) onlyRole('admin') returns(bool) {
        whitelist[_from] = true;
        return true;
    }

    function blockTransferFrom(address _from) onlyRole('admin') returns(bool) {
        whitelist[_from] = false;
        return true;
    }

    function transferIsAllowed(address _from) constant returns(bool) {
        return restrictionRemoved || whitelist[_from] || (now >= restrictionExpiraton);
    }

    function removeRestriction() onlyRole('admin') returns(bool) {
        restrictionRemoved = true;
        return true;
    }

    modifier transferAllowed(address _sender) {
        if (!transferIsAllowed(_sender)) {
            Error('Transfer not allowed');
            return;
        }
        _;
    }

    function setExpiration(uint _time) onlyRole('admin') returns(bool) {
        if (restrictionExpiraton != 0) {
            Error('Expiration time already set');
            return false;
        }
        if (_time < now) {
            Error('Expiration time invalid');
            return false;
        }
        restrictionExpiraton = _time;
        return true;
    }

    // Transfers
    function _transferWithReference(address _to, uint _value, string _reference, address _sender)
        transferAllowed(_sender)
        internal
        returns(bool)
    {
        return super._transferWithReference(_to, _value, _reference, _sender);
    }

    function _transferToICAPWithReference(bytes32 _icap, uint _value, string _reference, address _sender)
        transferAllowed(_sender)
        internal
        returns(bool)
    {
        return super._transferToICAPWithReference(_icap, _value, _reference, _sender);
    }

    function _transferFromWithReference(address _from, address _to, uint _value, string _reference, address _sender)
        transferAllowed(_from)
        internal
        returns(bool)
    {
        return super._transferFromWithReference(_from, _to, _value, _reference, _sender);
    }

    function _transferFromToICAPWithReference(address _from, bytes32 _icap, uint _value, string _reference, address _sender)
        transferAllowed(_from)
        internal
        returns(bool)
    {
        return super._transferFromToICAPWithReference(_from, _icap, _value, _reference, _sender);
    }
}
