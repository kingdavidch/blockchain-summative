# MediChain - Blockchain-based Medical Records Management

MediChain is a decentralized application (DApp) that provides secure and private management of medical records using blockchain technology. This solution addresses the challenges of fragmented and insecure medical records by giving patients control over their health data while enabling secure sharing with healthcare providers.

## Features

- **Patient-Centric Control**: Patients own and control their medical records
- **Secure Data Sharing**: Granular access control for healthcare providers
- **Immutable Audit Trail**: All access and modifications are recorded on the blockchain
- **Emergency Access**: Controlled emergency access to critical medical information
- **Persistent Audit Log**: All key actions are recorded in a persistent on-chain audit log
- **Interoperability**: Standardized data format for easy integration with healthcare systems

## Smart Contract Overview

The `MedicalRecords` smart contract provides the following functionality:

- Store IPFS hashes of medical records on-chain
- Manage access permissions for healthcare providers
- Request and grant access to medical records
- Maintain an immutable audit trail of all access
- Support for emergency access scenarios (owner can grant temporary access to doctors)
- Persistent on-chain audit log of all access and modifications

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Hardhat
- An Ethereum wallet (MetaMask recommended)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd medi-chain
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Testing

Run the test suite to verify the smart contract functionality:

```bash
npx hardhat test
```

## Deployment

### Local Development

1. Start a local Hardhat node:
   ```bash
   npx hardhat node
   ```

2. In a separate terminal, deploy the contract:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

### Testnet Deployment

1. Create a `.env` file with your private key and Alchemy/Infura URL:
   ```
   PRIVATE_KEY=your_private_key
   ALCHEMY_URL=your_alchemy_url
   ```

2. Deploy to the Sepolia testnet:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

## Usage

### Adding a Medical Record

1. Upload your medical record to IPFS
2. Call `addRecord` with the IPFS hash and metadata

### Granting Access to a Doctor

1. Call `requestAccess` from the doctor's address
2. Patient calls `grantAccess` with the doctor's address

### Viewing Records

- Patients can view all their records
- Authorized doctors can view records they've been granted access to

### Emergency Access

- The contract owner can grant a doctor emergency access to a patient's records for a limited time:
  1. Owner calls `grantEmergencyAccess(patient, doctor, durationSeconds)`
  2. Owner can revoke with `revokeEmergencyAccess(patient, doctor)`
  3. While active, the doctor can view the patient's records

### Audit Log

- All key actions (add record, grant/revoke access, request access, emergency access) are recorded in a persistent on-chain audit log.
- Use the `auditLog(patient)` function to view the audit trail for a patient.

## Security Considerations

- Never share your private keys
- Always verify contract addresses
- Be cautious when granting access to your records
- Keep your wallet software up to date

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Support

For support, please open an issue in the repository.
