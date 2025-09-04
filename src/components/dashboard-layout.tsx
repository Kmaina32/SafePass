
"use client";

import { Button } from "@/components/ui/button";
import { Lock, LogOut, FileText, KeyRound, ShieldCheck, Menu } from "lucide-react";
import type { User } from 'firebase/auth';
import { auth } from "@/lib/firebase";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useState } from "react";

type DashboardLayoutProps = {
  user: User | null | undefined;
  children: React.ReactNode;
  onLock: () => void;
  activeView: 'passwords' | 'documents';
  onNavigate: (view: 'passwords' | 'documents') => void;
};

function SidebarNav({ activeView, onNavigate }: { activeView: 'passwords' | 'documents', onNavigate: (view: 'passwords' | 'documents') => void }) {
    return (
        <nav className="grid items-start px-4 text-sm font-medium">
            <Button
                variant={activeView === 'passwords' ? 'secondary' : 'ghost'}
                className="justify-start gap-3"
                onClick={() => onNavigate('passwords')}
            >
                <KeyRound />
                Passwords
            </Button>
            <Button
                variant={activeView === 'documents' ? 'secondary' : 'ghost'}
                className="justify-start gap-3"
                onClick={() => onNavigate('documents')}
            >
                <FileText />
                Secure Documents
            </Button>
        </nav>
    );
}

export function DashboardLayout({ user, children, onLock, activeView, onNavigate }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
        <aside className="hidden w-64 flex-col border-r bg-background sm:flex">
            <div className="flex h-[60px] items-center border-b px-6">
                <a href="#" className="flex items-center gap-2 font-semibold">
                    <ShieldCheck className="h-6 w-6 text-primary"/>
                    <span>SafePass</span>
                </a>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <SidebarNav activeView={activeView} onNavigate={onNavigate} />
            </div>
            <div className="mt-auto p-4 border-t">
                <div className="flex items-center gap-2 mb-4">
                    {user?.photoURL && <img src={user.photoURL} alt="User" className="h-8 w-8 rounded-full" />}
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium truncate">{user?.displayName || 'User'}</span>
                        <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={onLock}>
                        <Lock />
                        Lock
                    </Button>
                     <Button variant="outline" size="sm" onClick={() => auth.signOut()}>
                        <LogOut />
                        Sign Out
                    </Button>
                </div>
            </div>
        </aside>
        <div className="flex flex-1 flex-col">
             <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button size="icon" variant="outline" className="sm:hidden">
                            <Menu />
                            <span className="sr-only">Toggle Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="sm:max-w-xs">
                        <nav className="grid gap-6 text-lg font-medium">
                            <a href="#" className="flex items-center gap-2 font-semibold text-lg">
                                <ShieldCheck className="h-6 w-6 text-primary"/>
                                <span>SafePass</span>
                            </a>
                            <SidebarNav activeView={activeView} onNavigate={(view) => {
                                onNavigate(view);
                                setMobileMenuOpen(false);
                            }} />
                        </nav>
                    </SheetContent>
                </Sheet>
                <div className="flex-1">
                    {/* Header content like search can go here, passed as children */}
                </div>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-0">
                {children}
            </main>
        </div>
    </div>
  );
}
