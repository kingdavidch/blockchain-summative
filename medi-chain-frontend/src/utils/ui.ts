import { useEffect, useRef, useState } from 'react';
import { useToast as useChakraToast, UseToastOptions } from '@chakra-ui/react';
import { toast as toastUtil } from './toast';

/**
 * Custom hook for debouncing values
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook for tracking previous value
 * @param value The value to track
 * @returns The previous value
 */
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

/**
 * Custom hook for detecting clicks outside an element
 * @param callback The callback to call when a click outside is detected
 * @returns A ref to attach to the element
 */
export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  callback: () => void
): React.RefObject<T> => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback]);

  return ref;
};

/**
 * Custom hook for handling keyboard shortcuts
 * @param key The key to listen for
 * @param callback The callback to call when the key is pressed
 * @param options Additional options
 */
export const useKeyPress = (
  key: string,
  callback: (event: KeyboardEvent) => void,
  options: {
    target?: HTMLElement | Window | Document;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
    preventDefault?: boolean;
    stopPropagation?: boolean;
  } = {}
): void => {
  const {
    target = window,
    ctrlKey = false,
    shiftKey = false,
    altKey = false,
    metaKey = false,
    preventDefault = true,
    stopPropagation = false,
  } = options;

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        event.key === key &&
        event.ctrlKey === ctrlKey &&
        event.shiftKey === shiftKey &&
        event.altKey === altKey &&
        event.metaKey === metaKey
      ) {
        if (preventDefault) {
          event.preventDefault();
        }
        
        if (stopPropagation) {
          event.stopPropagation();
        }
        
        callback(event);
      }
    };

    target.addEventListener('keydown', handler);
    return () => {
      target.removeEventListener('keydown', handler);
    };
  }, [key, callback, target, ctrlKey, shiftKey, altKey, metaKey, preventDefault, stopPropagation]);
};

/**
 * Custom hook for handling infinite scroll
 * @param callback The callback to call when the user scrolls to the bottom
 * @param options Additional options
 */
export const useInfiniteScroll = (
  callback: () => void,
  options: {
    enabled?: boolean;
    threshold?: number;
    target?: HTMLElement | Window | null;
  } = {}
): void => {
  const { enabled = true, threshold = 100, target = window } = options;
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !target) return;

    const handleScroll = () => {
      if (isLoading) return;

      const element = target === window ? document.documentElement : (target as HTMLElement);
      const scrollTop = 'scrollTop' in element ? element.scrollTop : 0;
      const scrollHeight = 'scrollHeight' in element ? element.scrollHeight : 0;
      const clientHeight = 'clientHeight' in element ? element.clientHeight : 0;
      
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - threshold;

      if (isAtBottom) {
        setIsLoading(true);
        Promise.resolve()
          .then(callback)
          .finally(() => {
            setIsLoading(false);
          });
      }
    };

    target.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      target.removeEventListener('scroll', handleScroll);
    };
  }, [callback, enabled, isLoading, target, threshold]);
};

/**
 * Custom hook for handling responsive design
 * @param breakpoints Breakpoint values in pixels
 * @returns The current breakpoint
 */
export const useBreakpoint = (
  breakpoints: Record<string, number> = {
    base: 0,
    sm: 480,
    md: 768,
    lg: 992,
    xl: 1280,
    '2xl': 1536,
  }
): string => {
  const [breakpoint, setBreakpoint] = useState('base');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let currentBreakpoint = 'base';
      
      // Find the largest breakpoint that's smaller than or equal to the current width
      for (const [key, value] of Object.entries(breakpoints)) {
        if (width >= value) {
          currentBreakpoint = key;
        } else {
          break;
        }
      }
      
      setBreakpoint(currentBreakpoint);
    };

    // Initial call
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoints]);

  return breakpoint;
};

/**
 * Custom hook for handling copy to clipboard
 * @param text The text to copy
 * @param options Additional options
 * @returns An object with copy function and success state
 */
export const useCopyToClipboard = (
  text: string,
  options: {
    successMessage?: string;
    errorMessage?: string;
    timeout?: number;
  } = {}
): { copy: () => Promise<boolean>; isCopied: boolean } => {
  const [isCopied, setIsCopied] = useState(false);
  const {
    successMessage = 'Copied to clipboard',
    errorMessage = 'Failed to copy to clipboard',
    timeout = 2000,
  } = options;

  const copy = async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      
      if (successMessage) {
        toastUtil.success(successMessage);
      }
      
      // Reset the copied state after the timeout
      setTimeout(() => {
        setIsCopied(false);
      }, timeout);
      
      return true;
    } catch (error) {
      console.error('Failed to copy text:', error);
      
      if (errorMessage) {
        toastUtil.error(errorMessage);
      }
      
      return false;
    }
  };

  return { copy, isCopied };
};

/**
 * Custom hook for handling toasts with Chakra UI
 * @param options Default toast options
 * @returns Toast functions
 */
export const useToast = (options: UseToastOptions = {}) => {
  const toast = useChakraToast();
  
  const showToast = (options: UseToastOptions) => {
    toast({
      position: 'top-right',
      duration: 5000,
      isClosable: true,
      ...options,
    });
  };
  
  return {
    toast: showToast,
    success: (title: string, description?: string) =>
      showToast({ ...options, title, description, status: 'success' }),
    error: (title: string, description?: string) =>
      showToast({ ...options, title, description, status: 'error' }),
    warning: (title: string, description?: string) =>
      showToast({ ...options, title, description, status: 'warning' }),
    info: (title: string, description?: string) =>
      showToast({ ...options, title, description, status: 'info' }),
    close: toast.close,
    closeAll: toast.closeAll,
  };
};
