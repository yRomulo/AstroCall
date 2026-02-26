'use server';
/**
 * @fileOverview A Genkit flow for generating personalized post-call reflection prompts.
 *
 * - generatePostCallReflections - A function that handles the generation of reflection prompts.
 * - PostCallReflectionsInput - The input type for the generatePostCallReflections function.
 * - PostCallReflectionsOutput - The return type for the generatePostCallReflections function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PostCallReflectionsInputSchema = z.object({
  sessionThemes: z
    .array(z.string())
    .describe('Key themes or topics discussed during the astrology session.'),
  sessionSummary: z
    .string()
    .describe('A brief summary or overview of the astrology session.'),
});
export type PostCallReflectionsInput = z.infer<
  typeof PostCallReflectionsInputSchema
>;

const PostCallReflectionsOutputSchema = z.object({
  reflectionPrompts: z
    .array(z.string())
    .describe('A list of personalized reflection prompts.'),
});
export type PostCallReflectionsOutput = z.infer<
  typeof PostCallReflectionsOutputSchema
>;

export async function generatePostCallReflections(
  input: PostCallReflectionsInput
): Promise<PostCallReflectionsOutput> {
  return postCallReflectionsFlow(input);
}

const generatePostCallReflectionsPrompt = ai.definePrompt({
  name: 'generatePostCallReflectionsPrompt',
  input: {schema: PostCallReflectionsInputSchema},
  output: {schema: PostCallReflectionsOutputSchema},
  prompt: `You are an AI assistant designed to help users reflect on their astrology sessions.

Based on the following themes and summary from an astrology session, generate 3-5 personalized, thought-provoking reflection prompts or journal starters. The prompts should help the user process and integrate the insights gained from their call.

Themes: {{{sessionThemes}}}
Summary: {{{sessionSummary}}}

Ensure the prompts are open-ended and encourage deep personal introspection.`, 
});

const postCallReflectionsFlow = ai.defineFlow(
  {
    name: 'postCallReflectionsFlow',
    inputSchema: PostCallReflectionsInputSchema,
    outputSchema: PostCallReflectionsOutputSchema,
  },
  async (input) => {
    const {output} = await generatePostCallReflectionsPrompt(input);
    return output!;
  }
);
