
"use client";

import { Button } from "@/components/ui/button";
import { Lock, LogOut, FileText, KeyRound, ShieldCheck, Menu, User, CreditCard, StickyNote, LifeBuoy, Settings, Trash2, LayoutGrid, RotateCw, BookOpen, ShieldQuestion, Bell } from "lucide-react";
import type { User as FirebaseUser } from 'firebase/auth';
import { auth, db } from "@/lib/firebase";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import type { Notification as NotificationType } from "@/lib/types";
import { ref, onValue, off } from "firebase/database";
import { Badge } from "./ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { SidebarProvider } from "./ui/sidebar";

export type ActiveView = 'passwords' | 'documents' | 'dashboard' | 'identities' | 'payments' | 'notes' | 'generator' | 'security' | 'trash' | 'settings' | 'admin' | 'documentation';

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

function NotificationBell({ user }: { user: FirebaseUser | null | undefined }) {
    const [notifications, setNotifications] = useState<NotificationType[]>([]);

    useEffect(() => {
        if (!user) return;
        const notificationsRef = ref(db, `users/${user.uid}/notifications`);
        const listener = onValue(notificationsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const sorted = Object.values(data).sort((a: any, b: any) => {
                    const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                    const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                    return dateB - dateA;
                })
                setNotifications(sorted as NotificationType[]);
            } else {
                setNotifications([]);
            }
        });

        return () => off(notificationsRef, 'value', listener);
    }, [user]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <Popover>
            <PopoverTrigger asChild>
                 <Button variant="outline" size="icon" className="relative">
                    <Bell />
                    {unreadCount > 0 && <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 justify-center p-0">{unreadCount}</Badge>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Notifications</h4>
                         <p className="text-sm text-muted-foreground">
                           You have {notifications.length} total messages.
                        </p>
                    </div>
                    <div className="grid gap-2 max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? notifications.map(n => {
                            let timeAgo = 'just now';
                            try {
                                if (n.timestamp && !isNaN(new Date(n.timestamp).getTime())) {
                                    timeAgo = formatDistanceToNow(new Date(n.timestamp), { addSuffix: true });
                                }
                            } catch (e) {
                                console.error('Invalid timestamp for notification', n);
                            }
                           
                            return (
                                <div key={n.id} className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                                    <div className="grid gap-1">
                                        <p className="text-sm font-medium">{n.title}</p>
                                        <p className="text-sm text-muted-foreground">{n.message}</p>
                                        <p className="text-xs text-muted-foreground">{timeAgo}</p>
                                    </div>
                                </div>
                            )
                        }) : <p className="text-sm text-muted-foreground">No new notifications.</p>}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export function DashboardLayout({ user, children, onLock, activeView, onNavigate }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const userInitial = user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U';

  return (
    <SidebarProvider>
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
                    <nav className="grid items-start px-4 text-sm font-medium">
                        <Button
                            asChild
                            variant={'ghost'}
                            className="justify-start gap-3"
                        >
                            <Link href="/documentation">
                                <BookOpen />
                                Capstone Docs
                            </Link>
                        </Button>
                    </nav>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user?.photoURL || undefined} alt="User Avatar" />
                            <AvatarFallback>{userInitial}</AvatarFallback>
                        </Avatar>
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
                        <SheetContent side="left" className="sm:max-w-xs p-0 flex flex-col">
                            <div className="flex h-[60px] items-center border-b px-6">
                                <a href="#" className="flex items-center gap-2 font-semibold text-lg">
                                    <ShieldCheck className="h-6 w-6 text-primary"/>
                                    <span>SafePass</span>
                                </a>
                            </div>
                            <div className="overflow-auto py-4 flex-1">
                                <SidebarNav activeView={activeView} user={user} onNavigate={(view) => {
                                    onNavigate(view);
                                    setMobileMenuOpen(false);
                                }} />
                            </div>
                             <div className="p-4 border-t space-y-4">
                                <nav className="grid items-start px-4 text-sm font-medium">
                                    <Button
                                        asChild
                                        variant={'ghost'}
                                        className="justify-start gap-3"
                                    >
                                        <Link href="/documentation" onClick={() => setMobileMenuOpen(false)}>
                                            <BookOpen />
                                            Capstone Docs
                                        </Link>
                                    </Button>
                                </nav>
                                 <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user?.photoURL || undefined} alt="User Avatar" />
                                        <AvatarFallback>{userInitial}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-sm font-medium truncate">{user?.displayName || 'User'}</span>
                                        <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" size="sm" onClick={() => { onLock(); setMobileMenuOpen(false); }}>
                                        <Lock />
                                        Lock
                                    </Button>
                                     <Button variant="outline" size="sm" onClick={() => { auth.signOut(); setMobileMenuOpen(false); }}>
                                        <LogOut />
                                        Sign Out
                                    </Button>
                                </div>
                             </div>
                        </SheetContent>
                    </Sheet>
                    <div className="flex-1" />
                    <div className="flex items-center gap-4">
                        <NotificationBell user={user} />
                    </div>
                </header>
                <main className="flex-1 p-4 sm:px-6 sm:py-0">
                    {children}
                </main>
            </div>
        </div>
    </SidebarProvider>
  );
}
