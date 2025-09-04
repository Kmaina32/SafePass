/**
 * @fileOverview Centralized Zod schemas and TypeScript types for AI flows.
 */

import { z } from 'genkit';

// --- Password Strength Flow ---
export const PasswordStrengthInputSchema = z.object({
  password: z.string().describe('The password to analyze.'),
});
export type PasswordStrengthInput = z.infer<typeof PasswordStrengthInputSchema>;

export const PasswordAnalysisSchema = z.object({
  strength: z.enum(['Weak', 'Medium', 'Strong']).describe('The overall strength of the password.'),
  feedback: z.string().describe('Specific feedback and suggestions for improving the password.'),
  score: z.number().min(0).max(100).describe('A score from 0 to 100 representing the password strength.'),
});
export type PasswordAnalysis = z.infer<typeof PasswordAnalysisSchema>;


// --- Document Q&A Flow ---
export const DocumentQuestionInputSchema = z.object({
    documentDataUri: z
      .string()
      .describe(
        "The document to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
      ),
    question: z.string().describe('The question to ask about the document.'),
  });
export type DocumentQuestionInput = z.infer<typeof DocumentQuestionInputSchema>;
  
export const DocumentQuestionAnswerSchema = z.object({
    answer: z.string().describe('The answer to the question.'),
});
export type DocumentQuestionAnswer = z.infer<typeof DocumentQuestionAnswerSchema>;


// --- Identity Check Flow ---
export const IdentityCheckInputSchema = z.object({
    identityJson: z.string().describe('A JSON string representing the decrypted identity data.'),
});
export type IdentityCheckInput = z.infer<typeof IdentityCheckInputSchema>;
  
export const IdentityCheckResultSchema = z.object({
    issues: z.array(z.object({
      field: z.string().describe("The field with a potential issue."),
      issue: z.string().describe("The description of the issue found."),
      suggestion: z.string().describe("A suggestion to fix the issue."),
    })).describe("A list of potential issues found in the identity data."),
    overallHealth: z.enum(['Good', 'Fair', 'Poor']).describe("An overall assessment of the data's quality and completeness."),
});
export type IdentityCheckResult = z.infer<typeof IdentityCheckResultSchema>;


// --- Note Analysis Flow ---
export const NoteAnalysisInputSchema = z.object({
    noteContent: z.string().describe('The text content of the note to analyze.'),
});
export type NoteAnalysisInput = z.infer<typeof NoteAnalysisInputSchema>;
  
export const NoteAnalysisResultSchema = z.object({
    summary: z.string().describe('A concise summary of the note.'),
    actionItems: z.array(z.string()).describe('A list of action items or tasks mentioned in the note.'),
});
export type NoteAnalysisResult = z.infer<typeof NoteAnalysisResultSchema>;