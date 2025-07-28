import { IconButton, IconButtonProps } from '@chakra-ui/react';
import { ReactElement } from 'react';

interface IconButtonWrapperProps extends Omit<IconButtonProps, 'children'> {
  icon: ReactElement;
}

export const IconButtonWrapper = ({ icon, ...props }: IconButtonWrapperProps) => {
  return (
    <IconButton {...props}>
      {icon}
    </IconButton>
  );
};