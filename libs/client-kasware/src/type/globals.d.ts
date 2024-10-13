import { KaswareBalance, KaswareNetwork, KaswarePriorityFees, KaswareSignature } from "./kasware";

export { };

declare global {
    interface Window {
        kasware?: {
            requestAccounts: () => Promise<string[]>,
            getAccounts: () => Promise<string[]>,
            getNetwork: () => Promise<KaswareNetwork>,
            switchNetwork: (network: KaswareNetwork) => Promise<void>,
            disconnect: (origin: string) => Promise<void>,
            getPublicKey: () => Promise<string>,
            getBalance: () => Promise<KaswareBalance>,
            sendKaspa: (toAddress: string, sompi: number, options?: { priorityFee?: KaswarePriorityFees }) => Promise<string>,
            signMessage: (msg: string, type: KaswareSignature) => Promise<string>,
            signKRC20Transaction: (inscribeJsonString: string, type, destAddr: string, priorityFee: KaswarePriorityFees) => Promise<string>
        }
    }
}