
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { decrypt } from "@/lib/encryption";
import type { SecureDocument } from "@/lib/types";
import { Download, FileText, Trash2, Calendar, HardDrive } from "lucide-react";
import { auth, storage } from "@/lib/firebase";
import { ref as storageRef, getBlob } from "firebase/storage";
import CryptoJS from "crypto-js";

type DocumentListProps = {
  documents: SecureDocument[];
  masterPassword: string;
  onDeleteDocument: (id: string) => void;
};

// Function to decrypt a file
async function decryptFile(encryptedBlob: Blob, encryptedKey: string, iv: string, masterKey: string): Promise<Blob> {
    const randomKey = decrypt(encryptedKey, masterKey);
    const encryptedData = await encryptedBlob.text();

    const decrypted = CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Hex.parse(randomKey), {
        iv: CryptoJS.enc.Hex.parse(iv),
    });

    const typedArray = new Uint8Array(decrypted.words.length * 4);
    for (let i = 0; i < decrypted.words.length; i++) {
        typedArray[i*4] = (decrypted.words[i] >> 24) & 0xff;
        typedArray[i*4+1] = (decrypted.words[i] >> 16) & 0xff;
        typedArray[i*4+2] = (decrypted.words[i] >> 8) & 0xff;
        typedArray[i*4+3] = decrypted.words[i] & 0xff;
    }

    const finalTypedArray = typedArray.slice(0, decrypted.sigBytes);
    return new Blob([finalTypedArray]);
}


export function DocumentList({
  documents,
  masterPassword,
  onDeleteDocument,
}: DocumentListProps) {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const handleDownload = async (doc: SecureDocument) => {
    setIsDownloading(doc.id);
    try {
        // 1. Get encrypted file from storage
        const fileRef = storageRef(storage, doc.storagePath);
        const encryptedBlob = await getBlob(fileRef);

        // 2. Decrypt the file
        const decryptedBlob = await decryptFile(encryptedBlob, doc.encryptedKey, doc.iv, masterPassword);

        // 3. Trigger download
        const url = window.URL.createObjectURL(decryptedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();

        toast({ title: "Success", description: "Document decrypted and downloaded." });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Download Error",
        description: "Failed to download document. Master password may be incorrect.",
      });
    } finally {
        setIsDownloading(null);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center text-muted-foreground mt-16 flex flex-col items-center gap-4">
        <FileText className="w-16 h-16" />
        <h3 className="text-xl font-semibold">No secure documents yet.</h3>
        <p>Click "Add New Document" to upload and encrypt a file.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {documents.map((doc) => {
        return (
          <Card key={doc.id} className="flex flex-col transition-all hover:shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="truncate text-lg font-semibold" title={doc.name}>{doc.name}</span>
              </div>
               <CardDescription className="truncate text-xs">{doc.type}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4 flex flex-col justify-between">
                <div className="space-y-2 text-sm text-muted-foreground">
                     <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4"/>
                        <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4"/>
                        <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                     </div>
                </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  className="w-full"
                  onClick={() => handleDownload(doc)}
                  disabled={isDownloading === doc.id}
                >
                  <Download />
                  {isDownloading === doc.id ? "Downloading..." : "Download"}
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" aria-label="Delete document">
                        <Trash2 className="text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this document from your vault.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDeleteDocument(doc.id)} className="bg-destructive hover:bg-destructive/90">
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
