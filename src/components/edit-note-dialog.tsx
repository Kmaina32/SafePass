
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { SecureNote } from "@/lib/types";
import { decrypt } from "@/lib/encryption";
import { Textarea } from "./ui/textarea";

const formSchema = z.object({
  id: z.string(),
  title: z.string().min(1, { message: "Title cannot be empty." }),
  content: z.string().min(1, { message: "Note content cannot be empty." }),
  category: z.string().optional(),
});

type EditNoteDialogProps = {
  note: SecureNote;
  masterPassword: string;
  onUpdateSecureNote: (values: z.infer<typeof formSchema>) => void;
};

export function EditNoteDialog({ note, masterPassword, onUpdateSecureNote }: EditNoteDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [decryptedNote, setDecryptedNote] = useState({ title: "", content: "" });

  useEffect(() => {
    if (isOpen) {
      try {
        const title = decrypt(note.title_encrypted, masterPassword);
        const content = decrypt(note.content_encrypted, masterPassword);
        setDecryptedNote({ title, content });
      } catch (e) {
        console.error("Failed to decrypt note for editing.");
      }
    }
  }, [isOpen, note, masterPassword]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      id: note.id,
      title: decryptedNote.title,
      content: decryptedNote.content,
      category: note.category || "",
    },
  });
  
  useEffect(() => {
      form.reset({
          id: note.id,
          title: decryptedNote.title,
          content: decryptedNote.content,
          category: note.category || "",
      });
  }, [note, decryptedNote, form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    onUpdateSecureNote(values);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Edit note">
            <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Secure Note</DialogTitle>
          <DialogDescription>
            Update your encrypted note.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Wi-Fi Passwords" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Your secure content here..." {...field} className="min-h-[150px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Personal, Work" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

