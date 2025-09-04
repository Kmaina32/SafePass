
import CryptoJS from 'crypto-js';

export const encrypt = (text: string, key: string): string => {
  return CryptoJS.AES.encrypt(text, key).toString();
};

export const decrypt = (ciphertext: string, key: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  if (!decrypted) {
      throw new Error("Decryption failed. The key may be incorrect or the data is corrupted.");
  }
  return decrypted;
};
