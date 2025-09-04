
"use client";

import { AddPasswordDialog } from "@/components/add-password-dialog";
import { PasswordList } from "@/components/password-list";
import type { Credential } from "@/lib/types";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { useState, useMemo } from "react";
import { AddDocumentDialog } from "./add-document-dialog";

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
  activeView: 'passwords' | 'documents';
  onAddDocument: (file: File, name: string) => Promise<void>;
};

export function PasswordManager({
  credentials,
  masterPassword,
  onAddCredential,
  onUpdateCredential,
  onDeleteCredential,
  activeView,
  onAddDocument,
}: PasswordManagerProps) {
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
    <>
        <div className="flex-grow flex justify-center items-center gap-4 px-4 w-full">
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
            {activeView === 'passwords' ? (
                 <AddPasswordDialog onAddCredential={onAddCredential} />
            ) : (
                <AddDocumentDialog onAddDocument={onAddDocument} />
            )}
        </div>
        <main className="w-full mt-8">
            <PasswordList
            credentials={filteredCredentials}
            masterPassword={masterPassword}
            onUpdateCredential={onUpdateCredential}
            onDeleteCredential={onDeleteCredential}
            />
       </main>
    </>
  );
}
