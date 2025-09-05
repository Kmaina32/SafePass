
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Monitor, Moon, Sun, Shield, Phone, KeyRound } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
      setMounted(true);
  }, []);

  if (!mounted) {
      return null; // or a skeleton loader
  }
  
  return (
    <div className="flex justify-center items-start pt-8 w-full">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Customize your SafePass experience and manage security settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2"><Sun className="text-primary"/> Appearance</h3>
                <div className="p-4 border rounded-lg">
                    <Label className="text-base">Theme</Label>
                    <p className="text-sm text-muted-foreground mb-4">Select the theme for the application.</p>
                    <RadioGroup
                        value={theme}
                        onValueChange={(value) => setTheme(value)}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                    >
                        <Label htmlFor="theme-light" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                            <RadioGroupItem value="light" id="theme-light" className="sr-only" />
                            <Sun className="h-6 w-6 mb-2" />
                            Light
                        </Label>
                         <Label htmlFor="theme-dark" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                            <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
                            <Moon className="h-6 w-6 mb-2" />
                            Dark
                        </Label>
                         <Label htmlFor="theme-system" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                            <RadioGroupItem value="system" id="theme-system" className="sr-only" />
                            <Monitor className="h-6 w-6 mb-2" />
                            System
                        </Label>
                    </RadioGroup>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2"><Shield className="text-primary"/> Security</h3>
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2"><KeyRound/> Change Master Password</CardTitle>
                        <CardDescription>If you change your master password, all data will need to be re-encrypted.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <form className="space-y-4">
                           <div className="space-y-2">
                               <Label htmlFor="current-password">Current Master Password</Label>
                               <Input id="current-password" type="password" />
                           </div>
                            <div className="space-y-2">
                               <Label htmlFor="new-password">New Master Password</Label>
                               <Input id="new-password" type="password" />
                           </div>
                            <div className="space-y-2">
                               <Label htmlFor="confirm-password">Confirm New Password</Label>
                               <Input id="confirm-password" type="password" />
                           </div>
                       </form>
                    </CardContent>
                    <CardFooter>
                        <Button disabled>Change Password</Button>
                    </CardFooter>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2"><Phone/> Recovery Phone Number</CardTitle>
                        <CardDescription>Add a phone number to help recover your account if you forget your master password.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="flex items-end gap-4">
                           <div className="space-y-2 flex-grow">
                               <Label htmlFor="phone-number">Phone Number</Label>
                               <Input id="phone-number" type="tel" placeholder="+1 (555) 123-4567" />
                           </div>
                            <Button disabled>Save</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

