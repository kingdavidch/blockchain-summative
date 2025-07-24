// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MedicalRecords
 * @dev A smart contract for managing secure and private medical records on the blockchain
 */
contract MedicalRecords is Ownable {
    constructor() Ownable(msg.sender) {}

    // Struct to store patient information
    struct Patient {
        bool exists;
        mapping(address => bool) authorizedDoctors; // Doctors with access to records
        string[] recordHashes; // IPFS hashes of medical records
        mapping(string => string) recordMetadata; // Metadata for each record (e.g., date, type)
    }

    // Struct for access request
    struct AccessRequest {
        address doctor;
        bool approved;
        uint256 timestamp;
    }

    // Emergency access struct
    struct EmergencyAccess {
        address doctor;
        uint256 expiresAt;
    }
    // Mapping from patient to emergency access (doctor => expiry)
    mapping(address => mapping(address => uint256)) public emergencyAccess;

    // Persistent audit log: array of actions per patient
    struct AuditEntry {
        address actor;
        string action;
        string details;
        uint256 timestamp;
    }
    mapping(address => AuditEntry[]) public auditLog;

    // Mapping from patient address to their data
    mapping(address => Patient) private patients;
    
    // Mapping for tracking access requests
    mapping(address => AccessRequest[]) private accessRequests;

    // Events
    event RecordAdded(address indexed patient, string recordHash, string metadata);
    event AccessGranted(address indexed patient, address indexed doctor);
    event AccessRevoked(address indexed patient, address indexed doctor);
    event AccessRequested(address indexed patient, address indexed doctor);
    event EmergencyAccessGranted(address indexed patient, address indexed doctor, uint256 expiresAt);
    event EmergencyAccessRevoked(address indexed patient, address indexed doctor);
    event AuditLogEntry(address indexed patient, address indexed actor, string action, string details, uint256 timestamp);

    /**
     * @dev Add a new medical record
     * @param _recordHash IPFS hash of the medical record
     * @param _metadata Metadata about the record (e.g., date, record type)
     */
    function addRecord(string memory _recordHash, string memory _metadata) public {
        Patient storage patient = patients[msg.sender];
        
        if (!patient.exists) {
            patient.exists = true;
        }
        
        patient.recordHashes.push(_recordHash);
        patient.recordMetadata[_recordHash] = _metadata;
        
        emit RecordAdded(msg.sender, _recordHash, _metadata);
        auditLog[msg.sender].push(AuditEntry({
            actor: msg.sender,
            action: "addRecord",
            details: _recordHash,
            timestamp: block.timestamp
        }));
        emit AuditLogEntry(msg.sender, msg.sender, "addRecord", _recordHash, block.timestamp);
    }

    /**
     * @dev Grant access to a doctor
     * @param _doctor Address of the doctor to grant access to
     */
    function grantAccess(address _doctor) public {
        require(patients[msg.sender].exists, "Patient does not exist");
        patients[msg.sender].authorizedDoctors[_doctor] = true;
        emit AccessGranted(msg.sender, _doctor);
        auditLog[msg.sender].push(AuditEntry({
            actor: msg.sender,
            action: "grantAccess",
            details: toAsciiString(_doctor),
            timestamp: block.timestamp
        }));
        emit AuditLogEntry(msg.sender, msg.sender, "grantAccess", toAsciiString(_doctor), block.timestamp);
    }

    /**
     * @dev Revoke access from a doctor
     * @param _doctor Address of the doctor to revoke access from
     */
    function revokeAccess(address _doctor) public {
        require(patients[msg.sender].exists, "Patient does not exist");
        patients[msg.sender].authorizedDoctors[_doctor] = false;
        emit AccessRevoked(msg.sender, _doctor);
        auditLog[msg.sender].push(AuditEntry({
            actor: msg.sender,
            action: "revokeAccess",
            details: toAsciiString(_doctor),
            timestamp: block.timestamp
        }));
        emit AuditLogEntry(msg.sender, msg.sender, "revokeAccess", toAsciiString(_doctor), block.timestamp);
    }

    /**
     * @dev Request access to a patient's records
     * @param _patient Address of the patient
     */
    function requestAccess(address _patient) public {
        require(patients[_patient].exists, "Patient does not exist");
        accessRequests[_patient].push(AccessRequest({
            doctor: msg.sender,
            approved: false,
            timestamp: block.timestamp
        }));
        emit AccessRequested(_patient, msg.sender);
        auditLog[_patient].push(AuditEntry({
            actor: msg.sender,
            action: "requestAccess",
            details: toAsciiString(msg.sender),
            timestamp: block.timestamp
        }));
        emit AuditLogEntry(_patient, msg.sender, "requestAccess", toAsciiString(msg.sender), block.timestamp);
    }

    /**
     * @dev Grant emergency access to a doctor for a patient's records
     * @param _patient Address of the patient
     * @param _doctor Address of the doctor to grant emergency access to
     * @param durationSeconds Duration in seconds for which access is granted
     */
    function grantEmergencyAccess(address _patient, address _doctor, uint256 durationSeconds) external onlyOwner {
        require(patients[_patient].exists, "Patient does not exist");
        uint256 expiresAt = block.timestamp + durationSeconds;
        emergencyAccess[_patient][_doctor] = expiresAt;
        emit EmergencyAccessGranted(_patient, _doctor, expiresAt);
        auditLog[_patient].push(AuditEntry({
            actor: msg.sender,
            action: "grantEmergencyAccess",
            details: string(abi.encodePacked("Doctor: ", toAsciiString(_doctor), ", Expires: ", uint2str(expiresAt))),
            timestamp: block.timestamp
        }));
        emit AuditLogEntry(_patient, msg.sender, "grantEmergencyAccess", string(abi.encodePacked("Doctor: ", toAsciiString(_doctor), ", Expires: ", uint2str(expiresAt))), block.timestamp);
    }

    /**
     * @dev Revoke emergency access from a doctor for a patient's records
     * @param _patient Address of the patient
     * @param _doctor Address of the doctor to revoke emergency access from
     */
    function revokeEmergencyAccess(address _patient, address _doctor) external onlyOwner {
        require(emergencyAccess[_patient][_doctor] > 0, "No emergency access");
        emergencyAccess[_patient][_doctor] = 0;
        emit EmergencyAccessRevoked(_patient, _doctor);
        auditLog[_patient].push(AuditEntry({
            actor: msg.sender,
            action: "revokeEmergencyAccess",
            details: string(abi.encodePacked("Doctor: ", toAsciiString(_doctor))),
            timestamp: block.timestamp
        }));
        emit AuditLogEntry(_patient, msg.sender, "revokeEmergencyAccess", string(abi.encodePacked("Doctor: ", toAsciiString(_doctor))), block.timestamp);
    }

    /**
     * @dev Get record hashes for a patient (only accessible by patient or authorized doctors)
     * @param _patient Address of the patient
     * @return Array of record hashes
     */
    function getRecordHashes(address _patient) public view returns (string[] memory) {
        require(patients[_patient].exists, "Patient does not exist");
        require(
            msg.sender == _patient || 
            patients[_patient].authorizedDoctors[msg.sender] || 
            msg.sender == owner() ||
            (emergencyAccess[_patient][msg.sender] > block.timestamp),
            "Not authorized to view records"
        );
        
        return patients[_patient].recordHashes;
    }

    /**
     * @dev Get metadata for a specific record
     * @param _patient Address of the patient
     * @param _recordHash Hash of the record to get metadata for
     * @return Metadata string
     */
    function getRecordMetadata(address _patient, string memory _recordHash) public view returns (string memory) {
        require(patients[_patient].exists, "Patient does not exist");
        require(
            msg.sender == _patient || 
            patients[_patient].authorizedDoctors[msg.sender] || 
            msg.sender == owner() ||
            (emergencyAccess[_patient][msg.sender] > block.timestamp),
            "Not authorized to view record metadata"
        );
        
        return patients[_patient].recordMetadata[_recordHash];
    }

    /**
     * @dev Check if a doctor has access to a patient's records
     * @param _patient Address of the patient
     * @param _doctor Address of the doctor
     * @return Boolean indicating if access is granted
     */
    function hasAccess(address _patient, address _doctor) public view returns (bool) {
        return patients[_patient].authorizedDoctors[_doctor] || _doctor == owner();
    }

    /**
     * @dev Get pending access requests for a patient
     * @param _patient Address of the patient
     * @return Array of AccessRequest structs
     */
    function getAccessRequests(address _patient) public view returns (AccessRequest[] memory) {
        require(msg.sender == _patient || msg.sender == owner(), "Not authorized");
        return accessRequests[_patient];
    }

    // Utility functions for string conversions
    function toAsciiString(address x) internal pure returns (string memory) {
        bytes memory s = new bytes(42);
        s[0] = '0';
        s[1] = 'x';
        for (uint i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint(uint160(x)) / (2**(8*(19 - i)))));
            uint8 hi = uint8(b) / 16;
            uint8 lo = uint8(b) - 16 * hi;
            s[2*i + 2] = char(hi);
            s[2*i + 3] = char(lo);
        }
        return string(s);
    }
    function char(uint8 b) internal pure returns (bytes1 c) {
        if (b < 10) return bytes1(b + 0x30);
        else return bytes1(b + 0x57);
    }
    function uint2str(uint v) internal pure returns (string memory str) {
        if (v == 0) {
            return "0";
        }
        uint maxlength = 100;
        bytes memory reversed = new bytes(maxlength);
        uint i = 0;
        while (v != 0) {
            uint remainder = v % 10;
            v = v / 10;
            reversed[i++] = bytes1(uint8(48 + remainder));
        }
        bytes memory s = new bytes(i);
        for (uint j = 0; j < i; j++) {
            s[j] = reversed[i - j - 1];
        }
        str = string(s);
    }

    /**
     * @dev Returns the audit log for a patient
     * @param _patient Address of the patient
     * @return Array of AuditEntry structs
     */
    function getAuditLog(address _patient) public view returns (AuditEntry[] memory) {
        return auditLog[_patient];
    }
}
