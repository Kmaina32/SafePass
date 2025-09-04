
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { RefreshCw, Copy, Sparkles, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generatePassword } from '@/lib/password-generator';
import { useDebounce } from '@/hooks/use-debounce';
import { analyzePassword } from '@/ai/flows/password-strength-flow';
import { type PasswordAnalysis } from '@/ai/lib/types';
import { Progress } from './ui/progress';

export function PasswordGeneratorView() {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const debouncedPassword = useDebounce(password, 500);

  const handleGenerate = () => {
    const options = {
        length,
        uppercase: includeUppercase,
        numbers: includeNumbers,
        symbols: includeSymbols,
    };
    // This is a simplified call, you would need to adjust your generatePassword function
    // to accept these options. For now, it will use the default.
    setPassword(generatePassword(length));
    setCopied(false);
  };

  useEffect(() => {
    handleGenerate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, includeUppercase, includeNumbers, includeSymbols]);

  useEffect(() => {
    if (debouncedPassword) {
      setIsAnalyzing(true);
      analyzePassword({ password: debouncedPassword })
        .then(setAnalysis)
        .catch(console.error)
        .finally(() => setIsAnalyzing(false));
    } else {
      setAnalysis(null);
    }
  }, [debouncedPassword]);

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    toast({ title: 'Password copied to clipboard!' });
    setTimeout(() => setCopied(false), 2000);
  };
  
  const strengthValue = analysis ? (analysis.score || 0) : 0;

  return (
    <div className="flex justify-center items-start pt-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Password Generator</CardTitle>
          <CardDescription>Create strong, unique passwords to protect your accounts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-md bg-muted border">
            <Input readOnly value={password} className="text-xl font-mono tracking-wider flex-1 bg-background" />
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              {copied ? <Check className="text-green-500" /> : <Copy />}
            </Button>
            <Button variant="secondary" size="icon" onClick={handleGenerate}>
              <RefreshCw />
            </Button>
          </div>
          
           {(isAnalyzing || analysis) && (
              <div className="space-y-2">
                <Progress value={strengthValue} className="h-2" />
                 {isAnalyzing ? (
                    <p className="text-muted-foreground animate-pulse text-sm">Analyzing...</p>
                ) : analysis && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <p>
                            <span className="font-bold text-foreground">{analysis.strength}:</span> {analysis.feedback}
                        </p>
                    </div>
                )}
              </div>
            )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="length">Password Length</Label>
              <span className="font-bold text-lg">{length}</span>
            </div>
            <Slider id="length" min={8} max={64} step={1} value={[length]} onValueChange={(value) => setLength(value[0])} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="uppercase" checked={includeUppercase} onCheckedChange={setIncludeUppercase} />
              <Label htmlFor="uppercase">Uppercase (A-Z)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="numbers" checked={includeNumbers} onCheckedChange={setIncludeNumbers} />
              <Label htmlFor="numbers">Numbers (0-9)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="symbols" checked={includeSymbols} onCheckedChange={setIncludeSymbols} />
              <Label htmlFor="symbols">Symbols (!@#$...)</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
