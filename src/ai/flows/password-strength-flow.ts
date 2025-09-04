
'use server';
/**
 * @fileOverview An AI flow for analyzing password strength.
 *
 * - analyzePassword - A function that analyzes a password and provides feedback.
 */

import { ai } from '@/ai/genkit';
import { PasswordStrengthInputSchema, PasswordAnalysisSchema, type PasswordStrengthInput, type PasswordAnalysis } from '@/ai/lib/types';


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
