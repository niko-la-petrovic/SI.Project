import { createContext } from "react";
import forge from "node-forge";

export const CertStoreLocalStorageKey = "certStore";

export enum CertStoreActionType {
  SET_STATE = "SET_STATE",
  SET_PEM_PUBLIC_KEY = "SET_PEM_PUBLIC_KEY",
  SET_PEM_PRIVATE_KEY = "SET_PEM_PRIVATE_KEY",
  SET_PEM_CERT = "SET_PEM_CERT",
  CLEAR = "CLEAR",
}

export type CertStoreAction =
  | {
      type: CertStoreActionType.SET_STATE;
      state: CertStoreState;
    }
  | {
      type: CertStoreActionType.SET_PEM_PUBLIC_KEY;
      publicKey: string;
    }
  | {
      type: CertStoreActionType.SET_PEM_PRIVATE_KEY;
      privateKey: string;
    }
  | {
      type: CertStoreActionType.SET_PEM_CERT;
      cert: string;
    }
  | {
      type: CertStoreActionType.CLEAR;
    };

export interface CertStoreState {
  cert: forge.pki.Certificate | null;
  certPem: string | null;
  publicKey: forge.pki.PublicKey | null;
  publicKeyPem: string | null;
  privateKey: forge.pki.rsa.PrivateKey | null;
  privateKeyPem: string | null;
  privateKeyError: string | null;
  error: string | null;
}

export const certStoreInitialState: CertStoreState = {
  certPem: null,
  publicKeyPem: null,
  privateKeyPem: null,
  cert: null,
  publicKey: null,
  privateKey: null,
  error: null,
  privateKeyError: null,
};

// TODO try catch/set error
export const certStoreReducer = (
  state: CertStoreState,
  action: CertStoreAction
): CertStoreState => {
  switch (action.type) {
    case CertStoreActionType.SET_STATE:
      return {
        ...action.state,
        cert: action.state.certPem
          ? forge.pki.certificateFromPem(action.state.certPem)
          : null,
        publicKey: action.state.publicKeyPem
          ? forge.pki.publicKeyFromPem(action.state.publicKeyPem)
          : null,
        privateKey: action.state.privateKeyPem
          ? forge.pki.privateKeyFromPem(action.state.privateKeyPem)
          : null,
      };
    case CertStoreActionType.SET_PEM_CERT:
      const cert = forge.pki.certificateFromPem(action.cert);
      return {
        ...state,
        cert: cert,
        certPem: action.cert,
        publicKey: cert.publicKey,
      };
    case CertStoreActionType.SET_PEM_PUBLIC_KEY:
      const publicKey = forge.pki.publicKeyFromPem(action.publicKey);
      return {
        ...state,
        publicKey: publicKey,
        publicKeyPem: action.publicKey,
      };
    case CertStoreActionType.SET_PEM_PRIVATE_KEY:
      try {
        const privateKey = forge.pki.privateKeyFromPem(action.privateKey);
        return {
          ...state,
          privateKey: privateKey,
          privateKeyPem: action.privateKey,
          privateKeyError: null,
        };
      } catch (error) {
        return {
          ...state,
          privateKeyError: "Invalid private key",
        };
      }
    case CertStoreActionType.CLEAR:
      return certStoreInitialState;
    default:
      throw new Error("Invalid action type");
  }
};

export const CertStoreContext = createContext({
  state: certStoreInitialState,
  dispatch: (action: CertStoreAction) => {},
});
