import { render, screen, waitFor, within } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import Dashboard from '../Dashboard';
import theme from '../../theme';

// Mock the useMedicalRecords hook
vi.mock('../../hooks/useMedicalRecords', () => ({
  __esModule: true,
  default: () => ({
    records: [
      {
        id: '1',
        title: 'Test Record',
        description: 'Test Description',
        date: '2023-01-01',
        fileHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
        fileType: 'application/pdf',
        fileName: 'test.pdf',
        fileSize: 1024,
      },
    ],
    accessGrants: [
      {
        id: '1',
        recordId: '1',
        doctorAddress: '0x1234567890123456789012345678901234567890',
        grantedAt: '2023-01-01',
        expiresAt: '2024-01-01',
      },
    ],
    accessRequests: [
      {
        id: '1',
        recordId: '1',
        doctorAddress: '0x1234567890123456789012345678901234567890',
        requestedAt: '2023-01-01',
        status: 'pending',
      },
    ],
    isLoading: false,
    error: null,
  }),
}));

describe('Dashboard', () => {
  const renderDashboard = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    return render(
      <ChakraProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <Router>
            <Dashboard />
          </Router>
        </QueryClientProvider>
      </ChakraProvider>
    );
  };

  it('renders the dashboard with statistics', async () => {
    renderDashboard();

    // Check for the dashboard title
    expect(screen.getByText('Dashboard')).toBeInTheDocument();

    // Check for the statistics cards
    expect(screen.getByText('Total Records')).toBeInTheDocument();
    expect(screen.getByText('Access Granted')).toBeInTheDocument();
    expect(screen.getByText('Pending Requests')).toBeInTheDocument();

    // Check if the records are displayed
    await waitFor(() => {
      expect(screen.getByText('Recent Records')).toBeInTheDocument();
      expect(screen.getByText('Test Record')).toBeInTheDocument();
    });
  });

  it('displays the correct number of records and access grants', async () => {
    renderDashboard();

    // Check the statistics
    const recordCount = screen.getByTestId('total-records');
    const accessCount = screen.getByTestId('access-granted');
    const requestCount = screen.getByTestId('pending-requests');

    expect(within(recordCount).getByText('1')).toBeInTheDocument();
    expect(within(accessCount).getByText('1')).toBeInTheDocument();
    expect(within(requestCount).getByText('1')).toBeInTheDocument();
  });

  it('displays loading state when data is being fetched', () => {
    // Mock the hook to return loading state
    vi.mocked(require('../../hooks/useMedicalRecords').default).mockImplementationOnce(() => ({
      records: [],
      accessGrants: [],
      accessRequests: [],
      isLoading: true,
      error: null,
    }));

    renderDashboard();

    // Check for loading state
    const loadingElements = screen.getAllByRole('progressbar');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('displays error state when there is an error', () => {
    // Mock the hook to return an error
    vi.mocked(require('../../hooks/useMedicalRecords').default).mockImplementationOnce(() => ({
      records: [],
      accessGrants: [],
      accessRequests: [],
      isLoading: false,
      error: new Error('Failed to fetch data'),
    }));

    renderDashboard();

    // Check for error message
    expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
  });
});
