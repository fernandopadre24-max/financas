'use server';
/**
 * @fileOverview This file defines a Genkit flow for providing automated budget recommendations based on user's income and expense data.
 *
 * - automatedBudgetRecommendations - A function that takes income and expense data as input and returns personalized budget recommendations.
 * - AutomatedBudgetRecommendationsInput - The input type for the automatedBudgetRecommendations function.
 * - AutomatedBudgetRecommendationsOutput - The return type for the automatedBudgetRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomatedBudgetRecommendationsInputSchema = z.object({
  income: z.number().describe('The total income of the user.'),
  expenses: z.array(z.object({
    category: z.string().describe('The category of the expense.'),
    amount: z.number().describe('The amount spent in that category.'),
  })).describe('The list of expenses of the user, with category and amount.'),
});
export type AutomatedBudgetRecommendationsInput = z.infer<typeof AutomatedBudgetRecommendationsInputSchema>;

const AutomatedBudgetRecommendationsOutputSchema = z.object({
  recommendations: z.string().describe('Personalized budget recommendations based on the provided income and expenses.'),
});
export type AutomatedBudgetRecommendationsOutput = z.infer<typeof AutomatedBudgetRecommendationsOutputSchema>;

export async function automatedBudgetRecommendations(input: AutomatedBudgetRecommendationsInput): Promise<AutomatedBudgetRecommendationsOutput> {
  return automatedBudgetRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automatedBudgetRecommendationsPrompt',
  input: {schema: AutomatedBudgetRecommendationsInputSchema},
  output: {schema: AutomatedBudgetRecommendationsOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the user's income and expenses to provide personalized budget recommendations.

  Income: {{{income}}}
  Expenses:
  {{#each expenses}}
  - Category: {{{category}}}, Amount: {{{amount}}}
  {{/each}}
  
  Based on this information, provide detailed and actionable recommendations to optimize their spending and savings.
  Consider suggesting specific areas where they can cut expenses or allocate more funds to savings.
  The recommendations should be clear, concise, and easy to understand. Focus on providing practical advice that the user can implement immediately.
  Make it specific to the information given, and do not make assumptions about any other financial information.
  Respond in first person.
  You MUST respond with a comprehensive set of budget recommendations.
  `,
});

const automatedBudgetRecommendationsFlow = ai.defineFlow(
  {
    name: 'automatedBudgetRecommendationsFlow',
    inputSchema: AutomatedBudgetRecommendationsInputSchema,
    outputSchema: AutomatedBudgetRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
