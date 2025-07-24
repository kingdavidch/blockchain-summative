import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Mock window.ethereum
Object.defineProperty(window, 'ethereum', {
  value: {
    isMetaMask: true,
    request: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
  },
  writable: true,
});

// Mock Web3 provider
vi.mock('@ethersproject/providers', async () => {
  const actual = await vi.importActual('@ethersproject/providers');
  return {
    ...actual,
    Web3Provider: vi.fn().mockImplementation(() => ({
      getSigner: vi.fn().mockReturnValue({
        getAddress: vi.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
      }),
    })),
  };
});

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn().mockReturnValue({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
    }),
  };
});

// Mock IPFS
vi.mock('ipfs-http-client', () => {
  return {
    create: vi.fn().mockResolvedValue({
      add: vi.fn().mockResolvedValue({
        path: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
        cid: { toString: () => 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco' },
      }),
      cat: vi.fn().mockResolvedValue([{ path: 'test.txt', content: new Uint8Array([1, 2, 3]) }]),
    }),
  };
});

// Mock Web3Modal
vi.mock('web3modal', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      connect: vi.fn().mockResolvedValue('mocked-provider'),
      clearCachedProvider: vi.fn(),
    })),
  };
});

// Mock date-fns
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns');
  return {
    ...actual,
    formatDistanceToNow: vi.fn().mockReturnValue('2 days ago'),
    format: vi.fn().mockReturnValue('2023-01-01'),
  };
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock ResizeObserver
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = window.ResizeObserver || ResizeObserverStub;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
    readText: vi.fn(),
  },
});

// Mock scrollTo
window.scrollTo = vi.fn();
