import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWeb3 } from '../context/Web3Context';
import { MedicalRecords__factory } from '../../medi-chain/typechain-types';
import { Box, Button, Card, CardBody, CardHeader, Flex, Heading, Text, VStack, useToast, HStack, Badge, Input, InputGroup, InputLeftElement, InputRightElement, IconButton, Spinner } from '@chakra-ui/react';
import { SearchIcon, AddIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';

interface MedicalRecord {
  hash: string;
  metadata: string;
  timestamp: number;
}

const Records = () => {
  const { contract, account } = useWeb3();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const toast = useToast();

  const { data: records = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['records', account],
    queryFn: async () => {
      if (!contract || !account) return [];
      try {
        const hashes = await contract.getRecordHashes(account);
        
        const recordsData = await Promise.all(
          hashes.map(async (hash: string) => {
            const metadata = await contract.getRecordMetadata(account, hash);
            // Get block timestamp as a fallback
            const block = await contract.provider.getBlock('latest');
            return {
              hash,
              metadata,
              timestamp: block?.timestamp || Math.floor(Date.now() / 1000),
            };
          })
        );
        
        // Sort by timestamp (newest first)
        return recordsData.sort((a, b) => b.timestamp - a.timestamp);
      } catch (error) {
        console.error('Error fetching records:', error);
        toast({
          title: 'Error',
          description: 'Failed to load medical records.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return [];
      }
    },
    enabled: !!contract && !!account,
  });

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRecords(records);
    } else {
      const filtered = records.filter(record =>
        record.metadata.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.hash.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRecords(filtered);
    }
  }, [searchTerm, records]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={20}>
        <Spinner size="xl" />
        <Text mt={4}>Loading your medical records...</Text>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box textAlign="center" py={20}>
        <Text color="red.500" mb={4}>
          Failed to load records. Please try again.
        </Text>
        <Button colorScheme="brand" onClick={() => refetch()}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box maxW="7xl" mx="auto" py={8} px={4}>
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            My Medical Records
          </Heading>
          <Text color="gray.600">View and manage your medical records on the blockchain.</Text>
        </Box>
        <Button as={RouterLink} to="/records/new" leftIcon={<AddIcon />} colorScheme="brand">
          Add Record
        </Button>
      </Flex>

      <Card mb={8}>
        <CardBody>
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search records by description or hash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              pr="4.5rem"
            />
            {searchTerm && (
              <InputRightElement width="4.5rem">
                <IconButton
                  h="1.75rem"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                  icon={<Text>×</Text>}
                  variant="ghost"
                />
              </InputRightElement>
            )}
          </InputGroup>
        </CardBody>
      </Card>

      {filteredRecords.length === 0 ? (
        <Card>
          <CardBody textAlign="center" py={20}>
            <Text fontSize="xl" color="gray.500" mb={4}>
              {searchTerm ? 'No matching records found.' : 'No medical records found.'}
            </Text>
            {!searchTerm && (
              <Button as={RouterLink} to="/records/new" colorScheme="brand" mt={4}>
                Add Your First Record
              </Button>
            )}
          </CardBody>
        </Card>
      ) : (
        <VStack spacing={4} align="stretch">
          {filteredRecords.map((record, index) => (
            <Card key={index} _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }} transition="all 0.2s">
              <CardBody>
                <Flex justify="space-between" align="flex-start">
                  <Box>
                    <HStack spacing={2} mb={2}>
                      <Text fontWeight="semibold" fontSize="lg">
                        {record.metadata || 'Untitled Record'}
                      </Text>
                      <Badge colorScheme="green" variant="subtle">
                        Verified
                      </Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.500" mb={2}>
                      {formatDate(record.timestamp)}
                    </Text>
                    <Text fontSize="xs" fontFamily="mono" color="gray.600" noOfLines={1}>
                      {record.hash}
                    </Text>
                  </Box>
                  <Button
                    as={RouterLink}
                    to={`/records/${record.hash}`}
                    variant="outline"
                    size="sm"
                  >
                    View Details
                  </Button>
                </Flex>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default Records;
