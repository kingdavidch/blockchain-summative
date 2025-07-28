import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useWeb3 } from '../context/Web3Context';
import { Box, Button, Card, CardBody, CardHeader, Flex, FormControl, FormLabel, Heading, Input, Table, Tbody, Td, Text, Th, Thead, Tr, useToast, VStack, Badge, HStack, Textarea } from '@chakra-ui/react';
import { CopyIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { shortenAddress } from '../utils/address';

interface AccessRequest {
  id: string;
  patient: string;
  doctor: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
  message?: string;
}

const RequestAccess = () => {
  const { contract, account } = useWeb3();
  const [patientAddress, setPatientAddress] = useState('');
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();
  const toast = useToast();

  // Mock data - replace with actual contract calls
  const { data: requests = [], isLoading } = useQuery<AccessRequest[]>({
    queryKey: ['accessRequests', account],
    queryFn: async () => {
      if (!contract || !account) return [];
      
      // This is a simplified example - you'll need to implement this in your contract
      // Return mock data for now
      return [
        {
          id: '1',
          patient: '0x123...abc',
          doctor: account,
          status: 'pending',
          timestamp: Date.now() / 1000 - 3600, // 1 hour ago
          message: 'I need access to review your latest test results.',
        },
      ];
    },
    enabled: !!contract && !!account,
  });

  // Request access mutation
  const requestAccessMutation = useMutation({
    mutationFn: async ({ patient, message }: { patient: string; message: string }) => {
      if (!contract) throw new Error('Contract not connected');
      // This would call a function in your contract to request access
      // For now, we'll just simulate a successful request
      return new Promise((resolve) => setTimeout(resolve, 2000));
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Access request sent successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setPatientAddress('');
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['accessRequests'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send access request',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  // Respond to access request mutation
  const respondToRequestMutation = useMutation({
    mutationFn: async ({ requestId, approve }: { requestId: string; approve: boolean }) => {
      if (!contract) throw new Error('Contract not connected');
      // This would call a function in your contract to respond to the request
      // For now, we'll just simulate a successful response
      return new Promise((resolve) => setTimeout(resolve, 2000));
    },
    onSuccess: (_, { approve }) => {
      toast({
        title: 'Success',
        description: `Access request ${approve ? 'approved' : 'rejected'} successfully!`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      queryClient.invalidateQueries({ queryKey: ['accessRequests'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process request',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleRequestAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientAddress) return;
    
    requestAccessMutation.mutate({
      patient: patientAddress,
      message,
    });
  };

  const handleRespondToRequest = (requestId: string, approve: boolean) => {
    respondToRequestMutation.mutate({ requestId, approve });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      default:
        return 'yellow';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <Box maxW="7xl" mx="auto" py={8} px={4}>
      <Heading as="h1" size="xl" mb={8}>
        Request Access to Medical Records
      </Heading>

      <Card mb={8}>
        <CardHeader>
          <Heading size="md">Request Access</Heading>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleRequestAccess}>
            <VStack gap={6} align="stretch">
              <FormControl isRequired>
                <FormLabel>Patient's Ethereum Address</FormLabel>
                <Input
                  placeholder="0x..."
                  value={patientAddress}
                  onChange={(e) => setPatientAddress(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Message (Optional)</FormLabel>
                <Textarea
                  placeholder="Explain why you need access to these medical records..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="brand"
                loading={requestAccessMutation.isPending}
                loadingText="Sending Request..."
                isDisabled={!patientAddress}
              >
                Send Access Request
              </Button>
            </VStack>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <Heading size="md">Access Requests</Heading>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <Box textAlign="center" py={8}>
              <Text>Loading requests...</Text>
            </Box>
          ) : requests.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Text color="gray.500">No access requests found.</Text>
            </Box>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Patient</Th>
                    <Th>Status</Th>
                    <Th>Date</Th>
                    <Th>Message</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {requests.map((request) => (
                    <Tr key={request.id}>
                      <Td>
                        <HStack>
                          <Text fontFamily="mono">{shortenAddress(request.patient)}</Text>
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText(request.patient);
                              toast({
                                title: 'Copied!',
                                status: 'info',
                                duration: 2000,
                                isClosable: true,
                              });
                            }}
                          >
                            <CopyIcon />
                          </Button>
                        </HStack>
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </Td>
                      <Td>{formatDate(request.timestamp)}</Td>
                      <Td maxW="300px" whiteSpace="normal">
                        {request.message || 'No message provided'}
                      </Td>
                      <Td>
                        {request.status === 'pending' && (
                          <HStack gap={2}>
                            <Button
                              size="sm"
                              colorScheme="green"
                              variant="outline"
                              leftIcon={<CheckIcon />}
                              onClick={() => handleRespondToRequest(request.id, true)}
                              loading={respondToRequestMutation.isPending}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="outline"
                              leftIcon={<CloseIcon />}
                              onClick={() => handleRespondToRequest(request.id, false)}
                              loading={respondToRequestMutation.isPending}
                            >
                              Reject
                            </Button>
                          </HStack>
                        )}
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

export default RequestAccess;
