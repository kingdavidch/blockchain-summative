import { UseToastOptions } from '@chakra-ui/react';

type ToastFunction = (options: UseToastOptions) => void;

let toastFunction: ToastFunction | null = null;

export const initToast = (toastFn: ToastFunction) => {
  toastFunction = toastFn;
};

export const toast = (options: UseToastOptions) => {
  if (!toastFunction) {
    console.warn('Toast function not initialized. Call initToast first.');
    return;
  }
  
  // Default options
  const defaultOptions: UseToastOptions = {
    position: 'top-right',
    duration: 5000,
    isClosable: true,
    variant: 'subtle',
  };
  
  toastFunction({
    ...defaultOptions,
    ...options,
  });
};

// Convenience methods
toast.success = (title: string, description?: string) => {
  toast({
    title,
    description,
    status: 'success',
  });
};

toast.error = (title: string, description?: string) => {
  toast({
    title,
    description,
    status: 'error',
  });
};

toast.info = (title: string, description?: string) => {
  toast({
    title,
    description,
    status: 'info',
  });
};

toast.warning = (title: string, description?: string) => {
  toast({
    title,
    description,
    status: 'warning',
  });
};
