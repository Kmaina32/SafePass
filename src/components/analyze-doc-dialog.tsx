
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast";
import { decryptFileFromB64 } from "./document-list";
import { SecureDocument } from "@/lib/types";
import { Sparkles, Loader2, MessageSquare } from "lucide-react";
import { askDocument } from "@/ai/flows/document-qa-flow";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Input } from "./ui/input";
import { Label } from "./ui/label";


type AnalyzeDocDialogProps = {
    documents: SecureDocument[];
    masterPassword: string;
}

export function AnalyzeDocDialog({ documents, masterPassword }: AnalyzeDocDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDocId, setSelectedDocId] = useState<string>("");
    const [question, setQuestion] = useState("");
    const [isAsking, setIsAsking] = useState(false);
    const [answer, setAnswer] = useState<string | null>(null);
    const { toast } = useToast();

    const handleAnalyze = async () => {
        if (!selectedDocId || !question) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please select a document and ask a question.' });
            return;
        }

        const doc = documents.find(d => d.id === selectedDocId);
        if (!doc) {
             toast({ variant: 'destructive', title: 'Error', description: 'Selected document not found.' });
            return;
        }

        setIsAsking(true);
        setAnswer(null);

        try {
            const { b64 } = decryptFileFromB64(doc.data_encrypted, doc.encryptedKey, doc.iv, masterPassword);
            const dataUri = `data:${doc.type};base64,${b64}`;

            const result = await askDocument({ documentDataUri: dataUri, question });
            setAnswer(result.answer);
            toast({ title: 'AI Analysis Complete' });

        } catch (err) {
            console.error(err);
            toast({ variant: "destructive", title: "AI Error", description: "Failed to analyze document." });
        } finally {
            setIsAsking(false);
        }
    }

    const availableDocs = documents.filter(d => !d.isLocked);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Sparkles />
                    Analyze Document with AI
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Analyze Document with AI</DialogTitle>
                    <DialogDescription>
                        Select a document and ask a question. The AI will provide an answer based on the document's content.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="doc-select">Select a Document</Label>
                        <Select onValueChange={setSelectedDocId} value={selectedDocId} disabled={availableDocs.length === 0}>
                            <SelectTrigger id="doc-select">
                                <SelectValue placeholder="Choose a document to analyze..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableDocs.length > 0 ? availableDocs.map(doc => (
                                    <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>
                                )) : <SelectItem value="no-docs" disabled>No unlocked documents available</SelectItem>}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="question">Your Question</Label>
                        <Input
                            id="question"
                            placeholder="e.g., What is the account number?"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            disabled={!selectedDocId}
                        />
                    </div>
                </div>

                {answer && !isAsking && (
                    <Alert>
                        <MessageSquare className="h-4 w-4" />
                        <AlertTitle>AI Answer</AlertTitle>
                        <AlertDescription>{answer}</AlertDescription>
                    </Alert>
                )}

                <DialogFooter>
                    <Button onClick={handleAnalyze} disabled={isAsking || !question || !selectedDocId}>
                        {isAsking ? (
                            <>
                                <Loader2 className="animate-spin" />
                                Analyzing...
                            </>
                        ) : "Ask AI"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

}
