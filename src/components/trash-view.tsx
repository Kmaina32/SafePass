
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { decrypt } from "@/lib/encryption";
import type { Credential, SecureDocument, PaymentCard, SecureNote, Identity } from "@/lib/types";
import { FileText, KeyRound, RotateCcw, Trash2, CreditCard, StickyNote, User } from "lucide-react";
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
import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";

type TrashedItem = (Credential | SecureDocument | PaymentCard | SecureNote | Identity) & { itemType: 'credential' | 'document' | 'paymentCard' | 'note' | 'identity', deletedAt: string };

type TrashViewProps = {
    items: TrashedItem[];
    masterPassword: string;
    onRestoreItem: (item: TrashedItem, itemType: TrashedItem['itemType']) => void;
    onPermanentlyDeleteItem: (id: string, itemType: TrashedItem['itemType']) => void;
};


const ItemIcon = ({ itemType }: { itemType: TrashedItem['itemType'] }) => {
    switch (itemType) {
        case 'credential': return <KeyRound className="h-6 w-6 text-primary" />;
        case 'document': return <FileText className="h-6 w-6 text-primary" />;
        case 'paymentCard': return <CreditCard className="h-6 w-6 text-primary" />;
        case 'note': return <StickyNote className="h-6 w-6 text-primary" />;
        case 'identity': return <User className="h-6 w-6 text-primary" />;
        default: return null;
    }
}

const getItemTitle = (item: TrashedItem, masterPassword: string) => {
    try {
        switch (item.itemType) {
            case 'credential': return item.url;
            case 'document': return item.name;
            case 'paymentCard': return `${item.cardType} ending in ${decrypt(item.cardNumber_encrypted, masterPassword).slice(-4)}`;
            case 'note': return decrypt(item.title_encrypted, masterPassword);
            case 'identity': return item.title;
            default: return 'Unknown Item';
        }
    } catch(e) {
        return "Decryption failed";
    }
}


export function TrashView({ items, masterPassword, onRestoreItem, onPermanentlyDeleteItem }: TrashViewProps) {
    
    const sortedItems = useMemo(() => {
        return items.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
    }, [items]);
    
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Trash</h1>
                <p className="text-muted-foreground">
                    Items in the trash will be permanently deleted after 30 days.
                </p>
            </div>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sortedItems.map(item => (
                    <Card key={`${item.itemType}-${item.id}`} className="flex flex-col">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <ItemIcon itemType={item.itemType} />
                                <div className="min-w-0">
                                    <CardTitle className="truncate">{getItemTitle(item, masterPassword)}</CardTitle>
                                    <CardDescription>
                                        Deleted {formatDistanceToNow(new Date(item.deletedAt), { addSuffix: true })}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow flex items-end">
                             <div className="flex w-full gap-2 pt-4 border-t">
                                <Button className="flex-1" variant="outline" onClick={() => onRestoreItem(item, item.itemType)}>
                                    <RotateCcw /> Restore
                                </Button>
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button className="flex-1" variant="destructive">
                                            <Trash2 /> Delete Forever
                                        </Button>
                                    </AlertDialogTrigger>
                                     <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete this item from your vault and it cannot be recovered.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => onPermanentlyDeleteItem(item.id, item.itemType)} className="bg-destructive hover:bg-destructive/90">
                                            Delete Permanently
                                        </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </CardContent>
                    </Card>
                ))}
             </div>
        </div>
    )
}
