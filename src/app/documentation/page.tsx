
import { DocumentationPage } from "@/components/documentation-page";
import fs from "fs";
import path from "path";

export default function Page() {
  const markdown = fs.readFileSync(
    path.join(process.cwd(), "DOCUMENTATION.md"),
    "utf-8"
  );
  return <DocumentationPage markdown={markdown} />;
}
