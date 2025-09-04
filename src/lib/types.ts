
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
    data_encrypted: string; // The encrypted file content as a Base64 string
    iv: string; // The initialization vector for AES
    encryptedKey: string; // The AES key, encrypted with the master password
    size: number;
    createdAt: string;
    isLocked?: boolean;
}

export interface PaymentCard {
    id: string;
    cardholderName: string;
    cardNumber_encrypted: string;
    expiryDate_encrypted: string;
    cvv_encrypted: string;
    cardType: 'visa' | 'mastercard' | 'amex' | 'discover' | 'other';
    notes?: string;
}

export interface UserData {
  masterPasswordCheck: string;
  credentials: Credential[];
  documents: SecureDocument[];
  paymentCards: PaymentCard[];
}
