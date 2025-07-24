import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ error, errorInfo });
    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box p={8} maxW="container.md" mx="auto">
          <VStack spacing={6} textAlign="center">
            <Heading size="xl" color="red.500">
              Something went wrong
            </Heading>
            
            {process.env.NODE_ENV === 'development' && (
              <Box textAlign="left" p={4} bg="gray.100" borderRadius="md" w="full">
                <Text fontWeight="bold" mb={2}>
                  {this.state.error?.toString()}
                </Text>
                <Text as="pre" fontSize="sm" overflowX="auto">
                  {this.state.errorInfo?.componentStack}
                </Text>
              </Box>
            )}

            <Button
              as={RouterLink}
              to="/"
              colorScheme="blue"
              mt={4}
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
              }}
            >
              Go to Home
            </Button>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
