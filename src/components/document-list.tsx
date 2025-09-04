
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
import { Download, FileText, Trash2, Calendar, HardDrive, Loader2 } from "lucide-react";
import { auth, storage } from "@/lib/firebase";
import { ref as storageRef, getBlob } from "firebase/storage";
import CryptoJS from "crypto-js";

type DocumentListProps = {
  documents: SecureDocument[];
  masterPassword: string;
  onDeleteDocument: (id: string) => void;
};

// Helper function to convert a WordArray to a Uint8Array
function wordToByteArray(wordArray: CryptoJS.lib.WordArray) {
    const l = wordArray.sigBytes;
    const words = wordArray.words;
    const result = new Uint8Array(l);
    var i=0 /*dst*/, j=0 /*src*/;
    while(true) {
        // here i is a multiple of 4
        if (i==l)
            break;
        var w = words[j++];
        result[i++] = (w & 0xff000000) >>> 24;
        if (i==l)
            break;
        result[i++] = (w & 0x00ff0000) >>> 16;
        if (i==l)
            break;
        result[i++] = (w & 0x0000ff00) >>> 8;
        if (i==l)
            break;
        result[i++] = (w & 0x000000ff);
    }
    return result;
}

// Function to decrypt a file
async function decryptFile(encryptedBlob: Blob, encryptedKey: string, iv: string, masterKey: string): Promise<Blob> {
    const randomKey = decrypt(encryptedKey, masterKey);
    if (!randomKey) throw new Error("Failed to decrypt file key.");
    
    const encryptedDataAsBase64 = await encryptedBlob.text();

    const decrypted = CryptoJS.AES.decrypt(encryptedDataAsBase64, CryptoJS.enc.Hex.parse(randomKey), {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    
    const decryptedBytes = wordToByteArray(decrypted);

    // Use the original file type stored in the document metadata
    const doc = (await (getBlob(storageRef(storage, 'dummy')) as any).type)
    return new Blob([decryptedBytes]);
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
        const url = window.URL.createObjectURL(new Blob([decryptedBlob], { type: doc.type }));
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
                  className="flex-1"
                  onClick={() => handleDownload(doc)}
                  disabled={isDownloading === doc.id}
                >
                  {isDownloading === doc.id ? (
                    <>
                      <Loader2 className="animate-spin" />
                       Downloading...
                    </>
                  ) : (
                    <>
                      <Download />
                      Download
                    </>
                  )}
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" aria-label="Delete document" className="flex-shrink-0">
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
