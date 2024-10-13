// documentation: https://docs.kasware.xyz/wallet/dev-base/dev-integration

import { KaswareNotInstalledError } from './errors';
import { KaswareNetwork, KaswareSignature } from '../type/kasware';
import {
  KaswareOptions,
  KaswareSignMessageResponse,
  KaswareDisconnectResponse,
  KaswareSwitchNetworkResponse,
  KaswareGetNetworkResponse,
  KaswareGetPublicKeyResponse,
  InternalKaswareOptions,
  KaswareRequestAccountsResponse,
} from './types';
import { adaptOptionsToInternalOptions } from './utils';
import { KaspaNetwork } from '@kdx-redeemed/shared-core';

export class KaswareSdk {
  private internalOptions: InternalKaswareOptions;

  constructor(options?: KaswareOptions) {
    this.internalOptions = adaptOptionsToInternalOptions(options);
  }

  requestAccounts(): Promise<KaswareRequestAccountsResponse> {
    if (window.kasware === undefined) {
      throw new KaswareNotInstalledError();
    }

    return window.kasware
      .requestAccounts()
      .then((addresses): KaswareRequestAccountsResponse => {
        return { success: true, data: addresses[0] };
      })
      .catch(
        (error: Error): KaswareRequestAccountsResponse => ({
          success: false,
          message: error.message,
        })
      );
  }

  signMessage(
    message: string,
    type: KaswareSignature
  ): Promise<KaswareSignMessageResponse> {
    if (window.kasware === undefined) {
      throw new KaswareNotInstalledError();
    }

    return window.kasware
      .signMessage(message, type)
      .then((signedHash): KaswareSignMessageResponse => {
        return { success: true, data: signedHash };
      })
      .catch(
        (error: Error): KaswareSignMessageResponse => ({
          success: false,
          message: error.message,
        })
      );
  }

  disconnect(): Promise<KaswareDisconnectResponse> {
    if (window.kasware === undefined) {
      throw new KaswareNotInstalledError();
    }

    const origin = window.location.origin;

    return window.kasware
      .disconnect(origin)
      .then((): KaswareDisconnectResponse => {
        return { success: true, data: undefined };
      })
      .catch(
        (error: Error): KaswareDisconnectResponse => ({
          success: false,
          message: error.message,
        })
      );
  }

  switchNetwork(
    network: KaswareNetwork
  ): Promise<KaswareSwitchNetworkResponse> {
    if (window.kasware === undefined) {
      throw new KaswareNotInstalledError();
    }

    return window.kasware
      .switchNetwork(network)
      .then((): KaswareSwitchNetworkResponse => {
        return { success: true, data: undefined };
      })
      .catch(
        (error: Error): KaswareSwitchNetworkResponse => ({
          success: false,
          message: error.message,
        })
      );
  }
  getNetwork(): Promise<KaswareGetNetworkResponse> {
    if (window.kasware === undefined) {
      throw new KaswareNotInstalledError();
    }

    return window.kasware
      .getNetwork()
      .then((network): KaswareGetNetworkResponse => {
        return {
          success: true,
          data: this.kaswareNetworkToKaspaNetwork(network),
        };
      })
      .catch(
        (error: Error): KaswareGetNetworkResponse => ({
          success: false,
          message: error.message,
        })
      );
  }
  getPublicKey(): Promise<KaswareGetPublicKeyResponse> {
    if (window.kasware === undefined) {
      throw new KaswareNotInstalledError();
    }

    return window.kasware
      .getPublicKey()
      .then((publicKey): KaswareGetPublicKeyResponse => {
        return { success: true, data: publicKey };
      })
      .catch(
        (error: Error): KaswareGetPublicKeyResponse => ({
          success: false,
          message: error.message,
        })
      );
  }
  isInstalled() {
    return window.kasware !== undefined;
  }
  kaspaNetworkToKaswareNetwork(network: KaspaNetwork): KaswareNetwork {
    switch (network) {
      case KaspaNetwork.MAINNET:
        return 'kaspa_mainnet';
      case KaspaNetwork.TN10:
        return 'kaspa_testnet_10';
      case KaspaNetwork.TN11:
        return 'kaspa_testnet_11';
      default:
        throw new Error(`Unknown network ${network}`);
    }
  }
  kaswareNetworkToKaspaNetwork(network: KaswareNetwork): KaspaNetwork {
    switch (network) {
      case 'kaspa_mainnet':
        return KaspaNetwork.MAINNET;
      case 'kaspa_testnet_10':
        return KaspaNetwork.TN10;
      case 'kaspa_testnet_11':
        return KaspaNetwork.TN11;
      default:
        throw new Error(`Unknown network ${network}`);
    }
  }
}
