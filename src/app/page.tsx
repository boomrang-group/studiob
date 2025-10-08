
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookCopy, Clapperboard, FileQuestion } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

const features = [
  {
    icon: <BookCopy className="h-8 w-8 text-primary" />,
    title: 'Générateur de Cours',
    description: 'Créez des plans de leçon complets en quelques secondes.',
  },
  {
    icon: <Clapperboard className="h-8 w-8 text-primary" />,
    title: 'Générateur de Script Vidéo',
    description: 'Produisez des scripts vidéo captivants pour vos leçons.',
  },
  {
    icon: <FileQuestion className="h-8 w-8 text-primary" />,
    title: 'Générateur de Quiz',
    description: 'Élaborez des quiz interactifs pour évaluer vos élèves.',
  },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
               <Image
                src="https://picsum.photos/seed/42/600/400"
                width={600}
                height={400}
                alt="Un assistant IA pour les enseignants"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
                data-ai-hint="AI teacher"
                unoptimized
              />
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    L'assistant pédagogique tout-en-un pour les enseignants
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Studio BoomRang vous permet de créer du contenu de cours, des scripts vidéo, des quiz et bien plus encore, le tout alimenté par l'IA.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/signup">Commencer Gratuitement</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/login">Se Connecter</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Révolutionnez votre façon d'enseigner</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Gagnez du temps et créez du matériel pédagogique engageant avec nos outils intuitifs basés sur l'IA.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              {features.map((feature) => (
                 <Card key={feature.title} className="flex flex-col items-center text-center p-6">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                        {feature.icon}
                    </div>
                    <CardHeader className="p-0 mb-2">
                        <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                 </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
                Prêt à transformer votre enseignement ?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Rejoignez des milliers d'éducateurs qui font confiance à Studio BoomRang. Inscrivez-vous aujourd'hui.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <Button asChild size="lg" className="w-full">
                <Link href="/signup">
                    S'inscrire maintenant <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 Studio BoomRang. Tous droits réservés.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Termes & Conditions
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Politique de confidentialité
          </Link>
        </nav>
      </footer>
    </div>
  );
}
