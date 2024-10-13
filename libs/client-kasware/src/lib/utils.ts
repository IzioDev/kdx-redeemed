import { InternalKaswareOptions, KaswareOptions } from './types';

export const adaptOptionsToInternalOptions = (
  options?: KaswareOptions
): InternalKaswareOptions => {
  return {
    network: options?.network ?? 'mainnet',
  };
};
