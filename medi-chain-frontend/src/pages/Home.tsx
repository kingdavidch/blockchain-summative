import { Box, Button, Container, Flex, Heading, Stack, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';

const Home = () => {
  const { isConnected } = useWeb3();

  return (
    <Container maxW="7xl" py={16}>
      <Stack direction={{ base: 'column', lg: 'row' }} spacing={16} align="center">
        <Box flex={1}>
          <Heading as="h1" size="3xl" mb={6} fontWeight="extrabold" lineHeight="1.2">
            Take Control of Your
            <Box as="span" color="brand.500" display="block">
              Medical Records
            </Box>
          </Heading>
          <Text fontSize="xl" color="gray.600" mb={8}>
            Securely store, manage, and share your medical records on the blockchain. 
            Take control of your health data with complete privacy and security.
          </Text>
          <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
            {isConnected ? (
              <Button
                as={RouterLink}
                to="/dashboard"
                colorScheme="brand"
                size="lg"
                px={8}
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg',
                }}
              >
                Go to Dashboard
              </Button>
            ) : (
              <Button
                as={RouterLink}
                to="/dashboard"
                colorScheme="brand"
                size="lg"
                px={8}
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg',
                }}
              >
                Get Started
              </Button>
            )}
            <Button
              as="a"
              href="#features"
              variant="outline"
              size="lg"
              px={8}
              _hover={{
                bg: 'gray.50',
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
            >
              Learn More
            </Button>
          </Stack>
        </Box>
        <Box flex={1} display={{ base: 'none', lg: 'block' }}>
          <Box
            bg="brand.50"
            p={8}
            rounded="2xl"
            borderWidth="1px"
            borderColor="brand.100"
            boxShadow="lg"
          >
            <Box
              bg="white"
              p={6}
              rounded="xl"
              boxShadow="md"
              borderWidth="1px"
              borderColor="gray.100"
            >
              <VStack spacing={6} align="stretch">
                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>
                    Patient Record
                  </Text>
                  <Text fontSize="lg" fontWeight="medium">
                    Annual Physical Exam - 2023
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>
                    Doctor
                  </Text>
                  <Text>Dr. Sarah Johnson, MD</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>
                    Date
                  </Text>
                  <Text>March 15, 2023</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>
                    Status
                  </Text>
                  <Box display="inline-flex" alignItems="center">
                    <Box
                      w={2}
                      h={2}
                      bg="green.500"
                      rounded="full"
                      mr={2}
                    />
                    <Text>Verified on Blockchain</Text>
                  </Box>
                </Box>
              </VStack>
            </Box>
          </Box>
        </Box>
      </Stack>

      <Box id="features" mt={32}>
        <Heading textAlign="center" mb={12}>
          Why Choose MediChain?
        </Heading>
        <Stack direction={{ base: 'column', md: 'row' }} spacing={8}>
          {[
            {
              title: 'Secure & Private',
              description:
                'Your medical records are encrypted and stored securely on the blockchain. Only you control who can access your data.',
              icon: '🔒',
            },
            {
              title: 'Easy Sharing',
              description:
                'Share your medical records with healthcare providers instantly, without the need for paper or fax.',
              icon: '📤',
            },
            {
              title: 'Always Available',
              description:
                'Access your complete medical history anytime, anywhere, from any device with an internet connection.',
              icon: '🌐',
            },
          ].map((feature, index) => (
            <Box
              key={index}
              flex={1}
              p={6}
              bg="white"
              rounded="xl"
              borderWidth="1px"
              borderColor="gray.100"
              _hover={{
                transform: 'translateY(-4px)',
                boxShadow: 'lg',
              }}
              transition="all 0.2s"
            >
              <Text fontSize="3xl" mb={4}>
                {feature.icon}
              </Text>
              <Heading as="h3" size="md" mb={2}>
                {feature.title}
              </Heading>
              <Text color="gray.600">{feature.description}</Text>
            </Box>
          ))}
        </Stack>
      </Box>
    </Container>
  );
};

export default Home;
