
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Monitor, Moon, Sun } from "lucide-react";

type Theme = "light" | "dark" | "system";

export function SettingsView() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const storedTheme = localStorage.getItem("safepass-theme") as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("safepass-theme", theme);
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(systemTheme);
    } else {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(theme);
    }
  }, [theme]);


  return (
    <div className="flex justify-center items-start pt-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Customize your SafePass experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Appearance</h3>
                <div className="p-4 border rounded-lg">
                    <Label className="text-base">Theme</Label>
                    <p className="text-sm text-muted-foreground mb-4">Select the theme for the application.</p>
                    <RadioGroup
                        value={theme}
                        onValueChange={(value: Theme) => setTheme(value)}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                    >
                        <Label htmlFor="theme-light" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                            <RadioGroupItem value="light" id="theme-light" className="sr-only" />
                            <Sun className="h-6 w-6 mb-2" />
                            Light
                        </Label>
                         <Label htmlFor="theme-dark" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                            <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
                            <Moon className="h-6 w-6 mb-2" />
                            Dark
                        </Label>
                         <Label htmlFor="theme-system" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                            <RadioGroupItem value="system" id="theme-system" className="sr-only" />
                            <Monitor className="h-6 w-6 mb-2" />
                            System
                        </Label>
                    </RadioGroup>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
