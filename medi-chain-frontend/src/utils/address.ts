export const shortenAddress = (address: string, startLength = 6, endLength = 4): string => {
  if (!address) return '';
  return `${address.substring(0, startLength)}...${address.substring(
    address.length - endLength
  )}`;
};

export const isAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const formatAddress = (address: string): string => {
  if (!isAddress(address)) return '';
  return address.toLowerCase();
};
