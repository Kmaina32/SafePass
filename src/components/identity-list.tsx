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
import type { Identity } from "@/lib/types";
import { Trash2, User, Eye, EyeOff, Info, Copy, Sparkles, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { EditIdentityDialog } from "./edit-identity-dialog";
import { useToast } from "@/hooks/use-toast";
import { checkIdentity } from "@/ai/flows/identity-check-flow";
import { type IdentityCheckResult } from "@/ai/lib/types";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";

type IdentityListProps = {
  identities: Identity[];
  masterPassword: string;
  onUpdateIdentity: (values: Identity) => void;
  onDeleteIdentity: (id: string) => void;
};

export function IdentityList({
  identities,
  masterPassword,
  onUpdateIdentity,
  onDeleteIdentity,
}: IdentityListProps) {
  const [visibleIdentityId, setVisibleIdentityId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState<string | null>(null);
  const [checkResult, setCheckResult] = useState<IdentityCheckResult | null>(null);
  const { toast } = useToast();

  const handleCopy = async (value: string, fieldName: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: "Success", description: `${fieldName} copied to clipboard.` });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: `Failed to copy ${fieldName}.` });
    }
  };

  const toggleVisibility = (id: string) => {
    setVisibleIdentityId(visibleIdentityId === id ? null : id);
    setCheckResult(null); // Clear previous results
  };

  const handleCheckIdentity = async (identity: Identity) => {
    setIsChecking(identity.id);
    setCheckResult(null);
    try {
        const decrypted: Partial<Identity> = {};
        for (const key in identity) {
            if (key.endsWith('_encrypted')) {
                const value = (identity as any)[key];
                if (value) {
                    decrypted[key as keyof Identity] = decrypt(value, masterPassword);
                }
            }
        }
        const result = await checkIdentity({ identityJson: JSON.stringify(decrypted) });
        setCheckResult(result);

    } catch (e) {
        console.error(e);
        toast({ variant: "destructive", title: "AI Error", description: "Failed to check identity health." });
    } finally {
        setIsChecking(null);
    }
  }
  
  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      {identities.map((identity) => {
        const isVisible = visibleIdentityId === identity.id;
        
        let decrypted: Partial<Identity> = {};
        try {
            for (const key in identity) {
                if (key.endsWith('_encrypted')) {
                    const value = (identity as any)[key];
                    if (value) {
                       decrypted[key as keyof Identity] = isVisible ? decrypt(value, masterPassword) : "••••••••";
                    }
                }
            }
        } catch (e) {
            return <Card key={identity.id} className="border-destructive p-4">Decryption Failed</Card>;
        }

        const fullName = [decrypted.firstName_encrypted, decrypted.middleName_encrypted, decrypted.lastName_encrypted].filter(Boolean).join(' ');
        const fullAddress = [decrypted.address1_encrypted, decrypted.address2_encrypted, decrypted.city_encrypted, decrypted.state_encrypted, decrypted.zip_encrypted, decrypted.country_encrypted].filter(Boolean).join(', ');

        return (
          <Card key={identity.id} className="flex flex-col transition-all hover:shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <User className="h-6 w-6 text-primary flex-shrink-0" />
                    <CardTitle className="text-lg truncate" title={identity.title}>{identity.title}</CardTitle>
                  </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4 flex flex-col">
                <div className="flex-grow space-y-3 text-sm">
                    {/* Render fields here */}
                    {fullName && <p><strong>Name:</strong> {fullName}</p>}
                    {decrypted.email_encrypted && <p><strong>Email:</strong> {decrypted.email_encrypted}</p>}
                    {decrypted.phone_encrypted && <p><strong>Phone:</strong> {decrypted.phone_encrypted}</p>}
                    {fullAddress && <p><strong>Address:</strong> {fullAddress}</p>}
                    {identity.notes && (
                         <div className="flex items-start gap-3 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md border mt-2">
                            <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-primary"/>
                            <p className="text-xs break-words whitespace-pre-wrap flex-1">{identity.notes}</p>
                         </div>
                    )}
                </div>

                {checkResult && isChecking !== identity.id && (
                    <div className="space-y-2 pt-2 border-t">
                        <h4 className="font-medium text-sm">AI Data Health Check: <span className="font-bold">{checkResult.overallHealth}</span></h4>
                        {checkResult.issues.length > 0 ? (
                            checkResult.issues.map((issue, index) => (
                                <Alert key={index} variant={checkResult.overallHealth === 'Poor' ? 'destructive' : 'default'}>
                                    <AlertTriangle className="h-4 w-4"/>
                                    <AlertTitle>{issue.field}</AlertTitle>
                                    <AlertDescription>{issue.issue} - <em>{issue.suggestion}</em></AlertDescription>
                                </Alert>
                            ))
                        ) : (
                            <Alert variant="default" className="border-green-500/50">
                                <CheckCircle className="h-4 w-4 text-green-500"/>
                                <AlertTitle>No Issues Found</AlertTitle>
                                <AlertDescription>The identity data appears to be complete and well-formatted.</AlertDescription>
                            </Alert>
                        )}
                    </div>
                )}

              <div className="flex flex-col gap-2 pt-4 border-t">
                <div className="flex gap-2">
                    <Button className="w-full" onClick={() => toggleVisibility(identity.id)}>
                        {isVisible ? <EyeOff /> : <Eye />}
                        {isVisible ? "Hide Details" : "Show Details"}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => handleCheckIdentity(identity)}
                        disabled={isChecking === identity.id}
                        className="w-full"
                    >
                        {isChecking === identity.id ? <Loader2 className="animate-spin" /> : <Sparkles />}
                        AI Check
                    </Button>
                </div>
                <div className="flex gap-2">
                    <EditIdentityDialog 
                        identity={identity}
                        masterPassword={masterPassword}
                        onUpdateIdentity={onUpdateIdentity}
                    />
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" aria-label="Delete identity" className="flex-1">
                            <Trash2 className="text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this identity.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDeleteIdentity(identity.id)} className="bg-destructive hover:bg-destructive/90">
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
