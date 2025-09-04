

"use client";

import { useState, useEffect } from "react";
import { MasterPasswordForm } from "@/components/master-password-form";
import { PasswordManager } from "@/components/password-manager";
import { useMounted } from "@/hooks/use-mounted";
import { encrypt, decrypt } from "@/lib/encryption";
import type { Credential, UserData, SecureDocument, PaymentCard, SecureNote, Identity } from "@/lib/types";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { ref, onValue, set, remove, update } from "firebase/database";
import { SignInPage } from "./sign-in-page";
import { CreateMasterPasswordForm } from "./create-master-password-form";
import { LoadingDisplay } from "./loading-display";
import { DashboardLayout, ActiveView } from "./dashboard-layout";
import { useToast } from "@/hooks/use-toast";
import CryptoJS from "crypto-js";
import { AdminDashboard } from "./admin-dashboard";

const CHECK_VALUE = "safepass_ok";
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;


// Function to encrypt a file
async function encryptFile(file: File): Promise<{ encryptedData: string, iv: string, randomKey: string }> {
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
        
        resolve({ encryptedData: encrypted, iv, randomKey });
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
  const [activeView, setActiveView] = useState<ActiveView>('passwords');

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

      // Update last seen timestamp and profile info
      const updates: Partial<UserData> = {
        lastSeen: new Date().toISOString(),
        profile: {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
        }
      };
      update(userRef, updates);


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
      paymentCards: [],
      secureNotes: [],
      identities: [],
      lastSeen: new Date().toISOString(),
       profile: {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
        }
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

    if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({
            variant: 'destructive',
            title: 'File Too Large',
            description: `Please select a file smaller than ${MAX_FILE_SIZE_MB} MB.`
        });
        throw new Error('File too large');
    }

    try {
      // 1. Encrypt the file
      const { encryptedData, iv, randomKey } = await encryptFile(file);

      // 2. Encrypt the randomKey with the master password
      const encryptedKey = encrypt(randomKey, masterPassword);

      // 3. Create the document metadata
      const newDocument: SecureDocument = {
          id: crypto.randomUUID(),
          name: name || file.name,
          type: file.type,
          data_encrypted: encryptedData,
          encryptedKey: encryptedKey,
          iv: iv,
          size: file.size,
          createdAt: new Date().toISOString(),
          isLocked: false,
      };

      // 4. Add the metadata to the Realtime Database
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
    
    try {
        const updatedDocs = userData.documents.filter(d => d.id !== id);
        const docRef = ref(db, `users/${user.uid}/documents`);
        
        if (updatedDocs.length > 0) {
             await set(docRef, updatedDocs);
        } else {
            await remove(docRef);
        }

        toast({ title: "Success", description: "Document deleted." });
    } catch (error) {
        console.error("Error deleting document:", error);
        toast({ variant: 'destructive', title: "Delete Failed", description: "Could not delete the document." });
    }
  }
  
  const handleToggleDocumentLock = async (id: string) => {
    if (!user || !userData?.documents) return;
    try {
        const updatedDocs = userData.documents.map(doc => {
            if (doc.id === id) {
                return { ...doc, isLocked: !doc.isLocked };
            }
            return doc;
        });
        await set(ref(db, `users/${user.uid}/documents`), updatedDocs);
        toast({ title: "Success", description: "Document state updated." });
    } catch (error) {
        console.error("Error toggling document lock:", error);
        toast({ variant: 'destructive', title: "Update Failed", description: "Could not update the document state." });
    }
  }

  const handleAddPaymentCard = (values: Omit<PaymentCard, 'id'>) => {
    if (!masterPassword || !user) return;

    const newCard: PaymentCard = {
        id: crypto.randomUUID(),
        ...values,
        cardNumber_encrypted: encrypt(values.cardNumber_encrypted, masterPassword),
        expiryDate_encrypted: encrypt(values.expiryDate_encrypted, masterPassword),
        cvv_encrypted: encrypt(values.cvv_encrypted, masterPassword),
    };
    
    const cards = userData?.paymentCards || [];
    const updatedCards = [...cards, newCard];

    set(ref(db, `users/${user.uid}/paymentCards`), updatedCards)
      .catch((error) => console.error("Failed to add payment card", error));
  }

  const handleUpdatePaymentCard = (values: PaymentCard) => {
    if (!masterPassword || !user || !userData?.paymentCards) return;

    const updatedCards = userData.paymentCards.map(card => {
      if (card.id === values.id) {
        return {
          ...values,
          cardNumber_encrypted: encrypt(values.cardNumber_encrypted, masterPassword),
          expiryDate_encrypted: encrypt(values.expiryDate_encrypted, masterPassword),
          cvv_encrypted: encrypt(values.cvv_encrypted, masterPassword),
        };
      }
      return card;
    });

    set(ref(db, `users/${user.uid}/paymentCards`), updatedCards)
      .catch((error) => console.error("Failed to update payment card", error));
  }
  
  const handleDeletePaymentCard = (id: string) => {
      if (!user || !userData?.paymentCards) return;
      const updatedCards = userData.paymentCards.filter((c) => c.id !== id);
      const cardRef = ref(db, `users/${user.uid}/paymentCards`);
      if (updatedCards.length > 0) {
        set(cardRef, updatedCards)
      } else {
        remove(cardRef);
      }
  }
  
  const handleAddSecureNote = (values: { title: string; content: string; category?: string }) => {
    if (!masterPassword || !user) return;
    const newNote: SecureNote = {
      id: crypto.randomUUID(),
      title_encrypted: encrypt(values.title, masterPassword),
      content_encrypted: encrypt(values.content, masterPassword),
      createdAt: new Date().toISOString(),
      category: values.category,
    };
    const notes = userData?.secureNotes || [];
    set(ref(db, `users/${user.uid}/secureNotes`), [...notes, newNote]);
  };

  const handleUpdateSecureNote = (values: { id: string; title: string; content: string; category?: string }) => {
    if (!masterPassword || !user || !userData?.secureNotes) return;
    const updatedNotes = userData.secureNotes.map(note =>
      note.id === values.id
        ? {
            ...note,
            title_encrypted: encrypt(values.title, masterPassword),
            content_encrypted: encrypt(values.content, masterPassword),
            category: values.category,
          }
        : note
    );
    set(ref(db, `users/${user.uid}/secureNotes`), updatedNotes);
  };
  
  const handleDeleteSecureNote = (id: string) => {
    if (!user || !userData?.secureNotes) return;
    const updatedNotes = userData.secureNotes.filter(note => note.id !== id);
    const noteRef = ref(db, `users/${user.uid}/secureNotes`);
    if (updatedNotes.length > 0) {
        set(noteRef, updatedNotes);
    } else {
        remove(noteRef);
    }
  };

  const handleAddIdentity = (values: Omit<Identity, 'id'>) => {
    if (!masterPassword || !user) return;
    const identities = userData?.identities || [];
    const newIdentity = { ...values, id: crypto.randomUUID() };

    // Encrypt all fields that need it
    for (const key in newIdentity) {
      if (key.endsWith('_encrypted')) {
        const value = (newIdentity as any)[key];
        if (value) {
            (newIdentity as any)[key] = encrypt(value, masterPassword);
        }
      }
    }
    set(ref(db, `users/${user.uid}/identities`), [...identities, newIdentity]);
  };
  
  const handleUpdateIdentity = (values: Identity) => {
    if (!masterPassword || !user || !userData?.identities) return;
    const updatedIdentities = userData.identities.map(identity => {
      if (identity.id === values.id) {
        const updatedIdentity = { ...values };
        for (const key in updatedIdentity) {
          if (key.endsWith('_encrypted')) {
            const value = (updatedIdentity as any)[key];
             if (value) {
                (updatedIdentity as any)[key] = encrypt(value, masterPassword);
            }
          }
        }
        return updatedIdentity;
      }
      return identity;
    });
    set(ref(db, `users/${user.uid}/identities`), updatedIdentities);
  };
  
  const handleDeleteIdentity = (id: string) => {
    if (!user || !userData?.identities) return;
    const updatedIdentities = userData.identities.filter(identity => identity.id !== id);
    const identityRef = ref(db, `users/${user.uid}/identities`);
     if (updatedIdentities.length > 0) {
        set(identityRef, updatedIdentities);
    } else {
        remove(identityRef);
    }
  };

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

  const renderContent = () => {
    if (activeView === 'admin') {
      return <AdminDashboard />;
    }
    return (
      <PasswordManager
          credentials={userData?.credentials || []}
          documents={userData?.documents || []}
          paymentCards={userData?.paymentCards || []}
          secureNotes={userData?.secureNotes || []}
          identities={userData?.identities || []}
          masterPassword={masterPassword}
          onAddCredential={handleAddCredential}
          onUpdateCredential={handleUpdateCredential}
          onDeleteCredential={handleDeleteCredential}
          activeView={activeView}
          onAddDocument={handleAddDocument}
          onDeleteDocument={handleDeleteDocument}
          onToggleDocumentLock={handleToggleDocumentLock}
          onAddPaymentCard={handleAddPaymentCard}
          onUpdatePaymentCard={handleUpdatePaymentCard}
          onDeletePaymentCard={handleDeletePaymentCard}
          onAddSecureNote={handleAddSecureNote}
          onUpdateSecureNote={handleUpdateSecureNote}
          onDeleteSecureNote={handleDeleteSecureNote}
          onAddIdentity={handleAddIdentity}
          onUpdateIdentity={handleUpdateIdentity}
          onDeleteIdentity={handleDeleteIdentity}
      />
    );
  }

  return (
    <DashboardLayout
        user={user}
        onLock={handleLock}
        activeView={activeView}
        onNavigate={setActiveView}
    >
      {renderContent()}
    </DashboardLayout>
  );
}
