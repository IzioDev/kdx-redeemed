import { KaspaNetwork } from '@kdx-redeemed/shared-core';

export type KaswareOptions = {
  network?: 'tn-11' | 'mainnet';
};

type KaswareResponse<T> =
  | { success: true; data: T }
  | { success: false; message: string };

export type KaswareRequestAccountsResponse = KaswareResponse<string>;
export type KaswareSignMessageResponse = KaswareResponse<string>;
export type KaswareDisconnectResponse = KaswareResponse<void>;
export type KaswareSwitchNetworkResponse = KaswareResponse<void>;
export type KaswareGetNetworkResponse = KaswareResponse<KaspaNetwork>;
export type KaswareGetPublicKeyResponse = KaswareResponse<string>;

export type InternalKaswareOptions = {
  network: 'tn-11' | 'mainnet';
};
