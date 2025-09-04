
export interface Credential {
  id: string;
  url: string;
  username: string;
  password_encrypted: string;
}

export interface UserData {
  masterPasswordCheck: string;
  credentials: Credential[];
}
