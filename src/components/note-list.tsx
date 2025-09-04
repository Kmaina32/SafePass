
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
import { Trash2, StickyNote, Eye, EyeOff, Calendar } from "lucide-react";
import { EditNoteDialog } from "./edit-note-dialog";
import { Badge } from "./ui/badge";

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

  const toggleVisibility = (id: string) => {
    setVisibleNoteId(visibleNoteId === id ? null : id);
  };
  
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

              <div className="flex gap-2 pt-4 border-t">
                <Button className="w-full" onClick={() => toggleVisibility(note.id)}>
                  {isVisible ? <EyeOff /> : <Eye />}
                  {isVisible ? "Hide Content" : "Show Content"}
                </Button>
                
                <EditNoteDialog 
                    note={note}
                    masterPassword={masterPassword}
                    onUpdateSecureNote={onUpdateSecureNote}
                />
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" aria-label="Delete note">
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
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
