// documentation: https://docs.kasware.xyz/wallet/dev-base/dev-integration

import { useCallback } from 'react';
import { KaswareNetwork, KaswareSignature } from '../type/kasware';
import {
  KaswareOptions,
  KaswareRequestAccountsResponse,
  KaswareSignMessageResponse,
  KaswareDisconnectResponse,
  KaswareSwitchNetworkResponse,
  KaswareGetNetworkResponse,
  KaswareGetPublicKeyResponse,
} from './types';
import { KaswareSdk } from './kasware';

export const useKasware = (options?: KaswareOptions) => {
  const sdk = new KaswareSdk(options);

  const requestAccounts =
    useCallback((): Promise<KaswareRequestAccountsResponse> => {
      return sdk.requestAccounts();
    }, []);

  const signMessage = useCallback(
    (
      message: string,
      type: KaswareSignature
    ): Promise<KaswareSignMessageResponse> => {
      return sdk.signMessage(message, type);
    },
    []
  );

  const disconnect = useCallback((): Promise<KaswareDisconnectResponse> => {
    return sdk.disconnect();
  }, []);

  const switchNetwork = useCallback(
    (network: KaswareNetwork): Promise<KaswareSwitchNetworkResponse> => {
      return sdk.switchNetwork(network);
    },
    []
  );

  const getNetwork = useCallback((): Promise<KaswareGetNetworkResponse> => {
    return sdk.getNetwork();
  }, []);

  const getPublicKey = useCallback((): Promise<KaswareGetPublicKeyResponse> => {
    return sdk.getPublicKey();
  }, []);

  const isInstalled = useCallback(() => {
    return sdk.isInstalled();
  }, []);

  return {
    isInstalled,
    requestAccounts,
    signMessage,
    disconnect,
    switchNetwork,
    getNetwork,
    getPublicKey,
  };
};
