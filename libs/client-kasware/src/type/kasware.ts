export type KaswareNetwork =
  | 'kaspa_mainnet'
  | 'kaspa_testnet_10'
  | 'kaspa_testnet_11';

export type KaswareBalance = {
  confirmed: number;
  unconfirmed: number;
  total: number;
};

export type KaswarePriorityFees = number;

export type KaswareSignature = 'ecsda' | 'bip322-simple';

export enum KaswareKRC20TransactionType {
  DEPLOYMENT = 2,
  MINT = 3,
  TRANSFER = 4,
}
