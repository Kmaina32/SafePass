
"use client";

import { useState, useEffect } from "react";
import { MasterPasswordForm } from "@/components/master-password-form";
import { PasswordManager } from "@/components/password-manager";
import { useMounted } from "@/hooks/use-mounted";
import { encrypt, decrypt } from "@/lib/encryption";
import type { Credential, UserData, SecureDocument } from "@/lib/types";
import { auth, db, storage } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { ref, onValue, set } from "firebase/database";
import { ref as storageRef, uploadBytes, deleteObject } from "firebase/storage";
import { SignInPage } from "./sign-in-page";
import { CreateMasterPasswordForm } from "./create-master-password-form";
import { LoadingDisplay } from "./loading-display";
import { DashboardLayout } from "./dashboard-layout";
import { useToast } from "@/hooks/use-toast";
import CryptoJS from "crypto-js";

const CHECK_VALUE = "safepass_ok";

// Function to encrypt a file
async function encryptFile(file: File): Promise<{ encryptedBlob: Blob, iv: string, randomKey: string }> {
  const randomKey = CryptoJS.lib.WordArray.random(32).toString(); // 256-bit key
  const iv = CryptoJS.lib.WordArray.random(16).toString(); // 128-bit IV
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const fileWordArray = CryptoJS.lib.WordArray.create(reader.result as ArrayBuffer);
        const encrypted = CryptoJS.AES.encrypt(fileWordArray, CryptoJS.enc.Hex.parse(randomKey), {
            iv: CryptoJS.enc.Hex.parse(iv),
        }).toString();
        
        const encryptedBlob = new Blob([encrypted], { type: 'text/plain' });
        resolve({ encryptedBlob, iv, randomKey });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

export function SafePassContainer() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [masterPassword, setMasterPassword] = useState("");
  const [authError, setAuthError] = useState<string | undefined>();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeView, setActiveView] = useState<'passwords' | 'documents'>('passwords');

  const [user, loading] = useAuthState(auth);
  const isMounted = useMounted();
  const { toast } = useToast();

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
      documents: [],
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

  const handleAddCredential = (values: { url: string; username: string; password: string, category?: string, notes?: string }) => {
    if (!masterPassword || !user) return;

    const newCredential: Credential = {
      id: crypto.randomUUID(),
      url: values.url,
      username: values.username,
      password_encrypted: encrypt(values.password, masterPassword),
      category: values.category,
      notes: values.notes,
    };
    
    const credentials = userData?.credentials || [];
    const updatedCredentials = [...credentials, newCredential];

    set(ref(db, `users/${user.uid}/credentials`), updatedCredentials)
      .catch((error) => console.error("Failed to add credential", error));
  };
  
  const handleUpdateCredential = (values: { id: string; url: string; username: string; password: string, category?: string, notes?: string }) => {
    if (!masterPassword || !user || !userData?.credentials) return;

    const updatedCredentials = userData.credentials.map(cred => {
      if (cred.id === values.id) {
        return {
          ...cred,
          url: values.url,
          username: values.username,
          password_encrypted: encrypt(values.password, masterPassword),
          category: values.category,
          notes: values.notes,
        };
      }
      return cred;
    });

    set(ref(db, `users/${user.uid}/credentials`), updatedCredentials)
      .catch((error) => console.error("Failed to update credential", error));
  };

  const handleDeleteCredential = (id: string) => {
    if (!user || !userData) return;
    const updatedCredentials = (userData.credentials || []).filter((c) => c.id !== id);
    set(ref(db, `users/${user.uid}/credentials`), updatedCredentials)
      .catch((error) => console.error("Failed to delete credential", error));
  };

  const handleAddDocument = async (file: File, name: string) => {
    if (!user || !masterPassword) return;

    try {
      // 1. Encrypt the file
      const { encryptedBlob, iv, randomKey } = await encryptFile(file);

      // 2. Encrypt the randomKey with the master password
      const encryptedKey = encrypt(randomKey, masterPassword);

      // 3. Upload the encrypted file to Firebase Storage
      const docId = crypto.randomUUID();
      const path = `user-documents/${user.uid}/${docId}`;
      const fileRef = storageRef(storage, path);
      await uploadBytes(fileRef, encryptedBlob);

      // 4. Create the document metadata
      const newDocument: SecureDocument = {
          id: docId,
          name: name || file.name,
          type: file.type,
          storagePath: path,
          encryptedKey: encryptedKey,
          iv: iv,
          size: file.size,
          createdAt: new Date().toISOString(),
      };

      // 5. Add the metadata to the Realtime Database
      const documents = userData?.documents || [];
      const updatedDocuments = [...documents, newDocument];
      await set(ref(db, `users/${user.uid}/documents`), updatedDocuments);
      toast({ title: "Success", description: "Document securely uploaded." });
    } catch (error) {
        console.error("Error uploading document:", error);
        toast({ variant: 'destructive', title: "Upload Failed", description: "Could not securely upload the document." });
        throw error;
    }
  }
  
  const handleDeleteDocument = async (id: string) => {
    if (!user || !userData?.documents) return;
    
    const docToDelete = userData.documents.find(d => d.id === id);
    if (!docToDelete) return;
    
    try {
        // Delete file from storage
        const fileRef = storageRef(storage, docToDelete.storagePath);
        await deleteObject(fileRef);

        // Delete metadata from RTDB
        const updatedDocs = userData.documents.filter(d => d.id !== id);
        await set(ref(db, `users/${user.uid}/documents`), updatedDocs);
        toast({ title: "Success", description: "Document deleted." });
    } catch (error) {
        console.error("Error deleting document:", error);
        toast({ variant: 'destructive', title: "Delete Failed", description: "Could not delete the document." });
    }
  }


  const handleLock = () => {
    setMasterPassword("");
    setIsUnlocked(false);
    setAuthError(undefined);
  };

  if (!isMounted || loading) {
    return <div className="flex items-center justify-center h-screen w-full"><LoadingDisplay /></div>;
  }

  if (!user) {
    return <SignInPage />;
  }

  if (!userData?.masterPasswordCheck) {
    return <div className="flex items-center justify-center h-screen w-full p-4"><CreateMasterPasswordForm onSubmit={handleCreateMasterPassword} error={authError} /></div>;
  }
  
  if (!isUnlocked) {
    return (
      <div className="flex items-center justify-center h-screen w-full p-4">
        <MasterPasswordForm
          isInitialSetup={false}
          onUnlock={handleUnlock}
          onSwitchMode={() => auth.signOut()}
          error={authError}
        />
      </div>
    );
  }

  return (
    <DashboardLayout
        user={user}
        onLock={handleLock}
        activeView={activeView}
        onNavigate={setActiveView}
    >
      <PasswordManager
          credentials={userData?.credentials || []}
          documents={userData?.documents || []}
          masterPassword={masterPassword}
          onAddCredential={handleAddCredential}
          onUpdateCredential={handleUpdateCredential}
          onDeleteCredential={handleDeleteCredential}
          activeView={activeView}
          onAddDocument={handleAddDocument}
          onDeleteDocument={handleDeleteDocument}
      />
    </DashboardLayout>
  );
}
