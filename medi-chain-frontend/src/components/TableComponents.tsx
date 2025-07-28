import { Box, BoxProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface TableProps extends BoxProps {
  variant?: string;
  children: ReactNode;
}

export const Table = ({ variant, children, ...props }: TableProps) => {
  return (
    <Box as="table" w="full" {...props}>
      {children}
    </Box>
  );
};

export const Thead = ({ children, ...props }: BoxProps & { children: ReactNode }) => {
  return (
    <Box as="thead" {...props}>
      {children}
    </Box>
  );
};

export const Tbody = ({ children, ...props }: BoxProps & { children: ReactNode }) => {
  return (
    <Box as="tbody" {...props}>
      {children}
    </Box>
  );
};

export const Tr = ({ children, ...props }: BoxProps & { children: ReactNode }) => {
  return (
    <Box as="tr" borderBottomWidth="1px" {...props}>
      {children}
    </Box>
  );
};

export const Th = ({ children, ...props }: BoxProps & { children: ReactNode }) => {
  return (
    <Box as="th" p={3} textAlign="left" fontWeight="semibold" fontSize="sm" color="gray.600" {...props}>
      {children}
    </Box>
  );
};

export const Td = ({ children, ...props }: BoxProps & { children: ReactNode }) => {
  return (
    <Box as="td" p={3} {...props}>
      {children}
    </Box>
  );
};