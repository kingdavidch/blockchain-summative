import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWeb3 } from '../context/Web3Context';
import { Box, Button, Flex, Heading, Input, Select, Text, VStack, Badge } from '@chakra-ui/react';
import { Card, CardBody, CardHeader } from '../components/CardComponents';
import { FormControl, FormLabel } from '../components/FormComponents';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/TableComponents';
import { SearchIcon, CopyIcon, DeleteIcon } from '@chakra-ui/icons';
import { useToast } from '../hooks/useToast';
import { shortenAddress } from '../utils/address';
import { Select } from '../components/SelectComponent';
import { ButtonWithIcon } from '../components/ButtonWithIcon';

interface AccessGrant {
  doctor: string;
  timestamp: number;
  status: 'active' | 'revoked';
}

const ShareAccess = () => {
  const { contract, account } = useWeb3();
  const [doctorAddress, setDoctorAddress] = useState('');
  const [selectedRecord, setSelectedRecord] = useState('');
  const [records, setRecords] = useState<Array<{ hash: string; metadata: string }>>([]);
  const queryClient = useQueryClient();
  const toast = useToast();

  // Fetch records to share
  const { data: patientRecords = [], isLoading: isLoadingRecords } = useQuery({
    queryKey: ['patientRecords', account],
    queryFn: async () => {
      if (!contract || !account) return [];
      try {
        const hashes = await contract.getRecordHashes(account);
        const recordsData = [];
        
        for (const hash of hashes) {
          const metadata = await contract.getRecordMetadata(account, hash);
          recordsData.push({ hash, metadata });
        }
        
        setRecords(recordsData);
        if (recordsData.length > 0 && !selectedRecord) {
          setSelectedRecord(recordsData[0].hash);
        }
        
        return recordsData;
      } catch (error) {
        console.error('Error fetching records:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your records.',
          status: 'error',
          duration: 5000,
        });
        return [];
      }
    },
    enabled: !!contract && !!account,
  });

  // Fetch access grants
  const { data: accessGrants = [], refetch: refetchGrants } = useQuery<AccessGrant[]>({
    queryKey: ['accessGrants', account],
    queryFn: async () => {
      if (!contract || !account) return [];
      try {
        // This is a simplified example - you'll need to implement this in your contract
        // Return mock data for now
        return [];
      } catch (error) {
        console.error('Error fetching access grants:', error);
        toast({
          title: 'Error',
          description: 'Failed to load access grants.',
          status: 'error',
          duration: 5000,
        });
        return [];
      }
    },
    enabled: !!contract && !!account,
  });

  // Grant access mutation
  const grantAccessMutation = useMutation({
    mutationFn: async ({ doctor, recordHash }: { doctor: string; recordHash: string }) => {
      if (!contract) throw new Error('Contract not connected');
      const tx = await contract.grantAccess(doctor);
      await tx.wait();
      return tx.hash;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Access granted successfully!',
        status: 'success',
        duration: 5000,
      });
      setDoctorAddress('');
      refetchGrants();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to grant access',
        status: 'error',
        duration: 5000,
      });
    },
  });

  // Revoke access mutation
  const revokeAccessMutation = useMutation({
    mutationFn: async (doctor: string) => {
      if (!contract) throw new Error('Contract not connected');
      const tx = await contract.revokeAccess(doctor);
      await tx.wait();
      return tx.hash;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Access revoked successfully!',
        status: 'success',
        duration: 5000,
      });
      refetchGrants();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to revoke access',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorAddress || !selectedRecord) return;
    
    await grantAccessMutation.mutateAsync({
      doctor: doctorAddress,
      recordHash: selectedRecord,
    });
  };

  const handleRevokeAccess = async (doctor: string) => {
    if (!window.confirm('Are you sure you want to revoke access?')) return;
    await revokeAccessMutation.mutateAsync(doctor);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      status: 'info',
      duration: 2000,
    });
  };

  return (
    <Box maxW="7xl" mx="auto" py={8} px={4}>
      <Heading as="h1" size="xl" mb={8}>
        Share Access to Medical Records
      </Heading>

      <Card mb={8}>
        <CardHeader>
          <Heading size="md">Grant Access</Heading>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleGrantAccess}>
            <VStack gap={6} align="stretch">
              <FormControl isRequired>
                <FormLabel>Select Record to Share</FormLabel>
                <Select
                  placeholder="Select record"
                  value={selectedRecord}
                  onChange={(e) => setSelectedRecord(e.target.value)}
                  isDisabled={isLoadingRecords}
                >
                  {records.map((record) => (
                    <option key={record.hash} value={record.hash}>
                      {record.metadata || 'Untitled Record'} ({shortenAddress(record.hash)})
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Doctor's Ethereum Address</FormLabel>
                <Input
                  placeholder="0x..."
                  value={doctorAddress}
                  onChange={(e) => setDoctorAddress(e.target.value)}
                  disabled={!selectedRecord}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="brand"
                loading={grantAccessMutation.isPending}
                loadingText="Granting Access..."
                disabled={!doctorAddress || !selectedRecord}
              >
                Grant Access
              </Button>
            </VStack>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <Heading size="md">Access Permissions</Heading>
        </CardHeader>
        <CardBody>
          {accessGrants.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Text color="gray.500">No access permissions granted yet.</Text>
            </Box>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Doctor</Th>
                    <Th>Record</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {accessGrants.map((grant, index) => (
                    <Tr key={index}>
                      <Td>
                        <Flex align="center">
                          <Text fontFamily="mono">{shortenAddress(grant.doctor)}</Text>
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => copyToClipboard(grant.doctor)}
                            ml={2}
                          >
                            <CopyIcon />
                          </Button>
                        </Flex>
                      </Td>
                      <Td>{/* Record info would go here */}</Td>
                      <Td>
                        <Badge
                          colorScheme={grant.status === 'active' ? 'green' : 'red'}
                          variant="subtle"
                        >
                          {grant.status}
                        </Badge>
                      </Td>
                      <Td>
                        <ButtonWithIcon
                          size="sm"
                          colorScheme="red"
                          variant="outline"
                          leftIcon={<DeleteIcon />}
                          onClick={() => handleRevokeAccess(grant.doctor)}
                          loading={revokeAccessMutation.isPending}
                        >
                          Revoke
                        </ButtonWithIcon>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>
    </Box>
  );
};

export default ShareAccess;
