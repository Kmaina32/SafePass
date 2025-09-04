
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export function DocumentationPage({ markdown }: { markdown: string }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!contentRef.current) return;
    setIsDownloading(true);

    try {
        const canvas = await html2canvas(contentRef.current, {
            scale: 2, // Higher scale for better resolution
            useCORS: true,
            backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save("SafePass-Capstone-Documentation.pdf");
    } catch(error) {
        console.error("Failed to generate PDF", error);
    } finally {
        setIsDownloading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to App
            </Link>
          </Button>
          <Button onClick={handleDownloadPdf} disabled={isDownloading}>
            {isDownloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download as PDF
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 sm:p-10">
            <div ref={contentRef} className="bg-card p-4 sm:p-8">
                <div className="mb-12 border-b pb-8">
                    <div className="flex items-center gap-4 text-primary">
                        <ShieldCheck className="h-12 w-12"/>
                        <h1 className="text-4xl font-bold text-foreground">SafePass</h1>
                    </div>
                    <p className="text-muted-foreground mt-2">Capstone Project Documentation</p>
                </div>
                <article className="prose prose-blue dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {markdown}
                </ReactMarkdown>
                </article>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
