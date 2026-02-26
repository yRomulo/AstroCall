'use server';
/**
 * @fileOverview An AI agent that generates a summary of an astrology session.
 *
 * - summarizeSession - A function that handles the session summarization process.
 * - SessionSummaryInput - The input type for the summarizeSession function.
 * - SessionSummaryOutput - The return type for the summarizeSession function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SessionSummaryInputSchema = z.object({
  transcript: z
    .string()
    .describe('The full transcript of the astrology session.'),
});
export type SessionSummaryInput = z.infer<typeof SessionSummaryInputSchema>;

const SessionSummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the astrology session, highlighting key advice, predictions, and discussion points.'),
});
export type SessionSummaryOutput = z.infer<typeof SessionSummaryOutputSchema>;

export async function summarizeSession(input: SessionSummaryInput): Promise<SessionSummaryOutput> {
  return sessionSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sessionSummaryPrompt',
  input: {schema: SessionSummaryInputSchema},
  output: {schema: SessionSummaryOutputSchema},
  prompt: `You are an AI assistant tasked with summarizing an astrology session transcript.
Your goal is to extract the most important information, focusing on:
- Key advice given to the user.
- Any predictions made by the astrologer.
- Major discussion points or themes that emerged during the conversation.

Provide a concise and clear summary in a single paragraph.

Transcript:
{{{transcript}}}`,
});

const sessionSummaryFlow = ai.defineFlow(
  {
    name: 'sessionSummaryFlow',
    inputSchema: SessionSummaryInputSchema,
    outputSchema: SessionSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
