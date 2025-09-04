
"use client";

import { Button } from "@/components/ui/button";
import { Lock, LogOut, FileText, KeyRound, ShieldCheck } from "lucide-react";
import type { User } from 'firebase/auth';
import { auth } from "@/lib/firebase";

type DashboardLayoutProps = {
  user: User | null | undefined;
  children: React.ReactNode;
  onLock: () => void;
  activeView: 'passwords' | 'documents';
  onNavigate: (view: 'passwords' | 'documents') => void;
};

export function DashboardLayout({ user, children, onLock, activeView, onNavigate }: DashboardLayoutProps) {

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
        <aside className="hidden w-64 flex-col border-r bg-background sm:flex">
            <div className="flex h-[60px] items-center border-b px-6">
                <a href="#" className="flex items-center gap-2 font-semibold">
                    <ShieldCheck className="h-6 w-6 text-primary"/>
                    <span>SafePass</span>
                </a>
            </div>
            <nav className="flex-1 overflow-auto py-4">
                <div className="grid items-start px-4 text-sm font-medium">
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
                </div>
            </nav>
            <div className="mt-auto p-4 border-t">
                <div className="flex items-center gap-2">
                    {user?.photoURL && <img src={user.photoURL} alt="User" className="h-8 w-8 rounded-full" />}
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{user?.displayName || 'User'}</span>
                        <span className="text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-2 mt-4">
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
            <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6">
                <a href="#" className="flex items-center gap-2 font-semibold sm:hidden">
                    <ShieldCheck className="h-6 w-6 text-primary"/>
                    <span>SafePass</span>
                </a>
                <div className="flex-1">
                    {children}
                </div>
            </header>
        </div>
    </div>
  );
}

