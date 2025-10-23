
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
  income: z.number().describe('A renda total do usuário.'),
  expenses: z.array(z.object({
    category: z.string().describe('A categoria da despesa.'),
    amount: z.number().describe('O valor gasto nessa categoria.'),
  })).describe('A lista de despesas do usuário, com categoria e valor.'),
});
export type AutomatedBudgetRecommendationsInput = z.infer<typeof AutomatedBudgetRecommendationsInputSchema>;

const AutomatedBudgetRecommendationsOutputSchema = z.object({
  recommendations: z.string().describe('Recomendações de orçamento personalizadas com base na renda e despesas fornecidas.'),
});
export type AutomatedBudgetRecommendationsOutput = z.infer<typeof AutomatedBudgetRecommendationsOutputSchema>;

export async function automatedBudgetRecommendations(input: AutomatedBudgetRecommendationsInput): Promise<AutomatedBudgetRecommendationsOutput> {
  return automatedBudgetRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automatedBudgetRecommendationsPrompt',
  input: {schema: AutomatedBudgetRecommendationsInputSchema},
  output: {schema: AutomatedBudgetRecommendationsOutputSchema},
  prompt: `Você é um consultor financeiro pessoal. Analise a renda e as despesas do usuário para fornecer recomendações de orçamento personalizadas.

  Renda: {{{income}}}
  Despesas:
  {{#each expenses}}
  - Categoria: {{{category}}}, Valor: {{{amount}}}
  {{/each}}
  
  Com base nessas informações, forneça recomendações detalhadas e acionáveis para otimizar seus gastos e economias.
  Considere sugerir áreas específicas onde eles podem cortar despesas ou alocar mais fundos para economias.
  As recomendações devem ser claras, concisas e fáceis de entender. Concentre-se em fornecer conselhos práticos que o usuário possa implementar imediatamente.
  Seja específico para as informações fornecidas e não faça suposições sobre quaisquer outras informações financeiras.
  Responda na primeira pessoa.
  Você DEVE responder com um conjunto abrangente de recomendações de orçamento.
  Responda em Português do Brasil.
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
