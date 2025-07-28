import { Box, BoxProps, Input as ChakraInput, InputProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface InputGroupProps extends BoxProps {
  size?: string;
  children: ReactNode;
}

export const InputGroup = ({ size, children, ...props }: InputGroupProps) => {
  return (
    <Box position="relative" {...props}>
      {children}
    </Box>
  );
};

export const InputLeftElement = ({ children, ...props }: BoxProps & { children: ReactNode }) => {
  return (
    <Box
      position="absolute"
      left={3}
      top="50%"
      transform="translateY(-50%)"
      zIndex={2}
      pointerEvents="none"
      {...props}
    >
      {children}
    </Box>
  );
};

export const InputRightElement = ({ children, ...props }: BoxProps & { children: ReactNode }) => {
  return (
    <Box
      position="absolute"
      right={3}
      top="50%"
      transform="translateY(-50%)"
      zIndex={2}
      {...props}
    >
      {children}
    </Box>
  );
};