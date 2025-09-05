
type BaseItem = {
    id: string;
    deletedAt?: string; // ISO string
}

export interface Credential extends BaseItem {
  url: string;
  username: string;
  password_encrypted: string;
  category?: string;
  notes?: string;
  failedAttempts?: { timestamp: string, location: string }[];
}

export interface SecureDocument extends BaseItem {
    name: string;
    type: string;
    data_encrypted: string; // The encrypted file content as a Base64 string
    iv: string; // The initialization vector for AES
    encryptedKey: string; // The AES key, encrypted with the master password
    size: number;
    createdAt: string;
    isLocked?: boolean;
}

export interface PaymentCard extends BaseItem {
    cardholderName: string;
    cardNumber_encrypted: string;
    expiryDate_encrypted: string;
    cvv_encrypted: string;
    cardType: 'visa' | 'mastercard' | 'amex' | 'discover' | 'other';
    notes?: string;
}

export interface SecureNote extends BaseItem {
    title_encrypted: string;
    content_encrypted: string;
    createdAt: string;
    category?: string;
    // Allow any other properties for flexibility
    [key: string]: any;
}

export interface Identity extends BaseItem {
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

export interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
}

export interface UserData {
  masterPasswordCheck: string;
  credentials: Credential[];
  documents: SecureDocument[];
  paymentCards: PaymentCard[];
  secureNotes: SecureNote[];
  identities: Identity[];
  notifications: Notification[];
  failedAttempts?: { [key: string]: { timestamp: string; location: string } };
  lastSeen?: string;
  profile?: {
      email?: string | null;
      displayName?: string | null;
      photoURL?: string | null;
  }
}

export interface AppConfig {
    signInImageUrls?: string[];
}
