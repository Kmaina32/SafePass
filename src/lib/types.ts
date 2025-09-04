
export interface Credential {
  id: string;
  url: string;
  username: string;
  password_encrypted: string;
  category?: string;
  notes?: string;
}

export interface UserData {
  masterPasswordCheck: string;
  credentials: Credential[];
}
