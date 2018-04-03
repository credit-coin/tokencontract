pragma solidity ^0.4.18;

import "../../ownership/Ownable.sol";


/**
 * @title UserManagement
 * @dev The UserManagement contract manage user using its hash.
 */
contract UserManagement {
    event AddedUser(string indexed hash);
    event RemovedUser(string indexed hash);

    string[] userHash;
    mapping(string => uint256) userHashIndex;

    /**
     * @dev Add new user hash from IPFS.
     * @param hash The hash string to represent user stored on IPFS.
     */
    function AddUserHash(string hash) onlyOwner public {

        uint id = userHash.length;
        userHashIndex[hash] = id;
        userHash.push(hash);
        AddedUser(hash);

    }

    /**
     * @dev Remove registered user hash.
     * @hash The hash string to represent user stored on IPFS.
     */
    function removeUserHash(string hash) onlyOwner public {

        uint id = userHashIndex[hash];
        delete userHash[id];
        RemovedUser(hash);

    }

}
