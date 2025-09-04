
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { ShieldCheck, Lock, KeyRound, Cloud } from "lucide-react";

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

export function SignInPage() {
    
  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
            <ShieldCheck className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold">Welcome to SafePass</CardTitle>
        <CardDescription>
          Your secure and simple password manager.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-primary"/>
                <span>Securely store all your passwords in one place.</span>
            </li>
            <li className="flex items-center gap-3">
                <KeyRound className="h-5 w-5 text-primary"/>
                <span>Client-side encryption ensures only you can access your data.</span>
            </li>
             <li className="flex items-center gap-3">
                <Cloud className="h-5 w-5 text-primary"/>
                <span>Sync your passwords across all your devices seamlessly.</span>
            </li>
        </ul>
        <Button onClick={handleSignIn} className="w-full">
            <GoogleIcon />
            Sign in with Google
        </Button>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-center text-muted-foreground w-full">
            Signing in with Google will create an account for you if you're a new user.
        </p>
      </CardFooter>
    </Card>
  );
}
