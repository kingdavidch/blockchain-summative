import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, Flex, Button, Text, HStack, useColorModeValue, Link } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { useWeb3 } from '../context/Web3Context';
import { shortenAddress } from '../utils/address';

const Navbar = () => {
  const { account, isConnected, connect, disconnect } = useWeb3();
  const location = useLocation();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'My Records', path: '/records' },
    { name: 'Share Access', path: '/share-access' },
    { name: 'Request Access', path: '/request-access' },
  ];

  return (
    <Box borderBottom="1px" borderColor={borderColor} bg={bg} position="sticky" top={0} zIndex={10}>
      <Flex h={16} alignItems="center" justifyContent="space-between" maxW="7xl" mx="auto" px={4}>
        <HStack spacing={8} alignItems="center">
          <RouterLink to="/">
            <Text fontSize="xl" fontWeight="bold" color="brand.500">
              MediChain
            </Text>
          </RouterLink>
          <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                as={RouterLink}
                to={link.path}
                px={3}
                py={2}
                rounded="md"
                fontWeight="medium"
                color={location.pathname === link.path ? 'brand.500' : 'gray.600'}
                _hover={{
                  textDecoration: 'none',
                  bg: 'gray.50',
                  color: 'brand.500',
                }}
              >
                {link.name}
              </Link>
            ))}
          </HStack>
        </HStack>

        <Flex alignItems="center">
          {isConnected ? (
            <HStack spacing={4}>
              <Button
                as="a"
                href={`https://sepolia.etherscan.io/address/${account}`}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                size="sm"
                rightIcon={<ExternalLinkIcon />}
              >
                {shortenAddress(account || '')}
              </Button>
              <Button colorScheme="brand" size="sm" onClick={disconnect}>
                Disconnect
              </Button>
            </HStack>
          ) : (
            <Button colorScheme="brand" size="sm" onClick={connect}>
              Connect Wallet
            </Button>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;
