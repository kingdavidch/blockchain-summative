/**
 * Utility functions for handling files in the browser
 */

/**
 * Converts a file to a base64 string
 * @param file The file to convert
 * @returns A promise that resolves to the base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Converts a base64 string to a Blob
 * @param base64 The base64 string
 * @param mimeType The MIME type of the file
 * @returns A Blob object
 */
export const base64ToBlob = (base64: string, mimeType: string): Blob => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteArrays = [];
  
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  
  return new Blob(byteArrays, { type: mimeType });
};

/**
 * Downloads a file to the user's computer
 * @param data The file data as a string, Blob, or Uint8Array
 * @param filename The name of the file
 * @param mimeType The MIME type of the file
 */
export const downloadFile = (
  data: string | Blob | Uint8Array,
  filename: string,
  mimeType: string
): void => {
  let blob: Blob;
  
  if (typeof data === 'string') {
    // Handle base64 string
    if (data.startsWith('data:')) {
      // If it's already a data URL, create a Blob from it
      const parts = data.split(',');
      const byteString = atob(parts[1]);
      const mimeType = parts[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      
      blob = new Blob([ab], { type: mimeType });
    } else {
      // Regular string
      blob = new Blob([data], { type: mimeType });
    }
  } else if (data instanceof Uint8Array) {
    blob = new Blob([data], { type: mimeType });
  } else {
    blob = data;
  }
  
  // Create a download link
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  
  // Trigger download
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

/**
 * Gets the file extension from a filename
 * @param filename The filename
 * @returns The file extension (without the dot) or an empty string if none
 */
export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
};

/**
 * Gets the MIME type from a filename
 * @param filename The filename
 * @returns The MIME type or 'application/octet-stream' if unknown
 */
export const getMimeType = (filename: string): string => {
  const extension = getFileExtension(filename).toLowerCase();
  
  const mimeTypes: { [key: string]: string } = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    
    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    
    // Text
    txt: 'text/plain',
    csv: 'text/csv',
    json: 'application/json',
    xml: 'application/xml',
    
    // Archives
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    tar: 'application/x-tar',
    gz: 'application/gzip',
  };
  
  return mimeTypes[extension] || 'application/octet-stream';
};

/**
 * Validates a file against size and type constraints
 * @param file The file to validate
 * @param options Validation options
 * @returns An error message if validation fails, or null if valid
 */
export const validateFile = (
  file: File,
  options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  } = {}
): string | null => {
  const { maxSizeMB = 10, allowedTypes } = options;
  
  // Check file size
  if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
    return `File is too large. Maximum size is ${maxSizeMB}MB.`;
  }
  
  // Check file type
  if (allowedTypes && allowedTypes.length > 0) {
    const fileType = file.type || getMimeType(file.name);
    const isAllowed = allowedTypes.some(type => {
      // Handle wildcard types like 'image/*'
      if (type.endsWith('/*')) {
        return fileType.startsWith(type.replace('/*', '/'));
      }
      return fileType === type;
    });
    
    if (!isAllowed) {
      return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
    }
  }
  
  return null; // File is valid
};

/**
 * Creates a file object from a URL
 * @param url The URL of the file
 * @param filename The name to give the file
 * @returns A promise that resolves to a File object
 */
export const fileFromUrl = async (url: string, filename: string): Promise<File> => {
  const response = await fetch(url);
  const data = await response.blob();
  return new File([data], filename, { type: data.type });
};

/**
 * Converts a file to an ArrayBuffer
 * @param file The file to convert
 * @returns A promise that resolves to an ArrayBuffer
 */
export const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Creates a human-readable file size string
 * @param bytes The file size in bytes
 * @param decimals The number of decimal places to show
 * @returns A formatted file size string (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
