import { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { MedicalRecords__factory } from '../../../medi-chain/typechain-types';
import { CONTRACT_ADDRESS } from '../config';

type Web3ContextType = {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  account: string | null;
  contract: any;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  chainId: number | null;
};

const Web3Context = createContext<Web3ContextType>({} as Web3ContextType);

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);

  const connect = async () => {
    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        window.open('https://metamask.io/download.html', '_blank');
        return;
      }

      const provider = new ethers.BrowserProvider(ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      
      const contract = MedicalRecords__factory.connect(CONTRACT_ADDRESS, signer);
      
      setProvider(provider);
      setSigner(signer);
      setAccount(accounts[0]);
      setContract(contract);
      setChainId(Number(network.chainId));
      setIsConnected(true);
      
      // Set up event listeners
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);
      
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  };

  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setContract(null);
    setChainId(null);
    setIsConnected(false);
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect();
    } else if (account !== accounts[0]) {
      setAccount(accounts[0]);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  useEffect(() => {
    const checkConnection = async () => {
      const provider = await detectEthereumProvider();
      if (provider) {
        const ethProvider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await ethProvider.send('eth_accounts', []);
        
        if (accounts.length > 0) {
          const signer = await ethProvider.getSigner();
          const network = await ethProvider.getNetwork();
          const contract = MedicalRecords__factory.connect(CONTRACT_ADDRESS, signer);
          
          setProvider(ethProvider);
          setSigner(signer);
          setAccount(accounts[0]);
          setContract(contract);
          setChainId(Number(network.chainId));
          setIsConnected(true);
        }
      }
    };

    checkConnection();

    return () => {
      const ethereum = (window as any).ethereum;
      if (ethereum) {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        account,
        contract,
        connect,
        disconnect,
        isConnected,
        chainId,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
