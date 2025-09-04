'use server';
/**
 * @fileOverview An AI flow for checking the health of an identity record.
 *
 * - checkIdentity - A function that analyzes an identity for potential issues.
 */

import { ai } from '@/ai/genkit';
import { IdentityCheckInputSchema, IdentityCheckResultSchema, type IdentityCheckInput, type IdentityCheckResult } from '@/ai/lib/types';


export async function checkIdentity(input: IdentityCheckInput): Promise<IdentityCheckResult> {
  return identityCheckFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identityCheckPrompt',
  input: { schema: IdentityCheckInputSchema },
  output: { schema: IdentityCheckResultSchema },
  prompt: `You are a data quality expert. Analyze the following JSON object containing personal identity information.
  
  Identity Data:
  {{{identityJson}}}
  
  Check for the following issues:
  - Incomplete fields (e.g., missing address line 1, city, or zip code if other address parts exist).
  - Formatting inconsistencies (e.g., phone numbers that don't match common formats, zip codes that aren't 5 digits).
  - Potentially invalid data (e.g., a state that is not a real state).
  
  List any issues you find. For each issue, provide the field name, a description of the problem, and a suggested fix.
  If no issues are found, return an empty array for the issues.
  
  Finally, provide an overall health assessment ('Good', 'Fair', or 'Poor') based on the completeness and correctness of the data.`,
});

const identityCheckFlow = ai.defineFlow(
  {
    name: 'identityCheckFlow',
    inputSchema: IdentityCheckInputSchema,
    outputSchema: IdentityCheckResultSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
