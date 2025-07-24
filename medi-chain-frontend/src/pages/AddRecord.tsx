import { useState, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWeb3 } from '../context/Web3Context';
import { Box, Button, Card, CardBody, CardHeader, Divider, Flex, FormControl, FormLabel, Heading, Input, Text, Textarea, useToast, VStack, HStack, IconButton, Progress } from '@chakra-ui/react';
import { ArrowBackIcon, AttachmentIcon, DeleteIcon } from '@chakra-ui/icons';

interface FormData {
  title: string;
  description: string;
  date: string;
  file: File | null;
  fileName: string;
}

const AddRecord = () => {
  const navigate = useNavigate();
  const { contract, account } = useWeb3();
  const queryClient = useQueryClient();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    file: null,
    fileName: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        file,
        fileName: file.name,
        title: prev.title || file.name.split('.')[0] // Use filename as title if title is empty
      }));
    }
  };

  const removeFile = () => {
    setFormData(prev => ({
      ...prev,
      file: null,
      fileName: ''
    }));
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Simulate file upload to IPFS
  const uploadToIPFS = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          clearInterval(interval);
          resolve('QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco'); // Mock IPFS hash
        } else {
          setUploadProgress(progress);
        }
      }, 300);
    });
  };

  // Add record mutation
  const addRecordMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!contract || !account) throw new Error('Wallet not connected');
      if (!data.file) throw new Error('No file selected');
      
      setIsUploading(true);
      setUploadProgress(0);
      
      try {
        // 1. Upload file to IPFS
        const ipfsHash = await uploadToIPFS(data.file);
        
        // 2. Prepare metadata
        const metadata = {
          title: data.title,
          description: data.description,
          date: data.date,
          fileName: data.fileName,
          fileType: data.file?.type || '',
          fileSize: data.file?.size || 0,
        };
        
        // 3. Store metadata on-chain
        const tx = await contract.addRecord(ipfsHash, JSON.stringify(metadata));
        await tx.wait();
        
        return { txHash: tx.hash, ipfsHash };
      } catch (error) {
        console.error('Error adding record:', error);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: (data) => {
      toast({
        title: 'Record Added',
        description: 'Your medical record has been securely stored on the blockchain.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Invalidate records query to refetch
      queryClient.invalidateQueries({ queryKey: ['records', account] });
      
      // Navigate to records list
      navigate('/records');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add record',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    addRecordMutation.mutate(formData);
  };

  return (
    <Box maxW="3xl" mx="auto" py={8} px={4}>
      <Button
        leftIcon={<ArrowBackIcon />}
        variant="ghost"
        mb={6}
        onClick={() => navigate(-1)}
      >
        Back
      </Button>

      <Card mb={8}>
        <CardHeader>
          <Heading size="lg">Add New Medical Record</Heading>
          <Text color="gray.500" mt={1}>
            Upload and securely store your medical records on the blockchain.
          </Text>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel>Record Title</FormLabel>
                <Input
                  name="title"
                  placeholder="e.g., Annual Checkup 2023"
                  value={formData.title}
                  onChange={handleInputChange}
                  isDisabled={isUploading}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  placeholder="Add any relevant details about this record..."
                  value={formData.description}
                  onChange={handleInputChange}
                  isDisabled={isUploading}
                  rows={4}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Date</FormLabel>
                <Input
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  isDisabled={isUploading}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Medical Record File</FormLabel>
                {!formData.file ? (
                  <Box
                    border="2px dashed"
                    borderColor="gray.300"
                    borderRadius="md"
                    p={8}
                    textAlign="center"
                    bg="gray.50"
                    _hover={{ bg: 'gray.100', cursor: 'pointer' }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      disabled={isUploading}
                    />
                    <AttachmentIcon boxSize={8} color="gray.400" mb={3} />
                    <Text fontWeight="medium">Click to upload or drag and drop</Text>
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      PDF, JPG, PNG, DOCX (Max 10MB)
                    </Text>
                  </Box>
                ) : (
                  <Box
                    borderWidth="1px"
                    borderRadius="md"
                    p={4}
                    borderColor="gray.200"
                    bg="white"
                  >
                    <Flex justify="space-between" align="center">
                      <HStack>
                        <AttachmentIcon boxSize={5} color="gray.400" />
                        <Box>
                          <Text fontWeight="medium">{formData.fileName}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {(formData.file?.size || 0) > 1024 * 1024
                              ? `${(formData.file!.size / (1024 * 1024)).toFixed(2)} MB`
                              : `${Math.ceil((formData.file?.size || 0) / 1024)} KB`}
                          </Text>
                        </Box>
                      </HStack>
                      <IconButton
                        icon={<DeleteIcon />}
                        aria-label="Remove file"
                        variant="ghost"
                        colorScheme="red"
                        size="sm"
                        onClick={removeFile}
                        isDisabled={isUploading}
                      />
                    </Flex>
                  </Box>
                )}
              </FormControl>

              {isUploading && (
                <Box>
                  <Text mb={2} color="gray.600">
                    Uploading to IPFS...
                  </Text>
                  <Progress value={uploadProgress} size="sm" colorScheme="brand" borderRadius="full" />
                  <Text mt={1} fontSize="sm" textAlign="right" color="gray.500">
                    {Math.round(uploadProgress)}%
                  </Text>
                </Box>
              )}

              <Divider my={2} />

              <Flex justify="flex-end" mt={4}>
                <Button
                  variant="outline"
                  mr={3}
                  onClick={() => navigate('/records')}
                  isDisabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  colorScheme="brand"
                  isLoading={addRecordMutation.isPending || isUploading}
                  loadingText={isUploading ? 'Uploading...' : 'Saving...'}
                  isDisabled={!formData.file || !formData.title}
                >
                  Save Record
                </Button>
              </Flex>
            </VStack>
          </form>
        </CardBody>
      </Card>

      <Box bg="blue.50" p={4} borderRadius="md" borderLeft="4px" borderColor="blue.500">
        <Text fontWeight="medium" color="blue.800">Your data is secure</Text>
        <Text fontSize="sm" color="blue.700" mt={1}>
          Your medical records are encrypted and stored on IPFS. Only you and those you grant access to can view them.
        </Text>
      </Box>
    </Box>
  );
};

export default AddRecord;
