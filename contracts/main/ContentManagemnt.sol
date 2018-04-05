pragma solidity ^0.4.18;

import "../../ownership/Ownable.sol";


/**
 * @title ContentManagement
 * @dev The ContentManagement contract manage content publishing from contents.
 */
contract ContentManagement {
    event AddedContent(bytes32 indexed hash, uint id);
    event RemovedContent(bytes32 indexed hash, uint id);
    event UpdatedContent(bytes32 indexed oldHash, bytes32 indexed newHash, uint id);

    bytes32[] contentHash;
    mapping(bytes32 => uint256) contentHashIndex;

    /**
     * @dev Add new content hash from IPFS.
     * @param hash The hash bytes32 to represent content stored on IPFS.
     */
    function AddContentHash(bytes32 hash) onlyOwner public {

        uint id = contentHash.length;
        contentHashIndex[hash] = id;
        contentHash.push(hash);
        AddedContent(hash, id);

    }

    /**
     * @dev Check content hash from IPFS.
     * @param hash The hash bytes32 to represent content stored on IPFS.
     */
    function CheckContentHash(bytes32 hash) onlyOwner public returns (bool) {

        uint id = contentHashIndex[hash];
        return id != 0;

    }

    /**
     * @dev Update content hash from IPFS.
     * @param hash The hash bytes32 to represent content stored on IPFS.
     */
    function UpdateContentHash(bytes32 oldHash, bytes32 newHash) onlyOwner public {

        uint id = contentHashIndex[oldHash];
        contentHash[id] = newHash;
        UpdatedContent(oldHash, newHash, id);

    }

    /**
     * @dev Remove registered content hash.
     * @param hash The hash bytes32 to represent content stored on IPFS.
     */
    function RemoveContentHash(bytes32 hash) onlyOwner public {

        uint id = contentHashIndex[hash];
        delete contentHash[id];
        RemovedContent(hash);

    }

}
