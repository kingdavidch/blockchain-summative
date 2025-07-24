import { Box, ChakraProvider, Flex } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Web3Provider } from './context/Web3Context';
import theme from './theme';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Records from './pages/Records';
import ShareAccess from './pages/ShareAccess';
import RequestAccess from './pages/RequestAccess';
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <Web3Provider>
          <Router>
            <Flex direction="column" minH="100vh">
              <Navbar />
              <Box flex="1" p={4} bg="gray.50">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/records"
                    element={
                      <ProtectedRoute>
                        <Records />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/share-access"
                    element={
                      <ProtectedRoute>
                        <ShareAccess />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/request-access"
                    element={
                      <ProtectedRoute>
                        <RequestAccess />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Box>
            </Flex>
          </Router>
        </Web3Provider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default App;
