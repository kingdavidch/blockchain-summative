import { Box, BoxProps } from '@chakra-ui/react';
import { ReactNode, useState, createContext, useContext } from 'react';

interface TabsContextType {
  activeTab: number;
  setActiveTab: (index: number) => void;
}

const TabsContext = createContext<TabsContextType>({
  activeTab: 0,
  setActiveTab: () => {},
});

interface TabsProps extends BoxProps {
  variant?: string;
  children: ReactNode;
}

export const Tabs = ({ variant, children, ...props }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <Box {...props}>
        {children}
      </Box>
    </TabsContext.Provider>
  );
};

export const TabList = ({ children, ...props }: BoxProps & { children: ReactNode }) => {
  return (
    <Box display="flex" borderBottomWidth="1px" {...props}>
      {children}
    </Box>
  );
};

interface TabProps extends BoxProps {
  children: ReactNode;
}

export const Tab = ({ children, ...props }: TabProps) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const tabIndex = 0; // This would need to be calculated based on position

  return (
    <Box
      as="button"
      px={4}
      py={2}
      borderBottomWidth={activeTab === tabIndex ? "2px" : "0"}
      borderBottomColor="brand.500"
      color={activeTab === tabIndex ? "brand.500" : "gray.600"}
      fontWeight={activeTab === tabIndex ? "semibold" : "normal"}
      _hover={{ color: "brand.500" }}
      onClick={() => setActiveTab(tabIndex)}
      {...props}
    >
      {children}
    </Box>
  );
};

export const TabPanels = ({ children, ...props }: BoxProps & { children: ReactNode }) => {
  return (
    <Box {...props}>
      {children}
    </Box>
  );
};

interface TabPanelProps extends BoxProps {
  children: ReactNode;
}

export const TabPanel = ({ children, ...props }: TabPanelProps) => {
  const { activeTab } = useContext(TabsContext);
  const panelIndex = 0; // This would need to be calculated based on position

  if (activeTab !== panelIndex) return null;

  return (
    <Box {...props}>
      {children}
    </Box>
  );
};