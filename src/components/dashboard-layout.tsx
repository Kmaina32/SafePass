
"use client";

import { Button } from "@/components/ui/button";
import { Lock, LogOut, FileText, KeyRound, ShieldCheck, Menu, User, CreditCard, StickyNote, LifeBuoy, Settings, Trash2, LayoutGrid, RotateCw, BookOpen, ShieldQuestion } from "lucide-react";
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from "@/lib/firebase";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export type ActiveView = 'passwords' | 'documents' | 'dashboard' | 'identities' | 'payments' | 'notes' | 'generator' | 'security' | 'trash' | 'settings' | 'admin';

const ADMIN_EMAIL = "gmaina424@gmail.com";

type DashboardLayoutProps = {
  user: FirebaseUser | null | undefined;
  children: React.ReactNode;
  onLock: () => void;
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
};

const navItems = [
    { view: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { view: 'passwords', label: 'Passwords', icon: KeyRound },
    { view: 'documents', label: 'Secure Documents', icon: FileText },
    { view: 'identities', label: 'Identities', icon: User },
    { view: 'payments', label: 'Payment Cards', icon: CreditCard },
    { view: 'notes', label: 'Secure Notes', icon: StickyNote },
    { view: 'generator', label: 'Generator', icon: RotateCw },
    { view: 'security', label: 'Security Health', icon: ShieldCheck },
    { view: 'trash', label: 'Trash', icon: Trash2 },
    { view: 'settings', label: 'Settings', icon: Settings },
] as const;

const adminNavItem = { view: 'admin', label: 'Admin Panel', icon: ShieldQuestion } as const;


function SidebarNav({ activeView, onNavigate, user }: { activeView: ActiveView, onNavigate: (view: ActiveView) => void, user: FirebaseUser | null | undefined }) {
    const isUserAdmin = user?.email === ADMIN_EMAIL;
    return (
        <nav className="grid items-start px-4 text-sm font-medium">
            {navItems.map(item => (
                <Button
                    key={item.view}
                    variant={activeView === item.view ? 'secondary' : 'ghost'}
                    className="justify-start gap-3"
                    onClick={() => onNavigate(item.view)}
                >
                    <item.icon />
                    {item.label}
                </Button>
            ))}
            {isUserAdmin && (
                 <Button
                    key={adminNavItem.view}
                    variant={activeView === adminNavItem.view ? 'secondary' : 'ghost'}
                    className="justify-start gap-3 mt-4 border-t pt-4"
                    onClick={() => onNavigate(adminNavItem.view)}
                >
                    <adminNavItem.icon />
                    {adminNavItem.label}
                </Button>
            )}
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
                <SidebarNav activeView={activeView} onNavigate={onNavigate} user={user} />
            </div>
            <div className="mt-auto p-4 border-t space-y-4">
                <div className="flex items-center gap-2">
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
                    <SheetContent side="left" className="sm:max-w-xs p-0">
                        <div className="flex h-[60px] items-center border-b px-6">
                            <a href="#" className="flex items-center gap-2 font-semibold text-lg">
                                <ShieldCheck className="h-6 w-6 text-primary"/>
                                <span>SafePass</span>
                            </a>
                        </div>
                        <div className="overflow-auto py-4">
                            <SidebarNav activeView={activeView} user={user} onNavigate={(view) => {
                                onNavigate(view);
                                setMobileMenuOpen(false);
                            }} />
                        </div>
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
