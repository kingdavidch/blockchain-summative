import { Box, BoxProps, Text, TextProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface FormControlProps extends BoxProps {
  isRequired?: boolean;
  children: ReactNode;
}

export const FormControl = ({ isRequired, children, ...props }: FormControlProps) => {
  return (
    <Box {...props}>
      {children}
    </Box>
  );
};

interface FormLabelProps extends TextProps {
  children: ReactNode;
}

export const FormLabel = ({ children, ...props }: FormLabelProps) => {
  return (
    <Text fontSize="sm" fontWeight="medium" mb={2} {...props}>
      {children}
    </Text>
  );
};