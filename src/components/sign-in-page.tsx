
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { auth, db } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { ShieldCheck, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import Image from "next/image";

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
     <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C41.38,36.315,44,30.63,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
  );
}

const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string().optional(),
}).refine((data) => {
    if (data.confirmPassword !== undefined) {
        return data.password === data.confirmPassword;
    }
    return true;
}, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});


export function SignInPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        return;
      }
      toast({ variant: 'destructive', title: 'Sign-in Error', description: error.message });
      console.error("Error signing in with Google: ", error);
    }
  };

  const handleEmailAuth = async (values: z.infer<typeof formSchema>) => {
    try {
        if (mode === 'signup') {
            if (values.password !== values.confirmPassword) {
                form.setError("confirmPassword", { type: "manual", message: "Passwords don't match" });
                return;
            }
            await createUserWithEmailAndPassword(auth, values.email, values.password);
        } else {
            await signInWithEmailAndPassword(auth, values.email, values.password);
        }
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Authentication Error', description: error.message });
        console.error(`Error with ${mode}:`, error);
    }
  };

  const { isSubmitting } = form.formState;

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="relative hidden lg:block bg-muted p-8">
        <div className="relative h-full w-full bg-slate-900 text-primary-foreground flex flex-col items-center justify-center overflow-hidden rounded-xl">
             <Image 
                src="https://picsum.photos/1200/1800"
                alt="Abstract security background"
                data-ai-hint="security abstract"
                fill
                className="object-cover opacity-20"
            />
            <div className="relative z-20 text-center space-y-6 transition-all duration-1000 animate-in fade-in-50">
                <ShieldCheck className="mx-auto h-20 w-20" />
                <h1 className="text-4xl font-bold">Unlock intelligent security. Your vault is protected with client-side encryption and enhanced with AI-powered insights.</h1>
                <p className="text-lg text-primary-foreground/90 max-w-md mx-auto mt-2">
                    SafePass offers unparalleled security with client-side encryption. Your data is yours alone—impenetrable, synced, and always at your fingertips.
                </p>
                <div className="hidden lg:block">
                    <Button asChild variant="link" className="text-primary-foreground/80 hover:text-primary-foreground text-md">
                        <Link href="/documentation">
                            <BookOpen />
                            View Capstone Documentation
                        </Link>
                    </Button>
                </div>
            </div>
            <p className="absolute bottom-4 text-xs z-10">© 2025 SafePass - A Capstone Project by George K. Maina</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12 flex-col">
        <Card className="w-full max-w-md shadow-2xl border-none sm:border animate-in fade-in-50 duration-500">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">
                {mode === 'signin' ? "Welcome Back" : "Create your Account"}
            </CardTitle>
            <CardDescription>
              Enter your credentials to {mode === 'signin' ? 'access your vault' : 'get started'}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEmailAuth)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
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
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {mode === 'signup' && (
                    <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Processing..." : (mode === 'signin' ? 'Sign In' : 'Create Account')}
                </Button>
            </form>
        </Form>

        <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
        </div>

            <Button onClick={handleGoogleSignIn} className="w-full" variant="outline" type="button">
              <GoogleIcon />
              {mode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
            </Button>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button variant="link" onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                form.reset();
            }}>
                {mode === 'signin' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </Button>
          </CardFooter>
        </Card>
        <div className="mt-6 block lg:hidden">
            <Button asChild variant="link" className="text-muted-foreground">
                <Link href="/documentation">
                    <BookOpen />
                    View Capstone Documentation
                </Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
