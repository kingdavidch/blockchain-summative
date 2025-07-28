import { useState } from 'react';

interface ToastOptions {
  title: string;
  description?: string;
  status: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  const toast = (options: ToastOptions) => {
    console.log(`Toast: ${options.status.toUpperCase()} - ${options.title}`, options.description);
    
    // For now, just log to console. In a real app, you'd show a toast notification
    setToasts(prev => [...prev, options]);
    
    // Auto-remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t !== options));
    }, options.duration || 3000);
  };

  return toast;
};