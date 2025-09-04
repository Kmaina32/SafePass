

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

export interface SecureNote {
    id: string;
    title_encrypted: string;
    content_encrypted: string;
    createdAt: string;
    category?: string;
}

export interface Identity {
    id: string;
    title: string;
    // Name
    firstName_encrypted?: string;
    middleName_encrypted?: string;
    lastName_encrypted?: string;
    // Contact
    email_encrypted?: string;
    phone_encrypted?: string;
    website_encrypted?: string;
    // Address
    address1_encrypted?: string;
    address2_encrypted?: string;
    city_encrypted?: string;
    state_encrypted?: string;
    zip_encrypted?: string;
    country_encrypted?: string;
    notes?: string;
}


export interface UserData {
  masterPasswordCheck: string;
  credentials: Credential[];
  documents: SecureDocument[];
  paymentCards: PaymentCard[];
  secureNotes: SecureNote[];
  identities: Identity[];
  lastSeen?: string;
  profile?: {
      email?: string | null;
      displayName?: string | null;
      photoURL?: string | null;
  }
}
