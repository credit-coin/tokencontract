pragma solidity ^0.4.22;

import "../../ownership/Ownable.sol";


/**
 * @title CreatorManagement
 * @dev The CreatorManagement contract register creator using its hash.
 */
contract CreatorManagement {
    event AddedCreator(bytes32 indexed hash, uint id);
    event RemovedCreator(bytes32 indexed hash, uint id);
    event UpdatedCreator(bytes32 indexed oldHash, bytes32 indexed newHash, uint id);

    bytes32[] creatorHash;
    mapping(bytes32 => uint256) creatorHashIndex;

    /**
     * @dev Add new creator hash from IPFS.
     * @param hash The hash bytes32 to represent creator stored on IPFS.
     */
    function AddCreatorHash(bytes32 hash) onlyOwner public {

        uint id = creatorHash.length;
        creatorHashIndex[hash] = id;
        creatorHash.push(hash);
        AddedCreator(hash, id);

    }

    /**
     * @dev Check creator hash from IPFS.
     * @param hash The hash bytes32 to represent creator stored on IPFS.
     */
    function CheckCreatorHash(bytes32 hash) onlyOwner public returns (bool) {

        uint id = creatorHashIndex[hash];
        return id != 0;

    }

    /**
     * @dev Update creator hash from IPFS.
     * @param hash The hash bytes32 to represent creator stored on IPFS.
     */
    function UpdateCreatorHash(bytes32 oldHash, bytes32 newHash) onlyOwner public {

        uint id = creatorHashIndex[oldHash];
        creatorHash[id] = newHash;
        UpdatedCreator(oldHash, newHash, id);

    }

    /**
     * @dev Remove registered creator hash.
     * @param hash The hash bytes32 to represent creator stored on IPFS.
     */
    function RemoveCreatorHash(bytes32 hash) onlyOwner public {

        uint id = creatorHashIndex[hash];
        delete creatorHash[id];
        RemovedCreator(hash);

    }

}
