

"use client";

import { AddPasswordDialog } from "@/components/add-password-dialog";
import { PasswordList } from "@/components/password-list";
import type { Credential, PaymentCard, SecureDocument, SecureNote, Identity } from "@/lib/types";
import { Search, KeyRound, FileText, CreditCard, Shield, Settings, RotateCw, User, StickyNote, Trash2, LayoutGrid } from "lucide-react";
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

type NewCredential = Omit<Credential, 'id' | 'password_encrypted'> & { password: string };
type UpdateCredential = NewCredential & { id: string };
type NewPaymentCard = Omit<PaymentCard, 'id'>;
type NewSecureNote = Omit<SecureNote, 'id' | 'title_encrypted' | 'content_encrypted' | 'createdAt'> & { title: string, content: string };
type UpdateSecureNote = NewSecureNote & { id: string };
type NewIdentity = Omit<Identity, 'id'>;
type UpdateIdentity = Identity;


type PasswordManagerProps = {
  credentials: Credential[];
  documents: SecureDocument[];
  paymentCards: PaymentCard[];
  secureNotes: SecureNote[];
  identities: Identity[];
  masterPassword: string;
  activeView: ActiveView;
  onAddCredential: (values: NewCredential) => void;
  onUpdateCredential: (values: UpdateCredential) => void;
  onDeleteCredential: (id: string) => void;
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
        trash: { icon: Trash2, title: "Trash", message: "Review and restore items you've recently deleted. This feature is coming soon!"},
        settings: { icon: Settings, title: "Settings", message: "Customize your SafePass experience, including themes and security."},
        admin: { icon: User, title: "Admin Panel", message: "Manage users and application settings."}
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
}: PasswordManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCredentials = useMemo(() => {
    if (!searchQuery) return credentials;
    return credentials.filter(
      (c) =>
        c.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [credentials, searchQuery]);

  const filteredDocuments = useMemo(() => {
    if (!searchQuery) return documents;
    return documents.filter(
      (d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [documents, searchQuery]);

  const filteredPaymentCards = useMemo(() => {
    if (!searchQuery) return paymentCards;
    return paymentCards.filter(
      (c) =>
        c.cardholderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.cardType.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [paymentCards, searchQuery]);
  
  const filteredSecureNotes = useMemo(() => {
    if (!searchQuery) return secureNotes;
    // We can't search encrypted content, so we will filter on category if it exists
    return secureNotes.filter(
      (n) => n.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [secureNotes, searchQuery]);

  const filteredIdentities = useMemo(() => {
      if (!searchQuery) return identities;
      return identities.filter(i => 
        i.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
  }, [identities, searchQuery]);

  const renderContent = () => {
    switch (activeView) {
        case 'passwords':
            return credentials.length > 0 ? (
                filteredCredentials.length > 0 ? (
                     <PasswordList
                        credentials={filteredCredentials}
                        masterPassword={masterPassword}
                        onUpdateCredential={onUpdateCredential}
                        onDeleteCredential={onDeleteCredential}
                    />
                ) : <p className="text-center text-muted-foreground mt-16">No passwords found for "{searchQuery}"</p>
            ) : <EmptyState view="passwords" />;
        case 'documents':
            return documents.length > 0 ? (
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
            return paymentCards.length > 0 ? (
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
            return secureNotes.length > 0 ? (
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
            return identities.length > 0 ? (
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
            return credentials.length > 0 ? (
                <SecurityHealth credentials={credentials} masterPassword={masterPassword} />
            ) : <EmptyState view="security" />;
        case 'generator':
            return <PasswordGeneratorView />;
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
        <div className="flex items-center gap-4 py-4">
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
            <div className="ml-auto flex gap-2 sm:gap-4 items-center">
                {activeView === 'passwords' && <AddPasswordDialog onAddCredential={onAddCredential} />}
                {activeView === 'documents' && <AddDocumentDialog onAddDocument={onAddDocument} />}
                {activeView === 'payments' && <AddPaymentCardDialog onAddPaymentCard={onAddPaymentCard} />}
                {activeView === 'notes' && <AddNoteDialog onAddSecureNote={onAddSecureNote} />}
                {activeView === 'identities' && <AddIdentityDialog onAddIdentity={onAddIdentity} />}
            </div>
        </div>
     );
  }

  return (
    <div className="flex flex-col h-full">
        {renderHeaderActions()}
        <div className="flex-grow pb-8">
            {renderContent()}
       </div>
    </div>
  );
}
