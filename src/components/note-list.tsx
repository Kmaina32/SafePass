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
import { decrypt } from "@/lib/encryption";
import type { SecureNote } from "@/lib/types";
import { Trash2, StickyNote, Eye, EyeOff, Calendar, Sparkles, Loader2, MessageSquare, ListTodo } from "lucide-react";
import { EditNoteDialog } from "./edit-note-dialog";
import { Badge } from "./ui/badge";
import { analyzeNote } from "@/ai/flows/note-analysis-flow";
import { type NoteAnalysisResult } from "@/ai/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

type NoteListProps = {
  notes: SecureNote[];
  masterPassword: string;
  onUpdateSecureNote: (values: any) => void;
  onDeleteSecureNote: (id: string) => void;
};

export function NoteList({
  notes,
  masterPassword,
  onUpdateSecureNote,
  onDeleteSecureNote,
}: NoteListProps) {
  const [visibleNoteId, setVisibleNoteId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<NoteAnalysisResult | null>(null);
  const { toast } = useToast();


  const toggleVisibility = (id: string) => {
    setVisibleNoteId(visibleNoteId === id ? null : id);
    setAnalysisResult(null); // Clear previous results when hiding
  };

  const handleAnalyzeNote = async (note: SecureNote) => {
    setIsAnalyzing(note.id);
    setAnalysisResult(null);
    try {
        const content = decrypt(note.content_encrypted, masterPassword);
        const result = await analyzeNote({ noteContent: content });
        setAnalysisResult(result);
    } catch(e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'AI Error', description: 'Failed to analyze the note.'});
    } finally {
        setIsAnalyzing(null);
    }
  }
  
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => {
        const isVisible = visibleNoteId === note.id;
        let decryptedTitle = "", decryptedContent = "";
        try {
            decryptedTitle = decrypt(note.title_encrypted, masterPassword);
            if (isVisible) {
                decryptedContent = decrypt(note.content_encrypted, masterPassword);
            }
        } catch (e) {
            console.error("Failed to decrypt note");
            return <Card key={note.id} className="border-destructive p-4">Decryption Failed</Card>;
        }

        return (
          <Card key={note.id} className="flex flex-col transition-all hover:shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <StickyNote className="h-6 w-6 text-primary flex-shrink-0" />
                    <CardTitle className="text-lg truncate" title={decryptedTitle}>{decryptedTitle}</CardTitle>
                  </div>
                  {note.category && <Badge variant="secondary" className="flex-shrink-0">{note.category}</Badge>}
              </div>
               <CardDescription className="flex items-center gap-2 text-xs pt-2">
                <Calendar className="h-4 w-4" />
                <span>Created on {new Date(note.createdAt).toLocaleDateString()}</span>
               </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4 flex flex-col">
                <div className="flex-grow text-sm text-muted-foreground whitespace-pre-wrap p-4 bg-muted/50 rounded-md border min-h-[100px]">
                    {isVisible ? decryptedContent : "••••••••••••\n••••••••••••"}
                </div>
                
                {isAnalyzing === note.id && <Loader2 className="animate-spin mx-auto" />}

                {analysisResult && visibleNoteId === note.id && (
                    <div className="space-y-2 pt-2 border-t">
                        <Alert>
                           <MessageSquare className="h-4 w-4"/>
                           <AlertTitle>AI Summary</AlertTitle>
                           <AlertDescription>{analysisResult.summary}</AlertDescription>
                        </Alert>
                        {analysisResult.actionItems.length > 0 && (
                             <Alert>
                                <ListTodo className="h-4 w-4"/>
                                <AlertTitle>Action Items</AlertTitle>
                                <AlertDescription>
                                    <ul className="list-disc pl-5">
                                        {analysisResult.actionItems.map((item, index) => <li key={index}>{item}</li>)}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                )}


              <div className="flex flex-col gap-2 pt-4 border-t">
                <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => toggleVisibility(note.id)}>
                    {isVisible ? <EyeOff /> : <Eye />}
                    {isVisible ? "Hide Content" : "Show Content"}
                    </Button>
                    <Button 
                        variant="outline" className="flex-1"
                        onClick={() => handleAnalyzeNote(note)}
                        disabled={isAnalyzing === note.id || !isVisible}
                    >
                         {isAnalyzing === note.id ? <Loader2 className="animate-spin" /> : <Sparkles />}
                        Analyze
                    </Button>
                </div>
                <div className="flex gap-2">
                    <EditNoteDialog 
                        note={note}
                        masterPassword={masterPassword}
                        onUpdateSecureNote={onUpdateSecureNote}
                    />
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" aria-label="Delete note" className="flex-1">
                            <Trash2 className="text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this note from your vault.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDeleteSecureNote(note.id)} className="bg-destructive hover:bg-destructive/90">
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
