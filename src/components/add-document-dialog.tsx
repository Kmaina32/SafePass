
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
import { PlusCircle, Upload, File as FileIcon } from "lucide-react";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, { message: "Document name cannot be empty." }),
  file: z.instanceof(File).refine(file => file.size > 0, { message: "Please select a file." }),
});

type AddDocumentDialogProps = {
  onAddDocument: (file: File, name: string) => Promise<void>;
};

export function AddDocumentDialog({ onAddDocument }: AddDocumentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      file: new File([], ""),
    },
  });

  const selectedFile = form.watch('file');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsUploading(true);
    try {
        await onAddDocument(values.file, values.name);
        form.reset();
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setIsOpen(false);
    } catch(e) {
        // Error toast is handled in the container
    } finally {
        setIsUploading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle />
          Add New Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Secure Document</DialogTitle>
          <DialogDescription>
            Upload a file to be encrypted and stored securely in your vault.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Passport Scan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>File</FormLabel>
                        <FormControl>
                             <Input 
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        field.onChange(e.target.files[0]);
                                    }
                                }}
                             />
                        </FormControl>
                         <FormMessage />
                         {selectedFile && selectedFile.size > 0 && (
                            <div className="text-sm text-muted-foreground flex items-center gap-2 pt-2">
                                <FileIcon className="w-4 h-4" />
                                <span>{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                            </div>
                         )}
                    </FormItem>
                )}
            />
            
            <DialogFooter>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? "Uploading..." : "Upload and Encrypt"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
