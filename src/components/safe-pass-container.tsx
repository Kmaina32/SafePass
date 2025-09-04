"use client";

import { useState } from "react";
import { MasterPasswordForm } from "@/components/master-password-form";
import { PasswordManager } from "@/components/password-manager";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useMounted } from "@/hooks/use-mounted";
import { encrypt, decrypt } from "@/lib/encryption";
import type { Credential, UserData } from "@/lib/types";
import { Skeleton } from "./ui/skeleton";

const USERS_DATA_KEY = "safepass_users_data";
const CHECK_VALUE = "safepass_ok";

export function SafePassContainer() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [masterPassword, setMasterPassword] = useState("");
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | undefined>();
  const [isInitialSetup, setIsInitialSetup] = useState(true);

  const [usersData, setUsersData] = useLocalStorage<Record<string, UserData>>(USERS_DATA_KEY, {});

  const isMounted = useMounted();

  const handleUnlock = (values: { username: string; password: string }) => {
    const { username, password } = values;
    setAuthError(undefined);

    const userData = usersData[username];

    if (isInitialSetup) {
      // Sign up flow
      if (userData) {
        setAuthError("Username already exists. Please try logging in.");
        return;
      }
      const newCheck = encrypt(CHECK_VALUE, password);
      const newUser: UserData = {
        masterPasswordCheck: newCheck,
        credentials: [],
      };
      setUsersData({ ...usersData, [username]: newUser });
      setMasterPassword(password);
      setCurrentUser(username);
      setIsUnlocked(true);
    } else {
      // Log in flow
      if (!userData) {
        setAuthError("Username not found. Please sign up.");
        return;
      }
      try {
        const decryptedCheck = decrypt(userData.masterPasswordCheck, password);
        if (decryptedCheck === CHECK_VALUE) {
          setMasterPassword(password);
          setCurrentUser(username);
          setIsUnlocked(true);
        } else {
          setAuthError("Invalid username or master password.");
        }
      } catch (error) {
        setAuthError("Invalid username or master password.");
      }
    }
  };
  
  const handleSwitchMode = () => {
      setIsInitialSetup(!isInitialSetup);
      setAuthError(undefined);
  }

  const handleAddCredential = (values: { url: string; username: string; password: string }) => {
    if (!masterPassword || !currentUser) return;

    const newCredential: Credential = {
      id: crypto.randomUUID(),
      url: values.url,
      username: values.username,
      password_encrypted: encrypt(values.password, masterPassword),
    };

    const updatedUserData = {
      ...usersData[currentUser],
      credentials: [...usersData[currentUser].credentials, newCredential],
    };
    setUsersData({ ...usersData, [currentUser]: updatedUserData });
  };

  const handleDeleteCredential = (id: string) => {
    if (!currentUser) return;
    const updatedCredentials = usersData[currentUser].credentials.filter((c) => c.id !== id);
    const updatedUserData = {
      ...usersData[currentUser],
      credentials: updatedCredentials,
    };
    setUsersData({ ...usersData, [currentUser]: updatedUserData });
  };

  const handleLock = () => {
    setMasterPassword("");
    setIsUnlocked(false);
    setCurrentUser(null);
    setAuthError(undefined);
  };

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-md">
        <Skeleton className="h-[450px] w-full" />
      </div>
    );
  }

  if (!isUnlocked || !currentUser) {
    return (
      <MasterPasswordForm
        isInitialSetup={isInitialSetup}
        onUnlock={handleUnlock}
        onSwitchMode={handleSwitchMode}
        error={authError}
      />
    );
  }

  return (
    <PasswordManager
      credentials={usersData[currentUser]?.credentials || []}
      masterPassword={masterPassword}
      onAddCredential={handleAddCredential}
      onDeleteCredential={handleDeleteCredential}
      onLock={handleLock}
    />
  );
}
