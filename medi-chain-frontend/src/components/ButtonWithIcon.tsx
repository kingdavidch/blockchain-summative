import { Button, ButtonProps, HStack } from '@chakra-ui/react';
import { ReactElement } from 'react';

interface ButtonWithIconProps extends ButtonProps {
  leftIcon?: ReactElement;
  rightIcon?: ReactElement;
}

export const ButtonWithIcon = ({ leftIcon, rightIcon, children, ...props }: ButtonWithIconProps) => {
  return (
    <Button {...props}>
      <HStack gap={2}>
        {leftIcon}
        <span>{children}</span>
        {rightIcon}
      </HStack>
    </Button>
  );
};