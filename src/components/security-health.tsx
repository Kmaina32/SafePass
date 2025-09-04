
"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Credential } from '@/lib/types';
import { decrypt } from '@/lib/encryption';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { PasswordAnalysis, analyzePassword } from '@/ai/flows/password-strength-flow';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

type SecurityHealthProps = {
  credentials: Credential[];
  masterPassword: string;
};

type SecurityIssue = {
  id: string;
  url: string;
  username: string;
  issue: 'Weak' | 'Reused' | 'Short';
  details: string;
};

export function SecurityHealth({ credentials, masterPassword }: SecurityHealthProps) {
  const [decryptedPasswords, setDecryptedPasswords] = useState<Map<string, string>>(new Map());
  const [passwordAnalyses, setPasswordAnalyses] = useState<Map<string, PasswordAnalysis>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const decryptAll = async () => {
      setIsLoading(true);
      const decryptedMap = new Map<string, string>();
      credentials.forEach(cred => {
        try {
          const pass = decrypt(cred.password_encrypted, masterPassword);
          decryptedMap.set(cred.id, pass);
        } catch (e) {
          console.error(`Failed to decrypt password for ${cred.url}`);
        }
      });
      setDecryptedPasswords(decryptedMap);

      const analysesMap = new Map<string, PasswordAnalysis>();
      for (const [id, password] of decryptedMap.entries()) {
        try {
          const analysis = await analyzePassword({ password });
          analysesMap.set(id, analysis);
        } catch (e) {
          console.error(`Failed to analyze password for id ${id}`);
        }
      }
      setPasswordAnalyses(analysesMap);
      setIsLoading(false);
    };

    if (credentials.length > 0 && masterPassword) {
      decryptAll();
    } else {
        setIsLoading(false);
    }
  }, [credentials, masterPassword]);

  const { score, issues } = useMemo(() => {
    if (passwordAnalyses.size === 0) {
      return { score: 100, issues: [] };
    }

    let totalScore = 0;
    const currentIssues: SecurityIssue[] = [];
    const passwordCounts = new Map<string, string[]>();

    passwordAnalyses.forEach((analysis, id) => {
      totalScore += analysis.score;
      const credential = credentials.find(c => c.id === id)!;
      const password = decryptedPasswords.get(id)!;

      if (analysis.strength === 'Weak') {
        currentIssues.push({
          id,
          url: credential.url,
          username: credential.username,
          issue: 'Weak',
          details: analysis.feedback,
        });
      }
      
      // Check for reused passwords
      if (passwordCounts.has(password)) {
        passwordCounts.get(password)!.push(id);
      } else {
        passwordCounts.set(password, [id]);
      }
    });
    
    // Add reused password issues
    passwordCounts.forEach((ids, password) => {
        if (ids.length > 1) {
            ids.forEach(id => {
                // Avoid duplicating issues for the same ID
                if (currentIssues.some(issue => issue.id === id && issue.issue === 'Reused')) return;

                const credential = credentials.find(c => c.id === id)!;
                currentIssues.push({
                    id,
                    url: credential.url,
                    username: credential.username,
                    issue: 'Reused',
                    details: `This password is used for ${ids.length} accounts.`,
                });
            });
        }
    });


    const averageScore = totalScore / passwordAnalyses.size;
    return { score: Math.round(averageScore), issues: currentIssues };
  }, [passwordAnalyses, credentials, decryptedPasswords]);

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const getScoreIcon = () => {
    if (score >= 80) return <ShieldCheck className={`h-24 w-24 ${getScoreColor()}`} />;
    if (score >= 50) return <ShieldAlert className={`h-24 w-24 ${getScoreColor()}`} />;
    return <ShieldAlert className={`h-24 w-24 ${getScoreColor()}`} />;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Shield className="h-24 w-24 animate-pulse" />
        <p className="mt-4 text-lg">Analyzing your vault's security...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto bg-muted p-4 rounded-full">
            {getScoreIcon()}
          </div>
          <CardTitle className="text-4xl font-bold mt-4">Your Security Score</CardTitle>
          <CardDescription>
            This score represents the overall strength of the passwords in your vault.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-6xl font-bold ${getScoreColor()}`}>{score}</p>
          <Progress value={score} className="h-4" />
          <p className="text-sm text-muted-foreground">
            {issues.length === 0 ? "Excellent! No security issues found." : `You have ${issues.length} security issue(s) to address.`}
          </p>
        </CardContent>
      </Card>
      
      {issues.length > 0 && (
        <Card>
            <CardHeader>
                <CardTitle>Security Issues</CardTitle>
                <CardDescription>Address these issues to improve your security score.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {issues.map(issue => (
                    <div key={`${issue.id}-${issue.issue}`} className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50">
                        <div className="mt-1">
                            {issue.issue === 'Weak' && <AlertCircle className="h-5 w-5 text-yellow-500" />}
                            {issue.issue === 'Reused' && <AlertCircle className="h-5 w-5 text-red-500" />}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold">{issue.url}</h4>
                                <Badge variant={issue.issue === 'Weak' ? 'default' : 'destructive'} className={
                                    issue.issue === 'Weak' ? 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30' : 'bg-red-500/20 text-red-700 border-red-500/30'
                                }>{issue.issue}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{issue.username}</p>
                            <p className="text-sm mt-2">{issue.details}</p>
                        </div>
                         <Button variant="secondary" size="sm" className="ml-auto">
                            Fix Now
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
      )}
    </div>
  );
}
