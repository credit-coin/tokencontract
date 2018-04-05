pragma solidity ^0.4.18;

import "../../ownership/Ownable.sol";


/**
 * @title UserManagement
 * @dev The UserManagement contract manage user using its hash.
 */
contract UserManagement {
    event AddedUser(bytes32 indexed hash, uint id);
    event RemovedUser(bytes32 indexed hash, uint id);
    event UpdatedUser(bytes32 indexed oldHash, bytes32 indexed newHash, uint id);

    bytes32[] userHash;
    mapping(bytes32 => uint256) userHashIndex;

    /**
     * @dev Add new user hash from IPFS.
     * @param hash The hash bytes32 to represent user stored on IPFS.
     */
    function AddUserHash(bytes32 hash) onlyOwner public {

        uint id = userHash.length;
        userHashIndex[hash] = id;
        userHash.push(hash);
        AddedUser(hash, id);

    }

    /**
     * @dev Check user hash from IPFS.
     * @param hash The hash bytes32 to represent user stored on IPFS.
     */
    function CheckUserHash(bytes32 hash) onlyOwner public returns (bool) {

        uint id = userHashIndex[hash];
        return id != 0;

    }

    /**
     * @dev Update user hash from IPFS.
     * @param hash The hash bytes32 to represent user stored on IPFS.
     */
    function UpdateUserHash(bytes32 oldHash, bytes32 newHash) onlyOwner public {

        uint id = userHashIndex[oldHash];
        userHash[id] = newHash;
        UpdatedUser(oldHash, newHash, id);

    }

    /**
     * @dev Remove registered user hash.
     * @param hash The hash bytes32 to represent user stored on IPFS.
     */
    function RemoveUserHash(bytes32 hash) onlyOwner public {

        uint id = userHashIndex[hash];
        delete userHash[id];
        RemovedUser(hash);

    }

}
