'use server';
/**
 * @fileOverview An AI flow for asking questions about a document.
 *
 * - askDocument - A function that takes a document and a question and returns an answer.
 */

import { ai } from '@/ai/genkit';
import { DocumentQuestionInputSchema, DocumentQuestionAnswerSchema, type DocumentQuestionInput, type DocumentQuestionAnswer } from '@/ai/lib/types';


export async function askDocument(input: DocumentQuestionInput): Promise<DocumentQuestionAnswer> {
  return documentQaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'documentQaPrompt',
  input: { schema: DocumentQuestionInputSchema },
  output: { schema: DocumentQuestionAnswerSchema },
  prompt: `You are an expert document analyst. Analyze the following document and answer the user's question.

Document: {{media url=documentDataUri}}
Question: {{{question}}}

Provide a concise and accurate answer based only on the information in the document. If the information is not present, say "The answer could not be found in the document."`,
});

const documentQaFlow = ai.defineFlow(
  {
    name: 'documentQaFlow',
    inputSchema: DocumentQuestionInputSchema,
    outputSchema: DocumentQuestionAnswerSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
