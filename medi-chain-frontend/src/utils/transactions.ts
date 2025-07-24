import { ethers } from 'ethers';
import { toast } from './toast';

interface TransactionResponse extends ethers.TransactionResponse {}

export const handleTransaction = async (
  txPromise: Promise<TransactionResponse>,
  options: {
    pending: string;
    success: string;
    errorPrefix?: string;
    onSuccess?: (receipt: ethers.TransactionReceipt) => void;
    onError?: (error: any) => void;
  }
): Promise<ethers.TransactionReceipt | null> => {
  const toastId = toast.info(options.pending, '', { duration: null });
  
  try {
    const tx = await txPromise;
    const receipt = await tx.wait();
    
    toast.close(toastId);
    toast.success('Transaction Mined', options.success);
    
    if (options.onSuccess) {
      options.onSuccess(receipt);
    }
    
    return receipt;
  } catch (error: any) {
    console.error('Transaction failed:', error);
    
    let errorMessage = 'Transaction failed';
    
    if (error.code === 'ACTION_REJECTED') {
      errorMessage = 'User denied transaction';
    } else if (error.data?.message) {
      errorMessage = error.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    toast.close(toastId);
    const prefix = options.errorPrefix ? `${options.errorPrefix}: ` : '';
    toast.error('Transaction Failed', `${prefix}${errorMessage}`);
    
    if (options.onError) {
      options.onError(error);
    }
    
    return null;
  }
};

// Helper to parse common transaction errors
export const parseTransactionError = (error: any): string => {
  if (!error) return 'Unknown error';
  
  // Handle user rejection
  if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
    return 'Transaction was rejected by user';
  }
  
  // Handle insufficient funds
  if (error.code === 'INSUFFICIENT_FUNDS') {
    return 'Insufficient funds for transaction';
  }
  
  // Handle gas estimation errors
  if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
    return 'Transaction would fail. Check your inputs and try again.';
  }
  
  // Handle contract revert with reason
  if (error.data?.message) {
    const revertMatch = error.data.message.match(/revert\s+(.+)/);
    if (revertMatch) return revertMatch[1];
    return error.data.message;
  }
  
  // Handle JSON-RPC errors
  if (error.error?.data?.message) {
    return error.error.data.message;
  }
  
  // Handle generic error messages
  if (error.message) {
    return error.message;
  }
  
  return 'An unknown error occurred';
};

// Helper to shorten transaction hashes
export const shortenTxHash = (hash: string, startLength = 6, endLength = 4): string => {
  if (!hash || hash.length <= startLength + endLength) return hash;
  return `${hash.substring(0, startLength)}...${hash.substring(hash.length - endLength)}`;
};

// Helper to get Etherscan URL
export const getEtherscanUrl = (txHash: string, network: string = 'sepolia'): string => {
  const subdomain = network === 'mainnet' ? '' : `${network}.`;
  return `https://${subdomain}etherscan.io/tx/${txHash}`;
};
