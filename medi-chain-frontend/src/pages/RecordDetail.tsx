import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useWeb3 } from '../context/Web3Context';
import { Box, Button, Card, CardBody, CardHeader, Divider, Flex, Heading, IconButton, Spinner, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useToast, VStack, HStack, Badge, useClipboard } from '@chakra-ui/react';
import { ArrowBackIcon, CopyIcon, DownloadIcon, EditIcon, ExternalLinkIcon, TimeIcon, ViewIcon } from '@chakra-ui/icons';
import { format } from 'date-fns';

interface MedicalRecord {
  hash: string;
  metadata: string;
  timestamp: number;
  // Add more fields as needed
}

const RecordDetail = () => {
  const { hash } = useParams<{ hash: string }>();
  const { contract, account } = useWeb3();
  const navigate = useNavigate();
  const toast = useToast();
  const { onCopy } = useClipboard(hash || '');

  // Fetch record details
  const { data: record, isLoading, isError } = useQuery<MedicalRecord>({
    queryKey: ['record', hash],
    queryFn: async () => {
      if (!contract || !account || !hash) throw new Error('Missing required data');
      
      try {
        // Fetch record metadata from the blockchain
        const metadata = await contract.getRecordMetadata(account, hash);
        
        // In a real app, you would fetch the actual record data from IPFS here
        // For now, we'll use mock data
        return {
          hash,
          metadata,
          timestamp: Math.floor(Date.now() / 1000), // Current timestamp as fallback
          // Add more fields as needed
        };
      } catch (error) {
        console.error('Error fetching record:', error);
        throw new Error('Failed to load record details');
      }
    },
    enabled: !!contract && !!account && !!hash,
  });

  // Handle copy to clipboard
  const handleCopy = () => {
    onCopy();
    toast({
      title: 'Copied!',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  // Handle download record (placeholder)
  const handleDownload = () => {
    // In a real app, this would download the record file from IPFS
    toast({
      title: 'Download',
      description: 'This would download the record file in a real application.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  // Handle view on IPFS (placeholder)
  const handleViewOnIPFS = () => {
    // In a real app, this would open the IPFS gateway URL
    toast({
      title: 'View on IPFS',
      description: 'This would open the IPFS gateway in a real application.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={20}>
        <Spinner size="xl" />
        <Text mt={4}>Loading record details...</Text>
      </Box>
    );
  }

  if (isError || !record) {
    return (
      <Box textAlign="center" py={20}>
        <Text color="red.500" mb={4}>
          Failed to load record details. The record may not exist or you may not have permission to view it.
        </Text>
        <Button as={RouterLink} to="/records" colorScheme="brand" mt={4}>
          Back to Records
        </Button>
      </Box>
    );
  }

  return (
    <Box maxW="7xl" mx="auto" py={8} px={4}>
      <Button
        leftIcon={<ArrowBackIcon />}
        variant="ghost"
        mb={6}
        onClick={() => navigate(-1)}
      >
        Back to Records
      </Button>

      <Flex justify="space-between" align="flex-start" mb={8}>
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            {record.metadata || 'Untitled Record'}
          </Heading>
          <HStack spacing={4} color="gray.500">
            <HStack>
              <TimeIcon />
              <Text>
                {format(new Date(record.timestamp * 1000), 'MMM d, yyyy h:mm a')}
              </Text>
            </HStack>
            <HStack>
              <Badge colorScheme="green" variant="subtle">
                Verified
              </Badge>
            </HStack>
          </HStack>
        </Box>
        <HStack spacing={2}>
          <Button
            leftIcon={<DownloadIcon />}
            variant="outline"
            onClick={handleDownload}
          >
            Download
          </Button>
          <Button
            leftIcon={<ExternalLinkIcon />}
            variant="outline"
            onClick={handleViewOnIPFS}
          >
            View on IPFS
          </Button>
          <Button leftIcon={<EditIcon />} colorScheme="brand">
            Edit
          </Button>
        </HStack>
      </Flex>

      <Tabs variant="enclosed">
        <TabList>
          <Tab>Overview</Tab>
          <Tab>Access History</Tab>
          <Tab>Raw Data</Tab>
        </TabList>

        <TabPanels mt={4}>
          <TabPanel p={0}>
            <Card>
              <CardBody>
                <VStack align="stretch" spacing={6}>
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      Record ID
                    </Text>
                    <HStack>
                      <Text fontFamily="mono" fontSize="sm">
                        {record.hash}
                      </Text>
                      <IconButton
                        aria-label="Copy record ID"
                        icon={<CopyIcon />}
                        size="xs"
                        variant="ghost"
                        onClick={handleCopy}
                      />
                    </HStack>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      Description
                    </Text>
                    <Text>{record.metadata || 'No description available.'}</Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      Created
                    </Text>
                    <Text>
                      {format(new Date(record.timestamp * 1000), 'MMMM d, yyyy')}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      Last Updated
                    </Text>
                    <Text>
                      {format(new Date(record.timestamp * 1000), 'MMMM d, yyyy')}
                    </Text>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel p={0}>
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Box p={4} borderWidth={1} borderRadius="md">
                    <HStack justify="space-between">
                      <Box>
                        <Text fontWeight="medium">Dr. Sarah Johnson</Text>
                        <Text fontSize="sm" color="gray.500">
                          Viewed on {format(new Date(), 'MMM d, yyyy')}
                        </Text>
                      </Box>
                      <Badge colorScheme="green">Active</Badge>
                    </HStack>
                  </Box>
                  <Text color="gray.500" textAlign="center" py={4}>
                    No other access events found.
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel p={0}>
            <Card>
              <CardHeader>
                <Heading size="md">Raw Record Data</Heading>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  This is the raw data stored on the blockchain for this record.
                </Text>
              </CardHeader>
              <CardBody>
                <Box
                  as="pre"
                  p={4}
                  bg="gray.50"
                  borderRadius="md"
                  overflowX="auto"
                  fontFamily="mono"
                  fontSize="sm"
                >
                  {JSON.stringify(record, null, 2)}
                </Box>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default RecordDetail;
