
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
import { Download, FileText, Trash2, Calendar, HardDrive, Loader2, Lock, Unlock, FileDown, Sparkles, MessageSquare } from "lucide-react";
import CryptoJS from "crypto-js";
import jsPDF from "jspdf";
import { askDocument } from "@/ai/flows/document-qa-flow";
import { type DocumentQuestionAnswer } from "@/ai/lib/types";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

type DocumentListProps = {
  documents: SecureDocument[];
  masterPassword: string;
  onDeleteDocument: (id: string) => void;
  onToggleDocumentLock: (id: string) => void;
};

// Helper function to convert a WordArray to a Uint8Array
function wordToByteArray(wordArray: CryptoJS.lib.WordArray) {
    const l = wordArray.sigBytes;
    const words = wordArray.words;
    const result = new Uint8Array(l);
    var i=0 /*dst*/, j=0 /*src*/;
    while(true) {
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

// Function to decrypt a file from base64
function decryptFileFromB64(encryptedData: string, encryptedKey: string, iv: string, masterKey: string): { bytes: ArrayBuffer, b64: string } {
    const randomKey = decrypt(encryptedKey, masterKey);
    if (!randomKey) throw new Error("Failed to decrypt file key.");
    
    const decrypted = CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Hex.parse(randomKey), {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    const b64 = decrypted.toString(CryptoJS.enc.Base64);
    const bytes = wordToByteArray(decrypted);
    
    return { bytes, b64 };
}


export function DocumentList({
  documents,
  masterPassword,
  onDeleteDocument,
  onToggleDocumentLock
}: DocumentListProps) {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState<string | null>(null);
  const [aiAnswer, setAiAnswer] = useState<DocumentQuestionAnswer | null>(null);


  const handleDownload = async (doc: SecureDocument, asPdf: boolean = false) => {
    setIsDownloading(doc.id);
    try {
        const { bytes, b64 } = decryptFileFromB64(doc.data_encrypted, doc.encryptedKey, doc.iv, masterPassword);

        if (asPdf && doc.type.startsWith("image/")) {
            const pdf = new jsPDF();
            const imgData = `data:${doc.type};base64,${b64}`;
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${doc.name.split('.')[0] || 'document'}.pdf`);
        } else {
            const blob = new Blob([bytes], { type: doc.type });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        }

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

  const handleAskQuestion = async (doc: SecureDocument) => {
      if (!question) return;
      setIsAsking(doc.id);
      setAiAnswer(null);
      try {
        const { b64 } = decryptFileFromB64(doc.data_encrypted, doc.encryptedKey, doc.iv, masterPassword);
        const dataUri = `data:${doc.type};base64,${b64}`;

        const answer = await askDocument({ documentDataUri: dataUri, question });
        setAiAnswer(answer);

      } catch (err) {
          console.error(err);
          toast({ variant: "destructive", title: "AI Error", description: "Failed to analyze document." });
      } finally {
          setIsAsking(null);
      }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {documents.map((doc) => {
        const isImage = doc.type.startsWith("image/");

        return (
          <Card key={doc.id} className="flex flex-col transition-all hover:shadow-lg">
             <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-6 w-6 text-primary flex-shrink-0" />
                  <span className="truncate text-lg font-semibold" title={doc.name}>{doc.name}</span>
                </div>
                {doc.isLocked && <Lock className="h-5 w-5 text-destructive flex-shrink-0" />}
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
                
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <Input 
                            placeholder="Ask AI about this doc..."
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            disabled={isAsking === doc.id || doc.isLocked}
                        />
                        <Button 
                            variant="outline" size="icon"
                            onClick={() => handleAskQuestion(doc)}
                            disabled={isAsking === doc.id || doc.isLocked || !question}
                        >
                             {isAsking === doc.id ? <Loader2 className="animate-spin"/> : <Sparkles />}
                        </Button>
                    </div>
                     {aiAnswer && isAsking !== doc.id && (
                        <Alert>
                            <MessageSquare className="h-4 w-4" />
                            <AlertTitle>AI Answer</AlertTitle>
                            <AlertDescription>{aiAnswer.answer}</AlertDescription>
                        </Alert>
                    )}
                </div>

              <div className="flex flex-col gap-2 pt-4 border-t">
                <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleDownload(doc)}
                      disabled={isDownloading === doc.id || doc.isLocked}
                    >
                      {isDownloading === doc.id ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Download />
                      )}
                      Download
                    </Button>
                    {isImage && (
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={() => handleDownload(doc, true)}
                            disabled={isDownloading === doc.id || doc.isLocked}
                        >
                            <FileDown />
                            Save as PDF
                        </Button>
                    )}
                </div>
                 <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => onToggleDocumentLock(doc.id)}
                    >
                      {doc.isLocked ? <Unlock /> : <Lock />}
                      {doc.isLocked ? 'Unlock' : 'Lock'}
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
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
