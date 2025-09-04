
'use server';
/**
 * @fileOverview An AI flow for analyzing password strength.
 *
 * - analyzePassword - A function that analyzes a password and provides feedback.
 * - PasswordStrengthInput - The input type for the analyzePassword function.
 * - PasswordAnalysis - The return type for the analyzePassword function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PasswordStrengthInputSchema = z.object({
  password: z.string().describe('The password to analyze.'),
});
export type PasswordStrengthInput = z.infer<typeof PasswordStrengthInputSchema>;

const PasswordAnalysisSchema = z.object({
  strength: z.enum(['Weak', 'Medium', 'Strong']).describe('The overall strength of the password.'),
  feedback: z.string().describe('Specific feedback and suggestions for improving the password.'),
  score: z.number().min(0).max(100).describe('A score from 0 to 100 representing the password strength.'),
});
export type PasswordAnalysis = z.infer<typeof PasswordAnalysisSchema>;

export async function analyzePassword(input: PasswordStrengthInput): Promise<PasswordAnalysis> {
  return passwordStrengthFlow(input);
}

const prompt = ai.definePrompt({
  name: 'passwordStrengthPrompt',
  input: { schema: PasswordStrengthInputSchema },
  output: { schema: PasswordAnalysisSchema },
  prompt: `You are a cybersecurity expert specializing in password security. Analyze the following password: {{{password}}}

  Evaluate its strength based on the following criteria:
  - Length (longer is better, 12+ is good)
  - Mix of character types (uppercase, lowercase, numbers, symbols)
  - Avoidance of common words, names, or patterns (e.g., "password", "123456", "qwerty")
  - Unpredictability

  Based on your analysis, provide a final strength rating of "Weak", "Medium", or "Strong".
  Provide concise, actionable feedback for how to improve the password. If the password is weak, explain why (e.g., "too short", "only contains lowercase letters"). If it's strong, say so.
  
  Finally, provide a numerical score from 0 to 100.
  - 0-40 for Weak
  - 41-79 for Medium
  - 80-100 for Strong

  Return your analysis in the specified JSON format.`,
});

const passwordStrengthFlow = ai.defineFlow(
  {
    name: 'passwordStrengthFlow',
    inputSchema: PasswordStrengthInputSchema,
    outputSchema: PasswordAnalysisSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
