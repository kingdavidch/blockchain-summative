// IPFS utility functions for interacting with the IPFS network

// This is a simplified implementation that would be replaced with actual IPFS client code
// in a production environment using something like ipfs-http-client

/**
 * Uploads a file to IPFS
 * @param file The file to upload
 * @returns Promise that resolves to the IPFS hash of the uploaded file
 */
export const uploadToIPFS = async (file: File): Promise<string> => {
  // In a real implementation, this would use an IPFS client to upload the file
  // For example, using ipfs-http-client:
  /*
  const client = create({ url: 'https://ipfs.infura.io:5001/api/v0' });
  const added = await client.add(file);
  return added.path;
  */
  
  // For demo purposes, we'll simulate an upload with a timeout
  // and return a mock IPFS hash
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate a mock IPFS hash (Qm... format)
      const mockHash = 'Qm' + 
        Math.random().toString(36).substring(2, 15) + 
        Math.random().toString(36).substring(2, 15) + 
        Math.random().toString(36).substring(2, 15);
      resolve(mockHash);
    }, 2000);
  });
};

/**
 * Gets the IPFS gateway URL for a given hash
 * @param hash The IPFS hash
 * @returns The gateway URL
 */
export const getIPFSGatewayUrl = (hash: string): string => {
  // Use a public IPFS gateway
  // In production, you might want to use your own gateway or a more reliable one
  return `https://ipfs.io/ipfs/${hash}`;
};

/**
 * Fetches content from IPFS
 * @param hash The IPFS hash of the content to fetch
 * @returns Promise that resolves to the content
 */
export const fetchFromIPFS = async <T = any>(hash: string): Promise<T> => {
  // In a real implementation, this would fetch the content from IPFS
  // For demo purposes, we'll return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return mock data based on the hash
      resolve({
        title: 'Medical Report',
        description: 'Annual checkup results',
        date: new Date().toISOString().split('T')[0],
        type: 'pdf',
        size: '2.5 MB',
        // Add more mock data as needed
      } as unknown as T);
    }, 1000);
  });
};

/**
 * Formats a file size in bytes to a human-readable string
 * @param bytes File size in bytes
 * @param decimals Number of decimal places to show
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Gets the file type from a file name or path
 * @param filename The file name or path
 * @returns The file extension in lowercase
 */
export const getFileType = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
};

/**
 * Gets the appropriate icon for a file type
 * @param fileType The file type/extension
 * @returns An emoji or icon representing the file type
 */
export const getFileIcon = (fileType: string): string => {
  const type = fileType.toLowerCase();
  
  if (['pdf'].includes(type)) return '📄';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(type)) return '🖼️';
  if (['doc', 'docx', 'odt'].includes(type)) return '📝';
  if (['xls', 'xlsx', 'csv'].includes(type)) return '📊';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(type)) return '🗜️';
  
  return '📁'; // Default icon
};
