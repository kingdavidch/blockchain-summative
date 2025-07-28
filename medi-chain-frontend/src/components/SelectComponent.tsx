import { Select as ChakraSelect, SelectProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface CustomSelectProps extends SelectProps {
  children: ReactNode;
}

export const Select = ({ children, ...props }: CustomSelectProps) => {
  return (
    <ChakraSelect {...props}>
      {children}
    </ChakraSelect>
  );
};