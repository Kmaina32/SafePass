
"use client";

import { AddPasswordDialog } from "@/components/add-password-dialog";
import { PasswordList } from "@/components/password-list";
import type { Credential } from "@/lib/types";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { useState, useMemo } from "react";
import { AddDocumentDialog } from "./add-document-dialog";
import type { SecureDocument } from "@/lib/types";
import { DocumentList } from "./document-list";

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
  documents: SecureDocument[];
  masterPassword: string;
  onAddCredential: (values: NewCredential) => void;
  onUpdateCredential: (values: UpdateCredential) => void;
  onDeleteCredential: (id: string) => void;
  activeView: 'passwords' | 'documents';
  onAddDocument: (file: File, name: string) => Promise<void>;
  onDeleteDocument: (id: string) => void;
  onToggleDocumentLock: (id: string) => void;
};

export function PasswordManager({
  credentials,
  documents,
  masterPassword,
  onAddCredential,
  onUpdateCredential,
  onDeleteCredential,
  activeView,
  onAddDocument,
  onDeleteDocument,
  onToggleDocumentLock,
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

  const filteredDocuments = useMemo(() => {
    if (!searchQuery) {
      return documents;
    }
    return documents.filter(
      (d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [documents, searchQuery]);

  return (
    <div className="flex flex-col h-full">
        <div className="flex items-center gap-4 py-4">
            <div className="relative w-full max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search vault..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="ml-auto flex gap-2 sm:gap-4 items-center">
                {activeView === 'passwords' ? (
                    <AddPasswordDialog onAddCredential={onAddCredential} />
                ) : (
                    <AddDocumentDialog onAddDocument={onAddDocument} />
                )}
            </div>
        </div>
        <div className="flex-grow pb-8">
            {activeView === 'passwords' ? (
                <PasswordList
                    credentials={filteredCredentials}
                    masterPassword={masterPassword}
                    onUpdateCredential={onUpdateCredential}
                    onDeleteCredential={onDeleteCredential}
                />
            ) : (
                <DocumentList
                    documents={filteredDocuments}
                    masterPassword={masterPassword}
                    onDeleteDocument={onDeleteDocument}
                    onToggleDocumentLock={onToggleDocumentLock}
                />
            )}
       </div>
    </div>
  );
}
