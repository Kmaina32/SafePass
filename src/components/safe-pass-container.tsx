
"use client";

import { useState, useEffect } from "react";
import { MasterPasswordForm } from "@/components/master-password-form";
import { PasswordManager } from "@/components/password-manager";
import { useMounted } from "@/hooks/use-mounted";
import { encrypt, decrypt } from "@/lib/encryption";
import type { Credential, UserData } from "@/lib/types";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { ref, onValue, set } from "firebase/database";
import { SignInPage } from "./sign-in-page";
import { CreateMasterPasswordForm } from "./create-master-password-form";
import { LoadingDisplay } from "./loading-display";

const CHECK_VALUE = "safepass_ok";

export function SafePassContainer() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [masterPassword, setMasterPassword] = useState("");
  const [authError, setAuthError] = useState<string | undefined>();
  const [userData, setUserData] = useState<UserData | null>(null);

  const [user, loading] = useAuthState(auth);
  const isMounted = useMounted();

  useEffect(() => {
    if (user) {
      const userRef = ref(db, `users/${user.uid}`);
      const unsubscribe = onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        setUserData(data);
        if (data && data.masterPasswordCheck) {
          // User exists and has a master password set up
        } else {
          // New user or master password not set
          setIsUnlocked(false);
        }
      });
      return () => unsubscribe();
    } else {
      setUserData(null);
      setIsUnlocked(false);
    }
  }, [user]);

  const handleCreateMasterPassword = (password: string) => {
    if (!user) return;
    const newCheck = encrypt(CHECK_VALUE, password);
    const newUser: UserData = {
      masterPasswordCheck: newCheck,
      credentials: [],
    };
    set(ref(db, `users/${user.uid}`), newUser)
      .then(() => {
        setUserData(newUser);
        setMasterPassword(password);
        setIsUnlocked(true);
      })
      .catch((error) => {
        console.error("Error setting master password:", error);
        setAuthError("Could not set master password.");
      });
  };

  const handleUnlock = (values: { username: string, password: string }) => {
    const { password } = values;
    setAuthError(undefined);

    if (!userData) {
      setAuthError("User data not found. Please try again.");
      return;
    }
    try {
      const decryptedCheck = decrypt(userData.masterPasswordCheck, password);
      if (decryptedCheck === CHECK_VALUE) {
        setMasterPassword(password);
        setIsUnlocked(true);
      } else {
        setAuthError("Invalid master password.");
      }
    } catch (error) {
      setAuthError("Invalid master password.");
    }
  };

  const handleAddCredential = (values: { url: string; username: string; password: string }) => {
    if (!masterPassword || !user) return;

    const newCredential: Credential = {
      id: crypto.randomUUID(),
      url: values.url,
      username: values.username,

      password_encrypted: encrypt(values.password, masterPassword),
    };
    
    const credentials = userData?.credentials || [];
    const updatedCredentials = [...credentials, newCredential];

    set(ref(db, `users/${user.uid}/credentials`), updatedCredentials)
      .catch((error) => console.error("Failed to add credential", error));
  };

  const handleDeleteCredential = (id: string) => {
    if (!user || !userData) return;
    const updatedCredentials = userData.credentials.filter((c) => c.id !== id);
    set(ref(db, `users/${user.uid}/credentials`), updatedCredentials)
      .catch((error) => console.error("Failed to delete credential", error));
  };

  const handleLock = () => {
    setMasterPassword("");
    setIsUnlocked(false);
    setAuthError(undefined);
  };

  if (!isMounted || loading) {
    return <LoadingDisplay />;
  }

  if (!user) {
    return <SignInPage />;
  }

  if (!userData?.masterPasswordCheck) {
    return <CreateMasterPasswordForm onSubmit={handleCreateMasterPassword} error={authError} />;
  }
  
  if (!isUnlocked) {
    return (
      <MasterPasswordForm
        isInitialSetup={false}
        onUnlock={handleUnlock}
        onSwitchMode={() => auth.signOut()}
        error={authError}
      />
    );
  }

  return (
    <PasswordManager
      credentials={userData?.credentials || []}
      masterPassword={masterPassword}
      onAddCredential={handleAddCredential}
      onDeleteCredential={handleDeleteCredential}
      onLock={handleLock}
    />
  );
}
