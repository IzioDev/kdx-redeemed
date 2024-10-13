import { UserWallet } from '@kdx-redeemed/data-access-wallet';
import { Request } from 'express';

export type AuthInputPayload = WalletAuthInputMessagePayload;

// possibility of type expansion here in the future
type WalletAuthInputMessagePayload = KaswareWalletMessagePaload;

export type KaswareWalletMessagePaload = {
  type: 'kasware';
  signature: string;
  publicKey: string;
};

export type AuthedRequest<
  P = { [key: string]: string },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ResBody = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ReqBody = any,
  ReqQuery = { [key: string]: undefined | string | string[] },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Locals extends Record<string, any> = Record<string, any>
> = Request<P, ResBody, ReqBody, ReqQuery, Locals> & { wallet: UserWallet };
