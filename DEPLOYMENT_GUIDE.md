# MediChain Deployment Guide

## Prerequisites

Before deploying MediChain, ensure you have:

1. **Node.js** (v16 or later) installed
2. **Git** installed
3. **MetaMask** browser extension
4. **Sepolia testnet ETH** (get from faucets)
5. **Alchemy** or **Infura** account for RPC endpoint

## Step-by-Step Deployment Instructions

### 1. Environment Setup

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd medi-chain
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` file with your credentials:
   ```
   PRIVATE_KEY=your_metamask_private_key_without_0x
   ALCHEMY_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
   ```

### 2. Smart Contract Compilation and Testing

1. Compile the contracts:
   ```bash
   npx hardhat compile
   ```

2. Run tests to verify functionality:
   ```bash
   npx hardhat test
   ```

   Expected output: All tests should pass (16 passing)

### 3. Local Deployment (Development)

1. Start local Hardhat network:
   ```bash
   npx hardhat node
   ```
   
   **Note**: Keep this terminal open - it shows the local blockchain running

2. In a new terminal, deploy to local network:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

   Expected output:
   ```
   Deploying contracts with the account: 0x...
   Account balance: ...
   MedicalRecords deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
   ```

### 4. Testnet Deployment (Sepolia)

1. Ensure you have Sepolia ETH in your wallet
2. Deploy to Sepolia testnet:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

   Expected output:
   ```
   Deploying contracts with the account: 0x...
   Account balance: ...
   MedicalRecords deployed to: 0x... (actual testnet address)
   ```

3. **IMPORTANT**: Save the deployed contract address - you'll need it for the frontend

### 5. Frontend Configuration

1. Navigate to frontend directory:
   ```bash
   cd ../medi-chain-frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Update contract address in `src/config.ts`:
   ```typescript
   export const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';
   ```

4. Start the frontend application:
   ```bash
   npm run dev
   ```

### 6. Verification Steps

1. **Smart Contract Verification**:
   - Open [Sepolia Etherscan](https://sepolia.etherscan.io/)
   - Search for your contract address
   - Verify the contract is deployed successfully

2. **Frontend Verification**:
   - Open the frontend in your browser
   - Connect your MetaMask wallet
   - Test basic functionality (add record, view records)

## Troubleshooting

### Common Issues:

1. **"Insufficient funds"**: Ensure you have enough Sepolia ETH
2. **"Invalid private key"**: Check your `.env` file format
3. **"Network connection error"**: Verify your Alchemy/Infura URL
4. **Frontend connection issues**: Ensure contract address is correctly updated

### Getting Testnet ETH:

1. [Sepolia Faucet 1](https://sepoliafaucet.com/)
2. [Sepolia Faucet 2](https://faucet.sepolia.dev/)
3. [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)

## Security Considerations

- ⚠️ **Never share your private keys**
- ⚠️ **Never commit `.env` file to version control**
- ⚠️ **Only use testnet ETH for testing**
- ⚠️ **Verify contract addresses before interacting**

## Next Steps

After successful deployment:

1. Document the deployment transaction hash
2. Take screenshots of successful deployment
3. Test all smart contract functions
4. Document any issues encountered
5. Update the project report with deployment details
