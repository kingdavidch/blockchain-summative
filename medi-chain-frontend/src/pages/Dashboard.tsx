import { Box, Button, Card, CardBody, CardHeader, Flex, Grid, Heading, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useWeb3 } from '../context/Web3Context';

const Dashboard = () => {
  const { contract, account } = useWeb3();

  // Fetch records count
  const { data: recordsCount = 0 } = useQuery({
    queryKey: ['recordsCount', account],
    queryFn: async () => {
      if (!contract || !account) return 0;
      try {
        const hashes = await contract.getRecordHashes(account);
        return hashes.length;
      } catch (error) {
        console.error('Error fetching records count:', error);
        return 0;
      }
    },
    enabled: !!contract && !!account,
  });

  // Fetch access grants count
  const { data: accessGrantsCount = 0 } = useQuery({
    queryKey: ['accessGrantsCount', account],
    queryFn: async () => {
      if (!contract || !account) return 0;
      try {
        // This is a simplified example - you might need to adjust based on your contract
        // Here we're assuming there's a way to get the count of doctors with access
        // You might need to implement this function in your contract
        return 0; // Placeholder
      } catch (error) {
        console.error('Error fetching access grants count:', error);
        return 0;
      }
    },
    enabled: !!contract && !!account,
  });

  return (
    <Box maxW="7xl" mx="auto" py={8} px={4}>
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            Dashboard
          </Heading>
          <Text color="gray.600">Welcome back! Here's an overview of your medical records.</Text>
        </Box>
        <Button as={RouterLink} to="/records/new" colorScheme="brand">
          Add New Record
        </Button>
      </Flex>

      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6} mb={8}>
        <Card>
          <CardHeader>
            <Text color="gray.500" fontSize="sm" fontWeight="medium">
              Total Records
            </Text>
          </CardHeader>
          <CardBody>
            <Flex align="center" justify="space-between">
              <Text fontSize="3xl" fontWeight="bold">
                {recordsCount}
              </Text>
              <Box p={2} bg="blue.50" rounded="md">
                <Text fontSize="xl">📄</Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Text color="gray.500" fontSize="sm" fontWeight="medium">
              Access Granted
            </Text>
          </CardHeader>
          <CardBody>
            <Flex align="center" justify="space-between">
              <Text fontSize="3xl" fontWeight="bold">
                {accessGrantsCount}
              </Text>
              <Box p={2} bg="green.50" rounded="md">
                <Text fontSize="xl">👥</Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Text color="gray.500" fontSize="sm" fontWeight="medium">
              Pending Requests
            </Text>
          </CardHeader>
          <CardBody>
            <Flex align="center" justify="space-between">
              <Text fontSize="3xl" fontWeight="bold">
                0
              </Text>
              <Box p={2} bg="yellow.50" rounded="md">
                <Text fontSize="xl">🔔</Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>
      </Grid>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
        <Card>
          <CardHeader>
            <Heading size="md">Recent Records</Heading>
          </CardHeader>
          <CardBody>
            {recordsCount > 0 ? (
              <VStack gap={4} align="stretch">
                {[...Array(Math.min(3, recordsCount))].map((_, i) => (
                  <Box
                    key={i}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    _hover={{ bg: 'gray.50' }}
                  >
                    <Text fontWeight="medium">Record #{i + 1}</Text>
                    <Text fontSize="sm" color="gray.500">
                      Last updated: MM/DD/YYYY
                    </Text>
                  </Box>
                ))}
              </VStack>
            ) : (
              <VStack gap={4} py={8}>
                <Text color="gray.500" textAlign="center">
                  You don't have any medical records yet.
                </Text>
                <Button as={RouterLink} to="/records/new" colorScheme="brand" variant="outline">
                  Add Your First Record
                </Button>
              </VStack>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Quick Actions</Heading>
          </CardHeader>
          <CardBody>
            <VStack gap={4} align="stretch">
              <Button
                as={RouterLink}
                to="/records/new"
                leftIcon={<span>📝</span>}
                variant="outline"
                justifyContent="flex-start"
                py={6}
              >
                Add New Record
              </Button>
              <Button
                as={RouterLink}
                to="/share-access"
                leftIcon={<span>🔗</span>}
                variant="outline"
                justifyContent="flex-start"
                py={6}
              >
                Share Access
              </Button>
              <Button
                as={RouterLink}
                to="/request-access"
                leftIcon={<span>👨‍⚕️</span>}
                variant="outline"
                justifyContent="flex-start"
                py={6}
              >
                Request Access
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Grid>
    </Box>
  );
};

export default Dashboard;
