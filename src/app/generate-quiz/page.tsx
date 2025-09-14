
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateQuiz, type GenerateQuizOutput } from '@/ai/flows/generate-quiz';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Share2, ClipboardCopy, Download, FileUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
];

const textFormSchema = z.object({
  lessonText: z.string().min(50, 'Le texte de la leçon doit contenir au moins 50 caractères.'),
  questionType: z.enum(['multiple choice', 'true/false', 'short answer']),
  numberOfQuestions: z.coerce.number().int().min(1).max(10),
});

const documentFormSchema = z.object({
  document: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, 'Un fichier est requis.')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `La taille maximum est de 5MB.`)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      'Uniquement les fichiers .pdf sont acceptés.'
    ),
  questionType: z.enum(['multiple choice', 'true/false', 'short answer']),
  numberOfQuestions: z.coerce.number().int().min(1).max(10),
});

const fileToDataURI = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};


export default function GenerateQuizPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [quizData, setQuizData] = useState<GenerateQuizOutput | null>(null);
  const [quizLink, setQuizLink] = useState('');
  const { toast } = useToast();
  
  const textForm = useForm<z.infer<typeof textFormSchema>>({
    resolver: zodResolver(textFormSchema),
    defaultValues: {
      lessonText: '',
      questionType: 'multiple choice',
      numberOfQuestions: 5,
    },
  });

  const documentForm = useForm<z.infer<typeof documentFormSchema>>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      document: undefined,
      questionType: 'multiple choice',
      numberOfQuestions: 5,
    },
  });
  const fileRef = documentForm.register('document');

  async function onTextSubmit(values: z.infer<typeof textFormSchema>) {
    setIsLoading(true);
    setQuizData(null);
    setQuizLink('');

    try {
      const result = await generateQuiz(values);
      handleQuizGenerationSuccess(result);
    } catch (error: any) {
      handleQuizGenerationError(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function onDocumentSubmit(values: z.infer<typeof documentFormSchema>) {
    setIsLoading(true);
    setQuizData(null);
    setQuizLink('');

    try {
      const file = values.document[0];
      const documentDataUri = await fileToDataURI(file);
      const result = await generateQuiz({
        documentDataUri,
        questionType: values.questionType,
        numberOfQuestions: values.numberOfQuestions,
      });
      handleQuizGenerationSuccess(result);
    } catch (error: any) {
      handleQuizGenerationError(error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleQuizGenerationSuccess(result: GenerateQuizOutput) {
    setQuizData(result);
    const dataStr = JSON.stringify(result);
    const encodedData = Buffer.from(dataStr).toString('base64');
    const link = `${window.location.origin}/quiz/${Date.now()}?data=${encodeURIComponent(encodedData)}`;
    setQuizLink(link);
  }

  function handleQuizGenerationError(error: any) {
    console.error(error);
    toast({
      title: 'Erreur',
      description: error.message || 'Une erreur est survenue lors de la génération du quiz.',
      variant: 'destructive',
    });
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(quizLink);
    toast({
        title: 'Copié !',
        description: 'Le lien du quiz a été copié dans le presse-papiers.'
    })
  }
  
  const handleExportCSV = () => {
    if (!quizData) return;

    const headers = ['question', 'choice_a', 'choice_b', 'choice_c', 'choice_d', 'correct'];
    const csvRows = [headers.join(',')];

    quizData.questions.forEach(q => {
        const escapedQuestion = `"${q.question.replace(/"/g, '""')}"`;
        
        let options = ['', '', '', ''];
        if (q.options.length > 0) {
            q.options.slice(0, 4).forEach((opt, i) => {
                options[i] = `"${opt.replace(/"/g, '""')}"`;
            });
        }

        const correctOptionIndex = q.options.findIndex(opt => opt.toLowerCase().trim() === q.answer.toLowerCase().trim());
        let correctLetter = q.answer;
        if (correctOptionIndex !== -1) {
            correctLetter = String.fromCharCode(65 + correctOptionIndex); // A, B, C, D...
        }
        
        const escapedAnswer = `"${correctLetter.replace(/"/g, '""')}"`;

        const row = [escapedQuestion, ...options, escapedAnswer];
        csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]); // UTF-8 BOM
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'quiz_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
        title: 'Exportation réussie',
        description: 'Le quiz a été téléchargé en tant que fichier CSV.',
    });
};

  return (
    <div className="space-y-8">
    <div>
        <h1 className="font-headline text-3xl md:text-4xl font-bold">
        Générateur de Quiz
        </h1>
        <p className="text-muted-foreground">
        Créez des évaluations rapidement à partir de votre contenu de cours.
        </p>
    </div>

    <Card>
        <CardHeader>
        <CardTitle>Créer un nouveau quiz</CardTitle>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text">À partir d'un texte</TabsTrigger>
                <TabsTrigger value="document">À partir d'un document</TabsTrigger>
              </TabsList>
              
              <TabsContent value="text" className="pt-4">
                <Form {...textForm}>
                  <form onSubmit={textForm.handleSubmit(onTextSubmit)} className="space-y-6">
                    <FormField
                      control={textForm.control}
                      name="lessonText"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>Texte de la leçon</FormLabel>
                          <FormControl>
                          <Textarea
                              placeholder="Collez ici le contenu de votre leçon..."
                              className="min-h-[200px]"
                              {...field}
                          />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={textForm.control}
                            name="questionType"
                            render={({ field }) => <SharedQuestionOptions {...field} />}
                        />
                         <FormField
                            control={textForm.control}
                            name="numberOfQuestions"
                            render={({ field }) => <SharedNumberOptions {...field} />}
                        />
                    </div>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Générer le quiz
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="document" className="pt-4">
                 <Form {...documentForm}>
                  <form onSubmit={documentForm.handleSubmit(onDocumentSubmit)} className="space-y-6">
                    <FormField
                      control={documentForm.control}
                      name="document"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fichier de la leçon</FormLabel>
                          <FormControl>
                          <div className="relative">
                              <FileUp className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <Input type="file" className="pl-10" {...fileRef} accept=".pdf" />
                          </div>
                          </FormControl>
                           <p className="text-sm text-muted-foreground">Format accepté : PDF. Taille max : 5MB.</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <FormField
                            control={documentForm.control}
                            name="questionType"
                            render={({ field }) => <SharedQuestionOptions {...field} />}
                        />
                         <FormField
                            control={documentForm.control}
                            name="numberOfQuestions"
                            render={({ field }) => <SharedNumberOptions {...field} />}
                        />
                    </div>
                     <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Générer le quiz
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
    
    {quizData && (
        <Card>
        <CardHeader>
            <CardTitle>Quiz Généré</CardTitle>
        </CardHeader>
        <CardContent>
            <div
            className="prose dark:prose-invert max-w-none"
            >
                {quizData.questions.map((q, i) => (
                    <div key={i} className="mb-4">
                        <p><strong>{i+1}. {q.question}</strong></p>
                        <ul className="list-disc pl-5">
                            {q.options.map((opt, j) => (
                                <li key={j}>{opt}</li>
                            ))}
                        </ul>
                        <p className="text-sm text-green-600">Réponse : {q.answer}</p>
                    </div>
                ))}
            </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
            <div>
            <h3 className="font-semibold">Partager le quiz interactif</h3>
            <div className="flex w-full items-center space-x-2 mt-2">
                <Input value={quizLink} readOnly />
                <Button variant="outline" size="icon" onClick={copyToClipboard}>
                    <ClipboardCopy className="h-4 w-4" />
                </Button>
            </div>
            <Button asChild className="mt-2">
                <Link href={quizLink} target="_blank">
                    Ouvrir le quiz interactif <Share2 className="ml-2 h-4 w-4"/>
                </Link>
            </Button>
            </div>
            
            <Separator className="my-2"/>

            <div>
            <h3 className="font-semibold">Exporter le quiz</h3>
            <div className="mt-2">
                <Button variant="outline" onClick={handleExportCSV}>
                    <Download className="mr-2 h-4 w-4"/>
                    Exporter en CSV
                </Button>
            </div>
            </div>
        </CardFooter>
        </Card>
    )}
    </div>
  );
}


// Helper components to avoid repetition
function SharedQuestionOptions(field: any) {
  return (
    <FormItem>
      <FormLabel>Type de questions</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez un type" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="multiple choice">Choix multiples (QCM)</SelectItem>
          <SelectItem value="true/false">Vrai/Faux</SelectItem>
          <SelectItem value="short answer">Réponse courte</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
}

function SharedNumberOptions(field: any) {
    return (
        <FormItem>
            <FormLabel>Nombre de questions</FormLabel>
            <FormControl>
                <Input type="number" {...field} />
            </FormControl>
            <FormMessage />
        </FormItem>
    );
}

