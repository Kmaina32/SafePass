
"use client";

import { AddPasswordDialog } from "@/components/add-password-dialog";
import { PasswordList } from "@/components/password-list";
import { Button } from "@/components/ui/button";
import type { Credential } from "@/lib/types";
import { Lock, LogOut } from "lucide-react";
import type { z } from "zod";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";


type NewCredential = {
    url: string;
    username: string;
    password: string;
}

type PasswordManagerProps = {
  credentials: Credential[];
  masterPassword: string;
  onAddCredential: (values: NewCredential) => void;
  onDeleteCredential: (id: string) => void;
  onLock: () => void;
};

export function PasswordManager({
  credentials,
  masterPassword,
  onAddCredential,
  onDeleteCredential,
  onLock,
}: PasswordManagerProps) {
  const [user] = useAuthState(auth);

  return (
    <div className="w-full max-w-7xl">
      <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="text-4xl font-bold text-primary">SafePass Vault</h1>
        <div className="flex gap-4 items-center">
            {user?.photoURL && <img src={user.photoURL} alt="User" className="h-10 w-10 rounded-full" />}
            <AddPasswordDialog onAddCredential={onAddCredential} />
            <Button variant="outline" onClick={onLock}>
              <Lock />
              Lock Vault
            </Button>
            <Button variant="ghost" size="icon" onClick={() => auth.signOut()}>
              <LogOut />
            </Button>
        </div>
      </header>
      <main>
        <PasswordList
          credentials={credentials}
          masterPassword={masterPassword}
          onDeleteCredential={onDeleteCredential}
        />
      </main>
    </div>
  );
}
