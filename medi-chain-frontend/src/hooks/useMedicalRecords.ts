import { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { toast } from '../utils/toast';
import { MedicalRecords } from '../../medi-chain/typechain-types';

interface RecordMetadata {
  title: string;
  description: string;
  date: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

interface AccessGrant {
  doctor: string;
  timestamp: number;
  status: 'active' | 'revoked';
}

interface AccessRequest {
  id: string;
  patient: string;
  doctor: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
  message?: string;
}

const useMedicalRecords = () => {
  const { contract, account } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Helper function to handle contract calls with loading and error states
  const callContract = useCallback(
    async <T,>(
      contractFn: (contract: MedicalRecords, ...args: any[]) => Promise<T>,
      ...args: any[]
    ): Promise<T | undefined> => {
      if (!contract || !account) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await contractFn(contract as MedicalRecords, ...args);
        return result;
      } catch (err) {
        console.error('Contract call failed:', err);
        const error = err as Error;
        setError(error);
        toast({
          title: 'Error',
          description: error.message || 'Transaction failed',
          status: 'error',
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [contract, account]
  );

  // Add a new medical record
  const addRecord = useCallback(
    async (ipfsHash: string, metadata: RecordMetadata): Promise<string> => {
      const tx = await callContract(
        async (contract) => {
          const tx = await contract.addRecord(ipfsHash, JSON.stringify(metadata));
          await tx.wait();
          return tx;
        }
      );

      if (!tx) throw new Error('Failed to add record');
      return tx.hash;
    },
    [callContract]
  );

  // Get all record hashes for a patient
  const getRecordHashes = useCallback(
    async (patientAddress: string): Promise<string[]> => {
      const hashes = await callContract(
        (contract) => contract.getRecordHashes(patientAddress)
      );
      return hashes || [];
    },
    [callContract]
  );

  // Get record metadata
  const getRecordMetadata = useCallback(
    async (patientAddress: string, recordHash: string): Promise<RecordMetadata> => {
      const metadata = await callContract(
        (contract) => contract.getRecordMetadata(patientAddress, recordHash)
      );
      
      if (!metadata) throw new Error('Record not found');
      return typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
    },
    [callContract]
  );

  // Grant access to a doctor
  const grantAccess = useCallback(
    async (doctorAddress: string, recordHash: string): Promise<string> => {
      const tx = await callContract(
        async (contract) => {
          const tx = await contract.grantAccess(doctorAddress, recordHash);
          await tx.wait();
          return tx;
        }
      );

      if (!tx) throw new Error('Failed to grant access');
      return tx.hash;
    },
    [callContract]
  );

  // Revoke access from a doctor
  const revokeAccess = useCallback(
    async (doctorAddress: string, recordHash: string): Promise<string> => {
      const tx = await callContract(
        async (contract) => {
          const tx = await contract.revokeAccess(doctorAddress, recordHash);
          await tx.wait();
          return tx;
        }
      );

      if (!tx) throw new Error('Failed to revoke access');
      return tx.hash;
    },
    [callContract]
  );

  // Request access to a patient's records
  const requestAccess = useCallback(
    async (patientAddress: string, message: string = ''): Promise<string> => {
      const tx = await callContract(
        async (contract) => {
          const tx = await contract.requestAccess(patientAddress, message);
          await tx.wait();
          return tx;
        }
      );

      if (!tx) throw new Error('Failed to request access');
      return tx.hash;
    },
    [callContract]
  );

  // Respond to an access request
  const respondToRequest = useCallback(
    async (requestId: string, approve: boolean): Promise<string> => {
      const tx = await callContract(
        async (contract) => {
          const tx = approve 
            ? await contract.approveAccess(requestId)
            : await contract.rejectAccess(requestId);
          await tx.wait();
          return tx;
        }
      );

      if (!tx) throw new Error(`Failed to ${approve ? 'approve' : 'reject'} request`);
      return tx.hash;
    },
    [callContract]
  );

  // Get access grants for a record
  const getAccessGrants = useCallback(
    async (recordHash: string): Promise<AccessGrant[]> => {
      // This would be implemented based on your contract's access control structure
      // For now, return an empty array as a placeholder
      return [];
    },
    []
  );

  // Get access requests for the current user
  const getAccessRequests = useCallback(
    async (): Promise<AccessRequest[]> => {
      // This would be implemented based on your contract's request structure
      // For now, return an empty array as a placeholder
      return [];
    },
    []
  );

  return {
    isLoading,
    error,
    addRecord,
    getRecordHashes,
    getRecordMetadata,
    grantAccess,
    revokeAccess,
    requestAccess,
    respondToRequest,
    getAccessGrants,
    getAccessRequests,
  };
};

export default useMedicalRecords;
