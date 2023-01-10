import { createContext } from "react";
import forge from "node-forge";

export enum CertStoreActionType {
  SET_PEM_CERT = "SET_CERT",
  SET_PEM_CERT_PRIVATE_KEY = "SET_CERT_PRIVATE_KEY",
  CLEAR = "CLEAR",
}

export type CertStoreAction =
  | {
      type: CertStoreActionType.SET_PEM_CERT;
      cert: string;
    }
  | {
      type: CertStoreActionType.SET_PEM_CERT_PRIVATE_KEY;
      certPrivateKey: string;
    }
  | {
      type: CertStoreActionType.CLEAR;
    };

export interface CertStoreState {
  cert: forge.pki.Certificate | null;
  certPrivateKey: forge.pki.rsa.PrivateKey | null;
  error: string | null;
}

export const certStoreInitialState: CertStoreState = {
  cert: null,
  certPrivateKey: null,
  error: null,
};

// TODO try catch/set error
// TODO save/load to/from local storage
export const certStoreReducer = (
  state: CertStoreState,
  action: CertStoreAction
): CertStoreState => {
  switch (action.type) {
    case CertStoreActionType.SET_PEM_CERT:
      return {
        ...state,
        cert: forge.pki.certificateFromPem(action.cert),
      };
    case CertStoreActionType.SET_PEM_CERT_PRIVATE_KEY:
      return {
        ...state,
        certPrivateKey: forge.pki.privateKeyFromPem(action.certPrivateKey),
      };
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
