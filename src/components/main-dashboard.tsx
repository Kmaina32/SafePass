
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, FileText, KeyRound, MessageSquareWarning, PlusCircle, RotateCw, ShieldCheck, StickyNote, User, ChevronRight } from "lucide-react";
import { ActiveView } from "./dashboard-layout";
import { useMemo } from "react";
import { Credential } from "@/lib/types";
import { decrypt } from "@/lib/encryption";
import { Separator } from "./ui/separator";

type MainDashboardProps = {
    stats: {
        passwords: number;
        documents: number;
        notes: number;
        cards: number;
        identities: number;
    }
    credentials: Credential[];
    masterPassword: string;
    onNavigate: (view: ActiveView) => void;
}

const StatRow = ({ title, value, icon, onNavigate, view }: { title: string, value: number, icon: React.ReactNode, onNavigate: (view: ActiveView) => void, view: ActiveView }) => (
    <div className="flex items-center p-4 hover:bg-muted/50 transition-colors cursor-pointer rounded-lg" onClick={() => onNavigate(view)}>
        {icon}
        <div className="ml-4 flex-1">
            <p className="font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">{value} item(s) saved</p>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-xl font-bold">{value}</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
    </div>
)

export function MainDashboard({ stats, credentials, masterPassword, onNavigate }: MainDashboardProps) {

    const securityScore = useMemo(() => {
        if (credentials.length === 0) return 100;
    
        const totalScore = credentials.reduce((acc, cred) => {
          try {
            const password = decrypt(cred.password_encrypted, masterPassword);
            let score = 0;
            if (password.length >= 16) score += 40;
            else if (password.length >= 12) score += 30;
            else if (password.length >= 8) score += 15;
    
            if (/[A-Z]/.test(password)) score += 15;
            if (/[a-z]/.test(password)) score += 15;
            if (/\d/.test(password)) score += 15;
            if (/[^A-Za-z0-9]/.test(password)) score += 15;
    
            return acc + Math.min(score, 100);
          } catch (e) {
            console.error("Failed to decrypt password for score calculation");
            return acc; 
          }
        }, 0);
    
        return Math.round(totalScore / credentials.length);
      }, [credentials, masterPassword]);

      const getScoreColor = () => {
        if (securityScore >= 80) return 'text-green-500';
        if (securityScore >= 50) return 'text-yellow-500';
        return 'text-red-500';
      };

      const statItems = [
        { title: "Passwords", value: stats.passwords, icon: <KeyRound className="h-6 w-6 text-muted-foreground" />, view: 'passwords' as ActiveView },
        { title: "Secure Notes", value: stats.notes, icon: <StickyNote className="h-6 w-6 text-muted-foreground" />, view: 'notes' as ActiveView },
        { title: "Identities", value: stats.identities, icon: <User className="h-6 w-6 text-muted-foreground" />, view: 'identities' as ActiveView },
        { title: "Payment Cards", value: stats.cards, icon: <CreditCard className="h-6 w-6 text-muted-foreground" />, view: 'payments' as ActiveView },
        { title: "Documents", value: stats.documents, icon: <FileText className="h-6 w-6 text-muted-foreground" />, view: 'documents' as ActiveView },
      ]
      

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                    Here's a quick overview of your secure vault.
                </p>
            </div>
            
            <Card>
                <CardContent className="p-0">
                    <div className="divide-y divide-border">
                        {statItems.map((item, index) => (
                             <StatRow key={index} {...item} onNavigate={onNavigate} />
                        ))}
                    </div>
                </CardContent>
            </Card>


            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Security Score</CardTitle>
                        <CardDescription>An assessment of your vault's password strength.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row items-center justify-center gap-6 text-center">
                        <div className="relative">
                            <p className={`text-7xl font-bold ${getScoreColor()}`}>{securityScore}</p>
                            <p className="text-sm font-medium text-muted-foreground">out of 100</p>
                        </div>
                        <div className="text-left space-y-4">
                            <div>
                                <h4 className="font-semibold">What this score means:</h4>
                                <p className="text-sm text-muted-foreground">
                                    A higher score means your passwords are longer and more complex, making them harder to guess.
                                </p>
                            </div>
                            <Button onClick={() => onNavigate('security')}>
                                <ShieldCheck /> View Detailed Report
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Quickly access common features.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-2">
                         <Button variant="outline" className="justify-start" onClick={() => onNavigate('passwords')}>
                            <PlusCircle className="mr-2" /> Add New Password
                        </Button>
                        <Button variant="outline" className="justify-start" onClick={() => onNavigate('notes')}>
                            <PlusCircle className="mr-2" /> Add New Secure Note
                        </Button>
                         <Button variant="outline" className="justify-start" onClick={() => onNavigate('generator')}>
                            <RotateCw className="mr-2" /> Password Generator
                        </Button>
                    </CardContent>
                </Card>
            </div>
             {stats.passwords > 0 && securityScore < 50 && (
                 <Card className="border-destructive/50 bg-destructive/5">
                     <CardHeader className="flex flex-row items-center gap-4">
                        <MessageSquareWarning className="h-8 w-8 text-destructive"/>
                        <div>
                            <CardTitle className="text-destructive">Security Alert</CardTitle>
                            <CardDescription className="text-destructive/80">Your vault has a low security score. It is highly recommended to review your passwords.</CardDescription>
                        </div>
                     </CardHeader>
                 </Card>
             )}
        </div>
    )
}
