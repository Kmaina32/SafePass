
"use client";

import { AddPasswordDialog } from "@/components/add-password-dialog";
import { PasswordList } from "@/components/password-list";
import { Button } from "@/components/ui/button";
import type { Credential } from "@/lib/types";
import { Lock, LogOut, Search } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Input } from "./ui/input";
import { useState, useMemo } from "react";

type NewCredential = {
    url: string;
    username: string;
    password: string;
    category?: string;
    notes?: string;
}

type UpdateCredential = NewCredential & { id: string };

type PasswordManagerProps = {
  credentials: Credential[];
  masterPassword: string;
  onAddCredential: (values: NewCredential) => void;
  onUpdateCredential: (values: UpdateCredential) => void;
  onDeleteCredential: (id: string) => void;
  onLock: () => void;
};

export function PasswordManager({
  credentials,
  masterPassword,
  onAddCredential,
  onUpdateCredential,
  onDeleteCredential,
  onLock,
}: PasswordManagerProps) {
  const [user] = useAuthState(auth);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCredentials = useMemo(() => {
    if (!searchQuery) {
      return credentials;
    }
    return credentials.filter(
      (c) =>
        c.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [credentials, searchQuery]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="flex flex-wrap justify-between items-center gap-4 py-6 border-b mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">SafePass Vault</h1>
        <div className="flex-grow flex justify-center items-center gap-4 px-4">
            <div className="relative w-full max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search vault..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>
        <div className="flex gap-2 sm:gap-4 items-center">
            {user?.photoURL && <img src={user.photoURL} alt="User" className="h-10 w-10 rounded-full" />}
            <AddPasswordDialog onAddCredential={onAddCredential} />
            <Button variant="outline" onClick={onLock}>
              <Lock />
              Lock Vault
            </Button>
            <Button variant="ghost" size="icon" onClick={() => auth.signOut()} aria-label="Sign out">
              <LogOut />
            </Button>
        </div>
      </header>
      <main>
        <PasswordList
          credentials={filteredCredentials}
          masterPassword={masterPassword}
          onUpdateCredential={onUpdateCredential}
          onDeleteCredential={onDeleteCredential}
        />
      </main>
    </div>
  );
}
