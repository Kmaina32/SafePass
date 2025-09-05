
"use client";

import { AddPasswordDialog } from "@/components/add-password-dialog";
import { PasswordList } from "@/components/password-list";
import type { Credential, PaymentCard, SecureDocument, SecureNote, Identity } from "@/lib/types";
import { Search, KeyRound, FileText, CreditCard, Shield, Settings, RotateCw, User, StickyNote, Trash2, LayoutGrid, BookOpen, ShieldQuestion, Sparkles } from "lucide-react";
import { Input } from "./ui/input";
import { useState, useMemo } from "react";
import { AddDocumentDialog } from "./add-document-dialog";
import { DocumentList } from "./document-list";
import { ActiveView } from "./dashboard-layout";
import { AddPaymentCardDialog } from "./add-payment-card-dialog";
import { PaymentCardList } from "./payment-card-list";
import { SecurityHealth } from "./security-health";
import { AddNoteDialog } from "./add-note-dialog";
import { NoteList } from "./note-list";
import { AddIdentityDialog } from "./add-identity-dialog";
import { IdentityList } from "./identity-list";
import { PasswordGeneratorView } from "./password-generator-view";
import { SettingsView } from "./settings-view";
import { AdminDashboard } from "./admin-dashboard";
import { Button } from "./ui/button";
import { AnalyzeDocDialog } from "./analyze-doc-dialog";
import { MainDashboard } from "./main-dashboard";
import { MediaPreviewDialog } from "./media-preview-dialog";
import { TrashView } from "./trash-view";

type NewCredential = Omit<Credential, 'id' | 'password_encrypted' | 'deletedAt'> & { password: string };
type UpdateCredential = NewCredential & { id: string };
type NewPaymentCard = Omit<PaymentCard, 'id' | 'deletedAt'>;
type NewSecureNote = Omit<SecureNote, 'id' | 'title_encrypted' | 'content_encrypted' | 'createdAt' | 'deletedAt'> & { title: string, content: string };
type UpdateSecureNote = NewSecureNote & { id: string };
type NewIdentity = Omit<Identity, 'id' | 'deletedAt'>;
type UpdateIdentity = Omit<Identity, 'deletedAt'>;
type TrashedItem = (Credential | SecureDocument | PaymentCard | SecureNote | Identity) & { itemType: 'credential' | 'document' | 'paymentCard' | 'note' | 'identity', deletedAt: string };


type PasswordManagerProps = {
  credentials: Credential[];
  documents: SecureDocument[];
  paymentCards: PaymentCard[];
  secureNotes: SecureNote[];
  identities: Identity[];
  masterPassword: string;
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onAddCredential: (values: NewCredential) => void;
  onUpdateCredential: (values: UpdateCredential) => void;
  onDeleteCredential: (id: string, itemType: TrashedItem['itemType'], isPermanent?: boolean) => void;
  onAddDocument: (file: File, name: string) => Promise<void>;
  onDeleteDocument: (id: string) => void;
  onToggleDocumentLock: (id: string) => void;
  onAddPaymentCard: (values: NewPaymentCard) => void;
  onUpdatePaymentCard: (values: PaymentCard) => void;
  onDeletePaymentCard: (id: string) => void;
  onAddSecureNote: (values: NewSecureNote) => void;
  onUpdateSecureNote: (values: UpdateSecureNote) => void;
  onDeleteSecureNote: (id: string) => void;
  onAddIdentity: (values: NewIdentity) => void;
  onUpdateIdentity: (values: UpdateIdentity) => void;
  onDeleteIdentity: (id: string) => void;
  onRestoreItem: (item: any, itemType: TrashedItem['itemType']) => void;
};

function EmptyState({ view }: { view: ActiveView }) {
    const content = {
        passwords: {
            icon: KeyRound,
            title: "Your password vault is empty.",
            message: "Click \"Add New Password\" to get started.",
        },
        documents: {
            icon: FileText,
            title: "No secure documents yet.",
            message: "Click \"Add New Document\" to upload and encrypt a file.",
        },
        payments: {
            icon: CreditCard,
            title: "No payment cards saved.",
            message: "Click \"Add New Card\" to save card details securely.",
        },
        notes: {
            icon: StickyNote,
            title: "No secure notes yet.",
            message: "Click \"Add New Note\" to save an encrypted note."
        },
        identities: {
            icon: User,
            title: "No identities saved.",
            message: "Click \"Add New Identity\" to save personal information."
        },
        security: {
            icon: Shield,
            title: "No passwords to analyze.",
            message: "Add some passwords to check your security health.",
        },
        dashboard: { icon: LayoutGrid, title: "Dashboard", message: "Get a bird's-eye view of your vault's security and activity. This feature is coming soon!"},
        generator: { icon: RotateCw, title: "Password Generator", message: "Create strong, unique passwords for all your accounts."},
        trash: { icon: Trash2, title: "Trash is empty.", message: "Deleted items will appear here. You can restore them or delete them permanently."},
        settings: { icon: Settings, title: "Settings", message: "Customize your SafePass experience, including themes and security."},
        admin: { icon: ShieldQuestion, title: "Admin Panel", message: "Manage users and application settings."},
        documentation: { icon: BookOpen, title: "Capstone Documentation", message: "Viewing project documentation."}
    }[view];

    if (!content) return null;
    const Icon = content.icon;

    return (
        <div className="text-center text-muted-foreground mt-16 flex flex-col items-center gap-4">
          <Icon className="w-16 h-16" />
          <h3 className="text-xl font-semibold">{content.title}</h3>
          <p>{content.message}</p>
        </div>
    );
}

export function PasswordManager({
  credentials,
  documents,
  paymentCards,
  secureNotes,
  identities,
  masterPassword,
  activeView,
  onNavigate,
  onAddCredential,
  onUpdateCredential,
  onDeleteCredential,
  onAddDocument,
  onDeleteDocument,
  onToggleDocumentLock,
  onAddPaymentCard,
  onUpdatePaymentCard,
  onDeletePaymentCard,
  onAddSecureNote,
  onUpdateSecureNote,
  onDeleteSecureNote,
  onAddIdentity,
  onUpdateIdentity,
  onDeleteIdentity,
  onRestoreItem,
}: PasswordManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const allItems = useMemo(() => [
      ...credentials.map(c => ({ ...c, itemType: 'credential' as const })),
      ...documents.map(d => ({ ...d, itemType: 'document' as const })),
      ...paymentCards.map(p => ({ ...p, itemType: 'paymentCard' as const })),
      ...secureNotes.map(n => ({ ...n, itemType: 'note' as const })),
      ...identities.map(i => ({ ...i, itemType: 'identity' as const })),
  ], [credentials, documents, paymentCards, secureNotes, identities]);

  const nonTrashedItems = useMemo(() => allItems.filter(item => !item.deletedAt), [allItems]);
  const trashedItems = useMemo(() => allItems.filter((item): item is TrashedItem => !!item.deletedAt), [allItems]);

  const activeCredentials = useMemo(() => nonTrashedItems.filter(item => item.itemType === 'credential') as Credential[], [nonTrashedItems]);
  const activeDocuments = useMemo(() => nonTrashedItems.filter(item => item.itemType === 'document') as SecureDocument[], [nonTrashedItems]);
  const activePaymentCards = useMemo(() => nonTrashedItems.filter(item => item.itemType === 'paymentCard') as PaymentCard[], [nonTrashedItems]);
  const activeSecureNotes = useMemo(() => nonTrashedItems.filter(item => item.itemType === 'note') as SecureNote[], [nonTrashedItems]);
  const activeIdentities = useMemo(() => nonTrashedItems.filter(item => item.itemType === 'identity') as Identity[], [nonTrashedItems]);

  const filteredCredentials = useMemo(() => {
    if (!searchQuery) return activeCredentials;
    return activeCredentials.filter(
      (c) =>
        c.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeCredentials, searchQuery]);

  const filteredDocuments = useMemo(() => {
    if (!searchQuery) return activeDocuments;
    return activeDocuments.filter(
      (d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeDocuments, searchQuery]);

  const filteredPaymentCards = useMemo(() => {
    if (!searchQuery) return activePaymentCards;
    return activePaymentCards.filter(
      (c) =>
        c.cardholderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.cardType.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activePaymentCards, searchQuery]);
  
  const filteredSecureNotes = useMemo(() => {
    if (!searchQuery) return activeSecureNotes;
    // We can't search encrypted content, so we will filter on category if it exists
    return activeSecureNotes.filter(
      (n) => n.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeSecureNotes, searchQuery]);

  const filteredIdentities = useMemo(() => {
      if (!searchQuery) return activeIdentities;
      return activeIdentities.filter(i => 
        i.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
  }, [activeIdentities, searchQuery]);

  const renderContent = () => {
    switch (activeView) {
        case 'dashboard':
            return <MainDashboard
                stats={{
                    passwords: activeCredentials.length,
                    documents: activeDocuments.length,
                    notes: activeSecureNotes.length,
                    identities: activeIdentities.length,
                    cards: activePaymentCards.length,
                }}
                credentials={activeCredentials}
                masterPassword={masterPassword}
                onNavigate={onNavigate}
            />;
        case 'passwords':
            return activeCredentials.length > 0 ? (
                filteredCredentials.length > 0 ? (
                     <PasswordList
                        credentials={filteredCredentials}
                        masterPassword={masterPassword}
                        onUpdateCredential={onUpdateCredential}
                        onDeleteCredential={(id) => onDeleteCredential(id, 'credential')}
                    />
                ) : <p className="text-center text-muted-foreground mt-16">No passwords found for "{searchQuery}"</p>
            ) : <EmptyState view="passwords" />;
        case 'documents':
            return activeDocuments.length > 0 ? (
                filteredDocuments.length > 0 ? (
                     <DocumentList
                        documents={filteredDocuments}
                        masterPassword={masterPassword}
                        onDeleteDocument={onDeleteDocument}
                        onToggleDocumentLock={onToggleDocumentLock}
                    />
                ) : <p className="text-center text-muted-foreground mt-16">No documents found for "{searchQuery}"</p>
            ) : <EmptyState view="documents" />;
        case 'payments':
            return activePaymentCards.length > 0 ? (
                filteredPaymentCards.length > 0 ? (
                    <PaymentCardList
                        paymentCards={filteredPaymentCards}
                        masterPassword={masterPassword}
                        onUpdatePaymentCard={onUpdatePaymentCard}
                        onDeletePaymentCard={onDeletePaymentCard}
                    />
                ) : <p className="text-center text-muted-foreground mt-16">No cards found for "{searchQuery}"</p>
            ) : <EmptyState view="payments" />;
        case 'notes':
            return activeSecureNotes.length > 0 ? (
                filteredSecureNotes.length > 0 ? (
                    <NoteList
                        notes={filteredSecureNotes}
                        masterPassword={masterPassword}
                        onUpdateSecureNote={onUpdateSecureNote}
                        onDeleteSecureNote={onDeleteSecureNote}
                    />
                 ) : <p className="text-center text-muted-foreground mt-16">No notes found for "{searchQuery}"</p>
            ) : <EmptyState view="notes" />;
        case 'identities':
            return activeIdentities.length > 0 ? (
                 filteredIdentities.length > 0 ? (
                    <IdentityList
                        identities={filteredIdentities}
                        masterPassword={masterPassword}
                        onUpdateIdentity={onUpdateIdentity}
                        onDeleteIdentity={onDeleteIdentity}
                    />
                ) : <p className="text-center text-muted-foreground mt-16">No identities found for "{searchQuery}"</p>
            ) : <EmptyState view="identities" />;
        case 'security':
            return activeCredentials.length > 0 ? (
                <SecurityHealth credentials={activeCredentials} masterPassword={masterPassword} onNavigate={onNavigate} />
            ) : <EmptyState view="security" />;
        case 'generator':
            return <PasswordGeneratorView />;
        case 'trash':
             return trashedItems.length > 0 ? (
                <TrashView
                    items={trashedItems}
                    masterPassword={masterPassword}
                    onRestoreItem={onRestoreItem}
                    onPermanentlyDeleteItem={(id, itemType) => onDeleteCredential(id, itemType, true)}
                />
            ) : <EmptyState view="trash" />;
        case 'settings':
            return <SettingsView />;
        case 'admin':
             return <AdminDashboard />;
        default:
            return <EmptyState view={activeView} />;
    }
  }
  
  const renderHeaderActions = () => {
     const showSearch = ['passwords', 'documents', 'payments', 'notes', 'identities'].includes(activeView);
     
     return (
        <div className="flex flex-wrap items-center gap-4 py-4">
            {showSearch ? (
                 <div className="relative w-full max-w-lg">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search vault..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            ) : <div className="flex-1" />}
            <div className="ml-auto flex flex-wrap gap-2 sm:gap-4 items-center">
                {activeView === 'passwords' && <AddPasswordDialog onAddCredential={onAddCredential} />}
                {activeView === 'documents' && (
                    <>
                        <AnalyzeDocDialog documents={activeDocuments} masterPassword={masterPassword} />
                        <AddDocumentDialog onAddDocument={onAddDocument} />
                    </>
                )}
                {activeView === 'payments' && <AddPaymentCardDialog onAddPaymentCard={onAddPaymentCard} />}
                {activeView === 'notes' && <AddNoteDialog onAddSecureNote={onAddSecureNote} />}
                {activeView === 'identities' && <AddIdentityDialog onAddIdentity={onAddIdentity} />}
            </div>
        </div>
     );
  }

  return (
    <div className="flex flex-col h-full w-full">
        {renderHeaderActions()}
        <div className="flex-grow pb-8">
            {renderContent()}
       </div>
       <MediaPreviewDialog />
    </div>
  );
}
