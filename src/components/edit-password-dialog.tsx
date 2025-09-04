
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
import { Pencil, Sparkles, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { analyzePassword, PasswordAnalysis } from "@/ai/flows/password-strength-flow";
import { generatePassword } from "@/lib/password-generator";
import { useDebounce } from "@/hooks/use-debounce";
import { Progress } from "@/components/ui/progress";
import { Credential } from "@/lib/types";
import { decrypt } from "@/lib/encryption";
import { Textarea } from "./ui/textarea";

const formSchema = z.object({
  id: z.string(),
  url: z.string().url({ message: "Please enter a valid URL." }),
  username: z.string().min(1, { message: "Username cannot be empty." }),
  password: z.string().min(1, { message: "This field cannot be empty." }),
  category: z.string().optional(),
  notes: z.string().optional(),
});

type EditPasswordDialogProps = {
  credential: Credential;
  masterPassword: string;
  onUpdateCredential: (values: z.infer<typeof formSchema>) => void;
};

export function EditPasswordDialog({ credential, masterPassword, onUpdateCredential }: EditPasswordDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [decryptedPassword, setDecryptedPassword] = useState("");

  useEffect(() => {
    if (isOpen && credential) {
      try {
        const pass = decrypt(credential.password_encrypted, masterPassword);
        setDecryptedPassword(pass);
      } catch (e) {
        console.error("Failed to decrypt password for editing.");
        setDecryptedPassword("DECRYPTION_FAILED");
      }
    }
  }, [isOpen, credential, masterPassword]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      id: credential.id,
      url: credential.url,
      username: credential.username,
      password: decryptedPassword,
      category: credential.category || "",
      notes: credential.notes || "",
    }
  });

  useEffect(() => {
    form.reset({
        id: credential.id,
        url: credential.url,
        username: credential.username,
        password: decryptedPassword,
        category: credential.category || "",
        notes: credential.notes || "",
    })
  }, [credential, decryptedPassword, form])


  const passwordValue = form.watch("password");
  const debouncedPassword = useDebounce(passwordValue, 500);

  useEffect(() => {
    if (debouncedPassword && debouncedPassword !== "DECRYPTION_FAILED") {
      setIsAnalyzing(true);
      analyzePassword({ password: debouncedPassword })
        .then(setAnalysis)
        .catch(console.error)
        .finally(() => setIsAnalyzing(false));
    } else {
      setAnalysis(null);
    }
  }, [debouncedPassword]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    onUpdateCredential(values);
    setIsOpen(false);
    setAnalysis(null);
  }

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    form.setValue("password", newPassword, { shouldValidate: true });
  };
  
  const strengthValue = analysis ? (analysis.score || 0) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Edit password">
            <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Password</DialogTitle>
          <DialogDescription>
            Update the details for this password.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username or Email</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                   <div className="flex items-center gap-2">
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleGeneratePassword}
                      aria-label="Generate new password"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {(isAnalyzing || analysis) && (
              <div className="space-y-2 text-xs">
                <Progress value={strengthValue} className="h-2 [&>div]:bg-red-500" />
                 {isAnalyzing ? (
                    <p className="text-muted-foreground animate-pulse">Analyzing...</p>
                ) : analysis && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                        <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <p>
                            <span className="font-bold text-foreground">{analysis.strength}:</span> {analysis.feedback}
                        </p>
                    </div>
                )}
              </div>
            )}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Work, Social" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Security questions, recovery codes..." {...field} />
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
