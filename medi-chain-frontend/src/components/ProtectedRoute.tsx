import { Navigate, useLocation } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { Box, Button, Flex, Text, VStack } from '@chakra-ui/react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isConnected, connect } = useWeb3();
  const location = useLocation();

  if (!isConnected) {
    return (
      <Flex minH="70vh" align="center" justify="center">
        <VStack spacing={6} p={8} bg="white" rounded="xl" shadow="md">
          <Text fontSize="xl" fontWeight="semibold">
            Connect Your Wallet to Continue
          </Text>
          <Text color="gray.600" textAlign="center">
            You need to connect your wallet to access this page.
          </Text>
          <Button
            colorScheme="brand"
            size="lg"
            onClick={connect}
            _hover={{
              transform: 'translateY(-1px)',
              boxShadow: 'lg',
            }}
          >
            Connect Wallet
          </Button>
        </VStack>
      </Flex>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
