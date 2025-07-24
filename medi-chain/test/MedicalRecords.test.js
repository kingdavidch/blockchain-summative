const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MedicalRecords", function () {
  let medicalRecords;
  let owner, patient, doctor, otherAccount;

  beforeEach(async function () {
    // Get signers
    [owner, patient, doctor, otherAccount] = await ethers.getSigners();

    // Deploy the contract
    const MedicalRecords = await ethers.getContractFactory("MedicalRecords");
    medicalRecords = await MedicalRecords.deploy();
  });

  it("Should allow adding medical records", async function () {
    // Patient adds a record
    await medicalRecords.connect(patient).addRecord("QmHash1", "2023-01-01 General Checkup");
    
    // Get the record hashes
    const hashes = await medicalRecords.connect(patient).getRecordHashes(patient.address);
    
    // Verify the record was added
    expect(hashes.length).to.equal(1);
    expect(hashes[0]).to.equal("QmHash1");
    
    // Verify metadata
    const metadata = await medicalRecords.connect(patient).getRecordMetadata(patient.address, "QmHash1");
    expect(metadata).to.equal("2023-01-01 General Checkup");
  });

  it("Should allow granting and revoking doctor access", async function () {
    // Patient adds a record
    await medicalRecords.connect(patient).addRecord("QmHash1", "2023-01-01 General Checkup");
    
    // Initially, doctor should not have access
    await expect(
      medicalRecords.connect(doctor).getRecordHashes(patient.address)
    ).to.be.revertedWith("Not authorized to view records");
    
    // Grant access to doctor
    await medicalRecords.connect(patient).grantAccess(doctor.address);
    
    // Now doctor should have access
    const hashes = await medicalRecords.connect(doctor).getRecordHashes(patient.address);
    expect(hashes.length).to.equal(1);
    
    // Revoke access
    await medicalRecords.connect(patient).revokeAccess(doctor.address);
    
    // Doctor should no longer have access
    await expect(
      medicalRecords.connect(doctor).getRecordHashes(patient.address)
    ).to.be.revertedWith("Not authorized to view records");
  });

  it("Should handle access requests", async function () {
    // First, the patient needs to add a record to exist in the system
    await medicalRecords.connect(patient).addRecord("QmHash1", "2023-01-01 General Checkup");
    
    // Doctor requests access
    await medicalRecords.connect(doctor).requestAccess(patient.address);
    
    // Get access requests
    const requests = await medicalRecords.connect(patient).getAccessRequests(patient.address);
    expect(requests.length).to.equal(1);
    expect(requests[0].doctor).to.equal(doctor.address);
    expect(requests[0].approved).to.be.false;
    
    // Grant access
    await medicalRecords.connect(patient).grantAccess(doctor.address);
    
    // Verify access
    const hasAccess = await medicalRecords.hasAccess(patient.address, doctor.address);
    expect(hasAccess).to.be.true;
  });

  it("Should not allow unauthorized access", async function () {
    // Patient adds a record
    await medicalRecords.connect(patient).addRecord("QmHash1", "2023-01-01 General Checkup");
    
    // Other account should not have access
    await expect(
      medicalRecords.connect(otherAccount).getRecordHashes(patient.address)
    ).to.be.revertedWith("Not authorized to view records");
  });

  it("Should allow owner to grant and revoke emergency access", async function () {
    // Patient adds a record
    await medicalRecords.connect(patient).addRecord("QmHash1", "2023-01-01 General Checkup");

    // Owner grants emergency access to doctor for 1 hour
    const oneHour = 3600;
    await medicalRecords.connect(owner).grantEmergencyAccess(patient.address, doctor.address, oneHour);

    // Doctor can now view records
    const hashes = await medicalRecords.connect(doctor).getRecordHashes(patient.address);
    expect(hashes.length).to.equal(1);

    // Owner revokes emergency access
    await medicalRecords.connect(owner).revokeEmergencyAccess(patient.address, doctor.address);

    // Doctor should no longer have access
    await expect(
      medicalRecords.connect(doctor).getRecordHashes(patient.address)
    ).to.be.revertedWith("Not authorized to view records");
  });

  it("Should expire emergency access after duration", async function () {
    // Patient adds a record
    await medicalRecords.connect(patient).addRecord("QmHash1", "2023-01-01 General Checkup");

    // Owner grants emergency access to doctor for 1 second
    await medicalRecords.connect(owner).grantEmergencyAccess(patient.address, doctor.address, 1);

    // Doctor can view records immediately
    await medicalRecords.connect(doctor).getRecordHashes(patient.address);

    // Increase time by 2 seconds
    await ethers.provider.send("evm_increaseTime", [2]);
    await ethers.provider.send("evm_mine");

    // Doctor should no longer have access
    await expect(
      medicalRecords.connect(doctor).getRecordHashes(patient.address)
    ).to.be.revertedWith("Not authorized to view records");
  });

  it("Should log audit entries for emergency access actions", async function () {
    // Patient adds a record
    await medicalRecords.connect(patient).addRecord("QmHash1", "2023-01-01 General Checkup");

    // Owner grants emergency access
    await medicalRecords.connect(owner).grantEmergencyAccess(patient.address, doctor.address, 100);

    // Check audit log
    const auditLog = await medicalRecords.getAuditLog(patient.address);
    const lastEntry = auditLog[auditLog.length - 1];
    expect(lastEntry.action).to.equal("grantEmergencyAccess");
    expect(lastEntry.actor).to.equal(owner.address);

    // Owner revokes emergency access
    await medicalRecords.connect(owner).revokeEmergencyAccess(patient.address, doctor.address);
    const auditLog2 = await medicalRecords.getAuditLog(patient.address);
    const lastEntry2 = auditLog2[auditLog2.length - 1];
    expect(lastEntry2.action).to.equal("revokeEmergencyAccess");
    expect(lastEntry2.actor).to.equal(owner.address);
  });
});
