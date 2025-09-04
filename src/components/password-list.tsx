
"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { decrypt } from "@/lib/encryption";
import type { Credential } from "@/lib/types";
import { Copy, Eye, EyeOff, Globe, Trash2, User, KeyRound, Info } from "lucide-react";
import { EditPasswordDialog } from "./edit-password-dialog";
import { Badge } from "./ui/badge";

type PasswordListProps = {
  credentials: Credential[];
  masterPassword: string;
  onUpdateCredential: (values: any) => void;
  onDeleteCredential: (id: string) => void;
};

export function PasswordList({
  credentials,
  masterPassword,
  onUpdateCredential,
  onDeleteCredential,
}: PasswordListProps) {
  const { toast } = useToast();
  const [visiblePasswordId, setVisiblePasswordId] = useState<string | null>(null);

  const handleCopy = async (id: string) => {
    const credential = credentials.find((c) => c.id === id);
    if (!credential) return;

    try {
      const decryptedPassword = decrypt(credential.password_encrypted, masterPassword);
      await navigator.clipboard.writeText(decryptedPassword);
      toast({
        title: "Success",
        description: "Password copied to clipboard.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy password. Master password may be incorrect.",
      });
    }
  };

  const togglePasswordVisibility = (id: string) => {
    if (visiblePasswordId === id) {
      setVisiblePasswordId(null);
    } else {
      setVisiblePasswordId(id);
    }
  };

  if (credentials.length === 0) {
    return (
      <div className="text-center text-muted-foreground mt-16 flex flex-col items-center gap-4">
        <KeyRound className="w-16 h-16" />
        <h3 className="text-xl font-semibold">Your vault is empty.</h3>
        <p>Click "Add New Password" to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {credentials.map((credential) => {
        const isVisible = visiblePasswordId === credential.id;
        const decryptedPassword = isVisible
          ? decrypt(credential.password_encrypted, masterPassword)
          : "";

        return (
          <Card key={credential.id} className="flex flex-col transition-all hover:shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Globe className="h-6 w-6 text-primary flex-shrink-0" />
                    <CardTitle className="text-lg truncate" title={credential.url}>{credential.url}</CardTitle>
                  </div>
                  {credential.category && <Badge variant="secondary" className="flex-shrink-0">{credential.category}</Badge>}
              </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4 flex flex-col">
                <div className="flex-grow space-y-3">
                    <div className="flex items-center gap-3 text-sm min-w-0">
                        <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium truncate" title={credential.username}>{credential.username}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <KeyRound className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-mono text-muted-foreground flex-grow">
                            {isVisible ? decryptedPassword : "••••••••••••"}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={() => togglePasswordVisibility(credential.id)}
                            aria-label={isVisible ? "Hide password" : "Show password"}
                        >
                            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                    {credential.notes && (
                         <div className="flex items-start gap-3 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md border">
                            <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-primary"/>
                            <p className="text-xs break-words whitespace-pre-wrap flex-1">{credential.notes}</p>
                         </div>
                    )}
                </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  className="w-full"
                  onClick={() => handleCopy(credential.id)}
                >
                  <Copy />
                  Copy Password
                </Button>
                
                <EditPasswordDialog 
                    credential={credential}
                    masterPassword={masterPassword}
                    onUpdateCredential={onUpdateCredential}
                />
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" aria-label="Delete password">
                        <Trash2 className="text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this password from your vault.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDeleteCredential(credential.id)} className="bg-destructive hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
