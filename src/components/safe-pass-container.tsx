"use client";

import { useState } from "react";
import { MasterPasswordForm } from "@/components/master-password-form";
import { PasswordManager } from "@/components/password-manager";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useMounted } from "@/hooks/use-mounted";
import { encrypt, decrypt } from "@/lib/encryption";
import type { Credential } from "@/lib/types";
import { Skeleton } from "./ui/skeleton";

const MASTER_PASSWORD_CHECK_KEY = "safepass_check";
const CREDENTIALS_KEY = "safepass_credentials";
const CHECK_VALUE = "safepass_ok";

export function SafePassContainer() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [masterPassword, setMasterPassword] = useState("");
  const [authError, setAuthError] = useState<string | undefined>();
  
  const [masterPasswordCheck, setMasterPasswordCheck] = useLocalStorage<string | null>(MASTER_PASSWORD_CHECK_KEY, null);
  const [credentials, setCredentials] = useLocalStorage<Credential[]>(CREDENTIALS_KEY, []);
  
  const isMounted = useMounted();

  const handleUnlock = (password: string) => {
    setAuthError(undefined);

    if (masterPasswordCheck) {
      // Subsequent use: Check password
      try {
        const decryptedCheck = decrypt(masterPasswordCheck, password);
        if (decryptedCheck === CHECK_VALUE) {
          setMasterPassword(password);
          setIsUnlocked(true);
        } else {
          setAuthError("Invalid master password.");
        }
      } catch (error) {
        setAuthError("Invalid master password.");
      }
    } else {
      // First time setup
      const newCheck = encrypt(CHECK_VALUE, password);
      setMasterPasswordCheck(newCheck);
      setMasterPassword(password);
      setIsUnlocked(true);
    }
  };

  const handleAddCredential = (values: { url: string; username: string; password: string }) => {
    if (!masterPassword) return;

    const newCredential: Credential = {
      id: crypto.randomUUID(),
      url: values.url,
      username: values.username,
      password_encrypted: encrypt(values.password, masterPassword),
    };

    setCredentials([...credentials, newCredential]);
  };

  const handleDeleteCredential = (id: string) => {
    setCredentials(credentials.filter((c) => c.id !== id));
  };
  
  const handleLock = () => {
    setMasterPassword("");
    setIsUnlocked(false);
    setAuthError(undefined);
  }

  if (!isMounted) {
    return (
       <div className="flex flex-col items-center justify-center w-full max-w-md">
        <Skeleton className="h-[450px] w-full" />
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <MasterPasswordForm
        isInitialSetup={!masterPasswordCheck}
        onUnlock={handleUnlock}
        error={authError}
      />
    );
  }

  return (
    <PasswordManager
      credentials={credentials}
      masterPassword={masterPassword}
      onAddCredential={handleAddCredential}
      onDeleteCredential={handleDeleteCredential}
      onLock={handleLock}
    />
  );
}
