"use client";

import { AddPasswordDialog } from "@/components/add-password-dialog";
import { PasswordList } from "@/components/password-list";
import { Button } from "@/components/ui/button";
import type { Credential } from "@/lib/types";
import { Lock } from "lucide-react";
import type { z } from "zod";

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
  return (
    <div className="w-full max-w-7xl">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-primary">SafePass Vault</h1>
        <div className="flex gap-4 items-center">
            <AddPasswordDialog onAddCredential={onAddCredential} />
            <Button variant="outline" onClick={onLock}>
              <Lock />
              Lock Vault
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
