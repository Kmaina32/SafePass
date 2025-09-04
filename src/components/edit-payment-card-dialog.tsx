
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
import { PaymentCard } from "@/lib/types";
import { decrypt } from "@/lib/encryption";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";


const formSchema = z.object({
  id: z.string(),
  cardholderName: z.string().min(1, { message: "Cardholder name is required." }),
  cardNumber_encrypted: z.string().regex(/^[0-9]{15,16}$/, { message: "Enter a valid 15 or 16-digit card number." }),
  expiryDate_encrypted: z.string().regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, { message: "Enter a valid MM/YY date." }),
  cvv_encrypted: z.string().regex(/^[0-9]{3,4}$/, { message: "Enter a valid 3 or 4-digit CVV." }),
  cardType: z.enum(['visa', 'mastercard', 'amex', 'discover', 'other']),
  notes: z.string().optional(),
});

type EditPaymentCardDialogProps = {
  paymentCard: PaymentCard;
  masterPassword: string;
  onUpdatePaymentCard: (values: PaymentCard) => void;
};

export function EditPaymentCardDialog({ paymentCard, masterPassword, onUpdatePaymentCard }: EditPaymentCardDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [decryptedValues, setDecryptedValues] = useState({
      cardNumber: "",
      expiryDate: "",
      cvv: "",
  });

  useEffect(() => {
    if (isOpen && paymentCard) {
      try {
        setDecryptedValues({
            cardNumber: decrypt(paymentCard.cardNumber_encrypted, masterPassword),
            expiryDate: decrypt(paymentCard.expiryDate_encrypted, masterPassword),
            cvv: decrypt(paymentCard.cvv_encrypted, masterPassword),
        })
      } catch (e) {
        console.error("Failed to decrypt card details for editing.");
        // Handle decryption failure gracefully
      }
    }
  }, [isOpen, paymentCard, masterPassword]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
        id: paymentCard.id,
        cardholderName: paymentCard.cardholderName,
        cardNumber_encrypted: decryptedValues.cardNumber,
        expiryDate_encrypted: decryptedValues.expiryDate,
        cvv_encrypted: decryptedValues.cvv,
        cardType: paymentCard.cardType,
        notes: paymentCard.notes || "",
    }
  });

  useEffect(() => {
    form.reset({
        id: paymentCard.id,
        cardholderName: paymentCard.cardholderName,
        cardNumber_encrypted: decryptedValues.cardNumber,
        expiryDate_encrypted: decryptedValues.expiryDate,
        cvv_encrypted: decryptedValues.cvv,
        cardType: paymentCard.cardType,
        notes: paymentCard.notes || "",
    })
  }, [paymentCard, decryptedValues, form])


  function onSubmit(values: z.infer<typeof formSchema>) {
    // We pass the unencrypted values to the update function,
    // it will handle re-encryption.
    onUpdatePaymentCard(values as PaymentCard);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Edit payment card">
            <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Payment Card</DialogTitle>
          <DialogDescription>
            Update the details for this card.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
              control={form.control}
              name="cardholderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cardholder Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John M. Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="cardNumber_encrypted"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Number</FormLabel>
                  <FormControl>
                    <Input placeholder="•••• •••• •••• ••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="expiryDate_encrypted"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                        <Input placeholder="MM/YY" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="cvv_encrypted"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>CVV</FormLabel>
                    <FormControl>
                        <Input placeholder="123" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <FormField
              control={form.control}
              name="cardType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a card type" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="visa">Visa</SelectItem>
                            <SelectItem value="mastercard">Mastercard</SelectItem>
                            <SelectItem value="amex">American Express</SelectItem>
                            <SelectItem value="discover">Discover</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
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
                    <Textarea placeholder="e.g., Billing address, contact number..." {...field} />
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
