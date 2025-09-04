
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
import { useToast } from "@/hooks/use-toast";
import { decrypt } from "@/lib/encryption";
import type { PaymentCard } from "@/lib/types";
import { Copy, Eye, EyeOff, Trash2, User, Info, CreditCard } from "lucide-react";
import { EditPaymentCardDialog } from "./edit-payment-card-dialog";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

type PaymentCardListProps = {
  paymentCards: PaymentCard[];
  masterPassword: string;
  onUpdatePaymentCard: (values: PaymentCard) => void;
  onDeletePaymentCard: (id: string) => void;
};

// Simple helper to get a logo for the card type
function getCardLogo(cardType: PaymentCard['cardType']) {
    switch (cardType) {
        case 'visa': return <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6" />;
        case 'mastercard': return <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg" alt="Mastercard" className="h-6" />;
        case 'amex': return <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="American Express" className="h-8" />;
        case 'discover': return <img src="https://upload.wikimedia.org/wikipedia/commons/5/57/Discover_Card_logo.svg" alt="Discover" className="h-5" />;
        default: return <CreditCard className="h-6 w-6 text-muted-foreground" />;
    }
}

function formatCardNumber(cardNumber: string) {
    return cardNumber.replace(/(\d{4})/g, '$1 ').trim();
}

export function PaymentCardList({
  paymentCards,
  masterPassword,
  onUpdatePaymentCard,
  onDeletePaymentCard,
}: PaymentCardListProps) {
  const { toast } = useToast();
  const [visibleCardId, setVisibleCardId] = useState<string | null>(null);

  const handleCopy = async (value: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({
        title: "Success",
        description: `${fieldName} copied to clipboard.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to copy ${fieldName}.`,
      });
    }
  };

  const toggleCardVisibility = (id: string) => {
    setVisibleCardId(visibleCardId === id ? null : id);
  };
  
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {paymentCards.map((card) => {
        const isVisible = visibleCardId === card.id;
        let decryptedCardNumber = "", decryptedExpiry = "", decryptedCvv = "";

        try {
            decryptedCardNumber = decrypt(card.cardNumber_encrypted, masterPassword);
            decryptedExpiry = decrypt(card.expiryDate_encrypted, masterPassword);
            decryptedCvv = decrypt(card.cvv_encrypted, masterPassword);
        } catch (e) {
            console.error("Failed to decrypt card details.");
            // Render placeholders or an error state
            return (
                <Card key={card.id} className="border-destructive">
                    <CardHeader>
                        <CardTitle>Decryption Failed</CardTitle>
                        <CardDescription>Could not read card details. The master password may have changed or data is corrupt.</CardDescription>
                    </CardHeader>
                </Card>
            )
        }

        const lastFour = decryptedCardNumber.slice(-4);

        return (
          <Card key={card.id} className="flex flex-col transition-all hover:shadow-lg bg-gradient-to-br from-card to-muted/20">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <span className="font-mono text-sm tracking-wider">•••• {lastFour}</span>
                {getCardLogo(card.cardType)}
              </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4 flex flex-col">
                <div className="flex-grow space-y-3 font-mono">
                    <div className="text-lg tracking-widest text-center my-4">
                        {isVisible ? formatCardNumber(decryptedCardNumber) : `•••• •••• •••• ${lastFour}`}
                    </div>
                     <div className="flex justify-between text-sm">
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Card Holder</span>
                            <span className="font-medium truncate">{card.cardholderName}</span>
                        </div>
                         <div className="flex flex-col text-right">
                            <span className="text-xs text-muted-foreground">Expires</span>
                            <span className="font-medium">{isVisible ? decryptedExpiry : "••/••"}</span>
                        </div>
                     </div>
                </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button className="flex-1" variant="secondary" size="sm" onClick={() => toggleCardVisibility(card.id)}>
                    {isVisible ? <EyeOff /> : <Eye />}
                    {isVisible ? 'Hide' : 'Show'} Details
                </Button>
                <Button className="flex-1" size="sm" onClick={() => handleCopy(decryptedCardNumber, "Card Number")}>
                  <Copy />
                  Copy Number
                </Button>
              </div>

               {isVisible && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                     <div className="font-mono p-2 rounded-md bg-muted/50 flex justify-between items-center">
                        <span>CVV: <b>{decryptedCvv}</b></span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(decryptedCvv, "CVV")}> <Copy className="h-4 w-4" /> </Button>
                     </div>
                      <div className="font-mono p-2 rounded-md bg-muted/50 flex justify-between items-center">
                        <span>EXP: <b>{decryptedExpiry}</b></span>
                         <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(decryptedExpiry, "Expiry Date")}> <Copy className="h-4 w-4" /> </Button>
                     </div>
                  </div>
                )}
                
              {card.notes && (
                    <div className="flex items-start gap-3 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md border">
                    <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-primary"/>
                    <p className="text-xs break-words whitespace-pre-wrap flex-1">{card.notes}</p>
                    </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <EditPaymentCardDialog 
                    paymentCard={card}
                    masterPassword={masterPassword}
                    onUpdatePaymentCard={onUpdatePaymentCard}
                />
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" aria-label="Delete payment card" className="text-destructive">
                        <Trash2 />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this card from your vault.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDeletePaymentCard(card.id)} className="bg-destructive hover:bg-destructive/90">
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
