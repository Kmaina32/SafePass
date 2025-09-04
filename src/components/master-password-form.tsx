"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ShieldCheck } from "lucide-react";

const formSchema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

type MasterPasswordFormProps = {
  isInitialSetup: boolean;
  onUnlock: (password: string) => void;
  error?: string;
};

export function MasterPasswordForm({ isInitialSetup, onUnlock, error }: MasterPasswordFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onUnlock(values.password);
  }

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
            <ShieldCheck className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold">
          {isInitialSetup ? "Set Your Master Password" : "Welcome Back"}
        </CardTitle>
        <CardDescription>
          {isInitialSetup
            ? "Choose a strong master password. This password will encrypt all your data and is the only way to access it."
            : "Enter your master password to unlock your vault."}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Master Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              {isInitialSetup ? "Set Master Password" : "Unlock Vault"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
