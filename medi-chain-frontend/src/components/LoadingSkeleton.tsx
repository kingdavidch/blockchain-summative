import { Box, Skeleton, VStack, HStack } from '@chakra-ui/react';

interface LoadingSkeletonProps {
  count?: number;
  height?: string | number;
  width?: string | number;
  spacing?: string | number;
  variant?: 'text' | 'rect' | 'circle';
}

export const CardSkeleton = ({ count = 1, height = '120px', spacing = 4 }) => {
  return (
    <VStack spacing={spacing} align="stretch">
      {[...Array(count)].map((_, i) => (
        <Skeleton 
          key={i} 
          height={height} 
          borderRadius="md"
          startColor="gray.50"
          endColor="gray.100"
        />
      ))}
    </VStack>
  );
};

export const ListSkeleton = ({ count = 3, height = '60px', spacing = 2 }) => {
  return (
    <VStack spacing={spacing} align="stretch">
      {[...Array(count)].map((_, i) => (
        <Skeleton 
          key={i} 
          height={height} 
          borderRadius="md"
          startColor="gray.50"
          endColor="gray.100"
        />
      ))}
    </VStack>
  );
};

export const TableSkeleton = ({ rows = 5, columns = 4, height = '40px', spacing = 2 }) => {
  return (
    <VStack spacing={spacing} align="stretch">
      {/* Header */}
      <HStack spacing={spacing}>
        {[...Array(columns)].map((_, i) => (
          <Skeleton 
            key={`header-${i}`}
            height={height}
            flex={1}
            startColor="gray.100"
            endColor="gray.200"
          />
        ))}
      </HStack>
      
      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <HStack key={rowIndex} spacing={spacing}>
          {[...Array(columns)].map((_, colIndex) => (
            <Skeleton 
              key={`row-${rowIndex}-col-${colIndex}`}
              height={height}
              flex={1}
              startColor="gray.50"
              endColor="gray.100"
              opacity={0.7 + (0.3 / (rowIndex + 1))}
            />
          ))}
        </HStack>
      ))}
    </VStack>
  );
};

export const LoadingSkeleton = ({
  count = 1,
  height = '20px',
  width = '100%',
  spacing = 2,
  variant = 'text',
}: LoadingSkeletonProps) => {
  return (
    <VStack spacing={spacing} align="stretch">
      {[...Array(count)].map((_, i) => (
        <Skeleton
          key={i}
          height={height}
          width={width}
          startColor="gray.50"
          endColor="gray.100"
          borderRadius={variant === 'circle' ? 'full' : 'md'}
        />
      ))}
    </VStack>
  );
};

// HOC for loading states
export const withLoadingSkeleton = <P extends object>(
  Component: React.ComponentType<P>,
  SkeletonComponent: React.ComponentType<any> = LoadingSkeleton
) => {
  return function WithLoadingSkeleton({
    isLoading,
    ...props
  }: P & { isLoading?: boolean }) {
    if (isLoading) {
      return <SkeletonComponent />;
    }
    return <Component {...(props as P)} />;
  };
};
