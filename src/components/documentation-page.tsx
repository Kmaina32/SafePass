
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export function DocumentationPage({ markdown }: { markdown: string }) {
  return (
    <div className="bg-muted/40 min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to App
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 sm:p-10">
            <article className="prose prose-blue dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown}
              </ReactMarkdown>
            </article>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
