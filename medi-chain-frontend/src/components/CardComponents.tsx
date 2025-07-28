import { Box, BoxProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface CardProps extends BoxProps {
  children: ReactNode;
}

export const Card = ({ children, ...props }: CardProps) => {
  return (
    <Box
      bg="white"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="gray.200"
      boxShadow="sm"
      overflow="hidden"
      {...props}
    >
      {children}
    </Box>
  );
};

export const CardHeader = ({ children, ...props }: BoxProps & { children: ReactNode }) => {
  return (
    <Box p={6} borderBottomWidth="1px" borderBottomColor="gray.200" {...props}>
      {children}
    </Box>
  );
};

export const CardBody = ({ children, ...props }: BoxProps & { children: ReactNode }) => {
  return (
    <Box p={6} {...props}>
      {children}
    </Box>
  );
};