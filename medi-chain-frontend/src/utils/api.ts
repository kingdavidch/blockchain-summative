import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from './toast';

// Create an axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    // Get the auth token from localStorage or wherever it's stored
    const token = localStorage.getItem('authToken');
    
    // If token exists, add it to the headers
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Handle successful responses
    return response.data;
  },
  (error: AxiosError) => {
    // Handle errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      
      // Handle specific status codes
      switch (status) {
        case 401:
          // Handle unauthorized access (e.g., redirect to login)
          toast.error('Session expired', 'Please log in again');
          // Clear auth data and redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          break;
          
        case 403:
          // Handle forbidden access
          toast.error('Access denied', 'You do not have permission to perform this action');
          break;
          
        case 404:
          // Handle not found
          toast.error('Not found', 'The requested resource was not found');
          break;
          
        case 422:
          // Handle validation errors
          // The response should contain error details in the data object
          return Promise.reject({
            status,
            message: 'Validation failed',
            errors: data?.errors || {},
          });
          
        case 429:
          // Handle rate limiting
          toast.error('Too many requests', 'Please try again later');
          break;
          
        case 500:
          // Handle server errors
          toast.error('Server error', 'An unexpected error occurred. Please try again later.');
          break;
          
        default:
          // Handle other errors
          toast.error('Error', data?.message || 'An error occurred');
      }
    } else if (error.request) {
      // The request was made but no response was received
      toast.error('Network error', 'Unable to connect to the server. Please check your connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request error:', error.message);
      toast.error('Error', 'An error occurred while processing your request');
    }
    
    return Promise.reject(error);
  }
);

/**
 * Generic GET request
 */
export const get = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  return api.get<T>(url, config);
};

/**
 * Generic POST request
 */
export const post = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return api.post<T>(url, data, config);
};

/**
 * Generic PUT request
 */
export const put = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return api.put<T>(url, data, config);
};

/**
 * Generic PATCH request
 */
export const patch = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return api.patch<T>(url, data, config);
};

/**
 * Generic DELETE request
 */
export const del = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  return api.delete<T>(url, config);
};

/**
 * Upload a file with progress tracking
 */
export const uploadFile = async <T = any>(
  url: string,
  file: File,
  onUploadProgress?: (progressEvent: ProgressEvent) => void,
  additionalData: Record<string, any> = {},
  config?: AxiosRequestConfig
): Promise<T> => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Append additional data to the form data
  Object.entries(additionalData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  
  return post<T>(url, formData, {
    ...config,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...config?.headers,
    },
    onUploadProgress,
  });
};

/**
 * Download a file
 */
export const downloadFile = async (
  url: string,
  filename: string,
  config?: AxiosRequestConfig
): Promise<void> => {
  const response = await api.get<Blob>(url, {
    ...config,
    responseType: 'blob',
  });
  
  // Create a download link and trigger the download
  const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  
  // Clean up
  window.URL.revokeObjectURL(downloadUrl);
};

// Export the axios instance in case it's needed directly
export { api as default };
