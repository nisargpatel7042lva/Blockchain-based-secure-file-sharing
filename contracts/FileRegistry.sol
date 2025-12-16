// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FileRegistry
 * @dev Smart contract for managing file metadata, access control, and audit trails
 */
contract FileRegistry {
    // File structure
    struct File {
        uint256 id;
        address owner;
        string ipfsHash;
        string encryptedKeyHash;
        uint256 timestamp;
    }

    // Access control mappings
    mapping(uint256 => File) public files;
    mapping(uint256 => mapping(address => uint256)) public accessExpiration;
    mapping(uint256 => mapping(address => bool)) public revokedAccess;
    mapping(uint256 => address) public fileOwners;
    
    // File counter
    uint256 private fileCounter;

    // Events
    event FileUploaded(
        uint256 indexed fileId,
        address indexed owner,
        string ipfsHash,
        string encryptedKeyHash,
        uint256 timestamp
    );

    event AccessGranted(
        uint256 indexed fileId,
        address indexed recipient,
        uint256 expiration,
        uint256 timestamp
    );

    event AccessRevoked(
        uint256 indexed fileId,
        address indexed recipient,
        uint256 timestamp
    );

    event AccessAttempt(
        uint256 indexed fileId,
        address indexed user,
        bool success,
        uint256 timestamp
    );

    event FileShared(
        uint256 indexed fileId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );

    event AccessExpired(
        uint256 indexed fileId,
        address indexed recipient,
        uint256 timestamp
    );

    /**
     * @dev Upload a file to the registry
     * @param ipfsHash IPFS hash of the encrypted file
     * @param encryptedKeyHash Hash of the encrypted encryption key
     * @return fileId The ID of the uploaded file
     */
    function uploadFile(
        string memory ipfsHash,
        string memory encryptedKeyHash
    ) public returns (uint256) {
        fileCounter++;
        uint256 fileId = fileCounter;

        files[fileId] = File({
            id: fileId,
            owner: msg.sender,
            ipfsHash: ipfsHash,
            encryptedKeyHash: encryptedKeyHash,
            timestamp: block.timestamp
        });

        fileOwners[fileId] = msg.sender;

        emit FileUploaded(
            fileId,
            msg.sender,
            ipfsHash,
            encryptedKeyHash,
            block.timestamp
        );

        return fileId;
    }

    /**
     * @dev Get file metadata
     * @param fileId The ID of the file
     * @return File struct containing file metadata
     */
    function getFile(uint256 fileId) public view returns (File memory) {
        require(files[fileId].id != 0, "File does not exist");
        return files[fileId];
    }

    /**
     * @dev Grant access to a file
     * @param fileId The ID of the file
     * @param recipient Address of the recipient
     * @param expiration Unix timestamp when access expires (0 for no expiration)
     */
    function grantAccess(
        uint256 fileId,
        address recipient,
        uint256 expiration
    ) public {
        require(files[fileId].id != 0, "File does not exist");
        require(fileOwners[fileId] == msg.sender, "Only owner can grant access");
        require(recipient != address(0), "Invalid recipient address");
        require(recipient != msg.sender, "Cannot grant access to yourself");

        // Remove revocation if previously revoked
        revokedAccess[fileId][recipient] = false;
        
        // Set expiration (0 means no expiration)
        accessExpiration[fileId][recipient] = expiration;

        emit AccessGranted(fileId, recipient, expiration, block.timestamp);
        emit FileShared(fileId, msg.sender, recipient, block.timestamp);
    }

    /**
     * @dev Revoke access to a file
     * @param fileId The ID of the file
     * @param recipient Address of the recipient
     */
    function revokeAccess(uint256 fileId, address recipient) public {
        require(files[fileId].id != 0, "File does not exist");
        require(fileOwners[fileId] == msg.sender, "Only owner can revoke access");
        require(recipient != address(0), "Invalid recipient address");

        revokedAccess[fileId][recipient] = true;
        accessExpiration[fileId][recipient] = 0;

        emit AccessRevoked(fileId, recipient, block.timestamp);
    }

    /**
     * @dev Check if a user has access to a file
     * @param fileId The ID of the file
     * @param user Address of the user to check
     * @return bool True if user has access, false otherwise
     */
    function checkAccess(uint256 fileId, address user) public view returns (bool) {
        // File must exist
        if (files[fileId].id == 0) {
            return false;
        }

        // Owner always has access
        if (fileOwners[fileId] == user) {
            return true;
        }

        // Check if access was revoked
        if (revokedAccess[fileId][user]) {
            return false;
        }

        // Check expiration
        uint256 expiration = accessExpiration[fileId][user];
        if (expiration == 0) {
            return false; // No access granted
        }

        // If expiration is set and not expired, grant access
        if (expiration > block.timestamp) {
            return true;
        }

        // Access expired
        return false;
    }

    /**
     * @dev Log an access attempt (can be called by anyone, but should be called by backend)
     * @param fileId The ID of the file
     * @param user Address of the user attempting access
     * @param success Whether the access was successful
     */
    function logAccess(uint256 fileId, address user, bool success) public {
        emit AccessAttempt(fileId, user, success, block.timestamp);
        
        // If access expired, emit AccessExpired event
        if (!success && accessExpiration[fileId][user] > 0 && accessExpiration[fileId][user] <= block.timestamp) {
            emit AccessExpired(fileId, user, block.timestamp);
        }
    }

    /**
     * @dev Get total number of files
     * @return uint256 Total file count
     */
    function getFileCount() public view returns (uint256) {
        return fileCounter;
    }

    /**
     * @dev Get files owned by an address
     * @param owner Address of the owner
     * @return uint256[] Array of file IDs owned by the address
     */
    function getFilesByOwner(address owner) public view returns (uint256[] memory) {
        uint256[] memory ownedFiles = new uint256[](fileCounter);
        uint256 count = 0;

        for (uint256 i = 1; i <= fileCounter; i++) {
            if (fileOwners[i] == owner) {
                ownedFiles[count] = i;
                count++;
            }
        }

        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = ownedFiles[i];
        }

        return result;
    }
}

