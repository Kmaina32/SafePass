
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
import { PlusCircle, User, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { Identity } from "@/lib/types";

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  // Name
  firstName_encrypted: z.string().optional(),
  middleName_encrypted: z.string().optional(),
  lastName_encrypted: z.string().optional(),
  // Contact
  email_encrypted: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
  phone_encrypted: z.string().optional(),
  website_encrypted: z.string().url({ message: "Invalid URL." }).optional().or(z.literal('')),
  // Address
  address1_encrypted: z.string().optional(),
  address2_encrypted: z.string().optional(),
  city_encrypted: z.string().optional(),
  state_encrypted: z.string().optional(),
  zip_encrypted: z.string().optional(),
  country_encrypted: z.string().optional(),
  notes: z.string().optional(),
});

type AddIdentityDialogProps = {
  onAddIdentity: (values: Omit<Identity, 'id'>) => void;
};

export function AddIdentityDialog({ onAddIdentity }: AddIdentityDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      firstName_encrypted: "",
      middleName_encrypted: "",
      lastName_encrypted: "",
      email_encrypted: "",
      phone_encrypted: "",
      website_encrypted: "",
      address1_encrypted: "",
      address2_encrypted: "",
      city_encrypted: "",
      state_encrypted: "",
      zip_encrypted: "",
      country_encrypted: "",
      notes: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddIdentity(values);
    form.reset();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle />
          Add New Identity
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Identity</DialogTitle>
          <DialogDescription>
            Securely save personal information like name, address, and contact details.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identity Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Personal, Work" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Name Section */}
            <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-medium flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Name</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="firstName_encrypted" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="middleName_encrypted" render={({ field }) => (<FormItem><FormLabel>Middle</FormLabel><FormControl><Input placeholder="M" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="lastName_encrypted" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
            </div>
            
            {/* Contact Section */}
            <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-medium flex items-center gap-2"><Phone className="h-5 w-5 text-primary" /> Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="email_encrypted" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="john.doe@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="phone_encrypted" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="(123) 456-7890" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <FormField control={form.control} name="website_encrypted" render={({ field }) => (<FormItem><FormLabel>Website</FormLabel><FormControl><Input placeholder="https://example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>

            {/* Address Section */}
             <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-medium flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Address</h3>
                <FormField control={form.control} name="address1_encrypted" render={({ field }) => (<FormItem><FormLabel>Address Line 1</FormLabel><FormControl><Input placeholder="123 Main St" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="address2_encrypted" render={({ field }) => (<FormItem><FormLabel>Address Line 2</FormLabel><FormControl><Input placeholder="Apt 4B" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="city_encrypted" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Anytown" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="state_encrypted" render={({ field }) => (<FormItem><FormLabel>State / Province</FormLabel><FormControl><Input placeholder="CA" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="zip_encrypted" render={({ field }) => (<FormItem><FormLabel>Zip / Postal Code</FormLabel><FormControl><Input placeholder="12345" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <FormField control={form.control} name="country_encrypted" render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><FormControl><Input placeholder="United States" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save Identity</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
