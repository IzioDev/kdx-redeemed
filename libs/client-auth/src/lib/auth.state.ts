/// <reference types="vite/types/importMeta.d.ts" />

import { KaswareSdk } from '@kdx-redeemed/client-kasware';
import { create } from 'zustand';
import { Axios } from 'axios';
import { SignInDto } from '@kdx-redeemed/backend-auth';
import { generateAuthMessageToSign } from '@kdx-redeemed/shared-core';
import { jwtDecode, JwtPayload } from 'jwt-decode';

const JWT_STORAGE_KEY = 'token';

export interface AuthState {
  isAuthed: boolean;
  hasToken: boolean;
  address?: string;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthState = create<AuthState>((set) => {
  const kasware = new KaswareSdk();

  const authHttp = new Axios({
    baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    responseType: 'json',
  });

  const kaspaNetwork = import.meta.env.VITE_KASPA_NETWORK ?? 'mainnet';

  return {
    isAuthed: false,
    hasToken:
      (localStorage.getItem(JWT_STORAGE_KEY) ?? 'undefined') !== 'undefined',
    async login() {
      if (!kasware.isInstalled()) {
        throw new Error('Kasware not installed');
      }

      const networkResponse = await kasware.getNetwork();

      if (!networkResponse.success) {
        throw new Error(networkResponse.message);
      }

      if (kaspaNetwork !== networkResponse.data) {
        await kasware.switchNetwork(
          kasware.kaspaNetworkToKaswareNetwork(kaspaNetwork)
        );
      }

      const addressResponse = await kasware.requestAccounts();

      if (!addressResponse.success) {
        throw new Error(addressResponse.message);
      }

      const existingAccessToken = localStorage.getItem(JWT_STORAGE_KEY);

      if (existingAccessToken && existingAccessToken !== 'undefined') {
        try {
          const decoded = jwtDecode<JwtPayload & { address: string }>(
            existingAccessToken
          );

          const isValid =
            decoded.exp !== undefined &&
            Date.now() > decoded.exp &&
            decoded.address !== undefined &&
            decoded.address === addressResponse.data;

          if (isValid) {
            set({ address: addressResponse.data, isAuthed: true });
            return;
          }
        } catch (error) {
          // consider token invalid if an error happen
          console.error(error);
        }
      }

      const publicKeyResponse = await kasware.getPublicKey();

      if (!publicKeyResponse.success) {
        throw new Error(publicKeyResponse.message);
      }

      const publicKey = publicKeyResponse.data;

      const messageSignatureResponse = await kasware.signMessage(
        generateAuthMessageToSign(),
        'ecsda'
      );

      if (!messageSignatureResponse.success) {
        throw new Error(messageSignatureResponse.message);
      }

      const body: SignInDto = {
        publicKey,
        signature: messageSignatureResponse.data,
        type: 'kasware',
      };

      // TODO: for unknown reasons, axios is considering the response as "string", but it's a valid JSON
      // it should automatically parse it to a Javascript object
      const authResponse = await authHttp.post<string>(
        '/auth/login',
        JSON.stringify(body)
      );

      const accessToken = JSON.parse(authResponse.data).accessToken;

      localStorage.setItem(JWT_STORAGE_KEY, accessToken);

      set({ address: addressResponse.data, isAuthed: true });
    },
    async logout() {
      if (!kasware.isInstalled()) {
        throw new Error('Kasware not installed');
      }

      await kasware.disconnect();
      localStorage.removeItem(JWT_STORAGE_KEY);
      set({ address: undefined, isAuthed: false });
    },
  };
});
