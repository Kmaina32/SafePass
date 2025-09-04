'use server';
/**
 * @fileOverview An AI flow for analyzing a secure note.
 *
 * - analyzeNote - A function that summarizes a note and extracts action items.
 */

import { ai } from '@/ai/genkit';
import { NoteAnalysisInputSchema, NoteAnalysisResultSchema, type NoteAnalysisInput, type NoteAnalysisResult } from '@/ai/lib/types';

export async function analyzeNote(input: NoteAnalysisInput): Promise<NoteAnalysisResult> {
  return noteAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'noteAnalysisPrompt',
  input: { schema: NoteAnalysisInputSchema },
  output: { schema: NoteAnalysisResultSchema },
  prompt: `You are an expert at parsing unstructured text and finding key information. Analyze the following note:
  
  {{{noteContent}}}
  
  Provide a brief, one or two-sentence summary of the note's main topic.
  Then, extract any specific action items, tasks, or to-do's mentioned in the note. If there are no clear action items, return an empty array.
  
  Return the result in the specified JSON format.`,
});

const noteAnalysisFlow = ai.defineFlow(
  {
    name: 'noteAnalysisFlow',
    inputSchema: NoteAnalysisInputSchema,
    outputSchema: NoteAnalysisResultSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
