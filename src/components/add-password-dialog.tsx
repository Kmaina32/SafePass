
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
import { PlusCircle, Sparkles, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { analyzePassword } from "@/ai/flows/password-strength-flow";
import { type PasswordAnalysis } from "@/ai/lib/types";
import { generatePassword } from "@/lib/password-generator";
import { useDebounce } from "@/hooks/use-debounce";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "./ui/textarea";

const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
  username: z.string().min(1, { message: "Username cannot be empty." }),
  password: z.string().min(1, { message: "Password cannot be empty." }),
  category: z.string().optional(),
  notes: z.string().optional(),
});

type AddPasswordDialogProps = {
  onAddCredential: (values: z.infer<typeof formSchema>) => void;
};

export function AddPasswordDialog({ onAddCredential }: AddPasswordDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      username: "",
      password: "",
      category: "",
      notes: "",
    },
  });

  const passwordValue = form.watch("password");
  const debouncedPassword = useDebounce(passwordValue, 500);

  useEffect(() => {
    if (debouncedPassword) {
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
    onAddCredential(values);
    form.reset();
    setAnalysis(null);
    setIsOpen(false);
  }

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    form.setValue("password", newPassword, { shouldValidate: true });
  };
  
  const getStrengthColor = () => {
    if (!analysis) return "bg-muted";
    switch (analysis.strength) {
        case "Weak": return "bg-red-500";
        case "Medium": return "bg-yellow-500";
        case "Strong": return "bg-green-500";
        default: return "bg-muted";
    }
  }

  const strengthValue = analysis ? (analysis.score || 0) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle />
          Add New Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Password</DialogTitle>
          <DialogDescription>
            Enter the details for the new password you want to save.
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
              <Button type="submit">Save Password</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
