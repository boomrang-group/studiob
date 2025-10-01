/**
 * @fileOverview Core logic for generating quizzes from lesson text or documents using AI.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const GenerateQuizInputSchema = z.object({
  lessonText: z
    .string()
    .optional()
    .describe('The lesson text to generate a quiz from.'),
  documentDataUri: z
    .string()
    .optional()
    .describe("A document to generate a quiz from, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  questionType: z
    .enum(['multiple choice', 'true/false', 'short answer'])
    .describe('The type of questions to generate.'),
  numberOfQuestions: z
    .number()
    .int()
    .positive()
    .default(5)
    .describe('The number of questions to generate.'),
});

export const QuestionSchema = z.object({
  question: z.string().describe('The question text.'),
  options: z.array(z.string()).describe('An array of possible answers.'),
  answer: z.string().describe('The correct answer.'),
});

export const GenerateQuizOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe("An array of quiz questions."),
});

export const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  model: googleAI.model('gemini-1.5-flash-latest'),
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are an expert quiz generator for teachers.

  You will generate a quiz in French from the given lesson content.
  The content can be provided as raw text or as a document. Use the content provided to create the quiz.

  The questions should be of the specified type. For multiple choice questions, provide 4 options. For true/false questions, provide "Vrai" and "Faux" as options. For short answer, the options array can be empty, but the answer field should contain the expected answer.
  
  {{#if lessonText}}
  Lesson Text: {{{lessonText}}}
  {{/if}}
  {{#if documentDataUri}}
  Lesson Document: {{media url=documentDataUri}}
  {{/if}}

  Question Type: {{{questionType}}}
  Number of Questions: {{{numberOfQuestions}}}

  The output must be a valid JSON object matching the requested schema.
  `,
});

export const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    if (!input.lessonText && !input.documentDataUri) {
      throw new Error('Either lesson text or a document must be provided.');
    }
    const {output} = await prompt(input);
    return output!;
  }
);
