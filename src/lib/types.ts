
export interface Credential {
  id: string;
  url: string;
  username: string;
  password_encrypted: string;
  category?: string;
  notes?: string;
}

export interface SecureDocument {
    id: string;
    name: string;
    type: string;
    storagePath: string;
    encryptedKey: string; // The AES key, encrypted with the master password
    iv: string; // The initialization vector for AES
    size: number;
    createdAt: string;
}

export interface UserData {
  masterPasswordCheck: string;
  credentials: Credential[];
  documents?: SecureDocument[];
}
