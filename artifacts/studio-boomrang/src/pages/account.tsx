
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@clerk/react';
import { Loader2, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

export default function AccountPage() {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);

  const primaryEmail = user?.primaryEmailAddress?.emailAddress ?? '';
  const authenticationMethod = useMemo(() => {
    const provider = user?.externalAccounts?.[0]?.provider?.replace(/^oauth_/, '');
    if (!provider) return 'E-mail et mot de passe';

    const labels: Record<string, string> = {
      google: 'Google',
      github: 'GitHub',
      apple: 'Apple',
      x: 'X',
      twitter: 'X',
    };

    return labels[provider] ?? provider;
  }, [user?.externalAccounts]);

  useEffect(() => {
    if (!user) return;

    const providerName =
      user.fullName ||
      [user.firstName, user.lastName].filter(Boolean).join(' ') ||
      user.username ||
      primaryEmail.split('@')[0];

    setFullName(providerName);
    void fetch('/api/email-preferences')
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load email preferences');
        return response.json() as Promise<{
          emailNotifications: boolean;
          marketingEmails: boolean;
        }>;
      })
      .then((preferences) => {
        setEmailNotifications(preferences.emailNotifications);
        setMarketingEmails(preferences.marketingEmails);
      })
      .catch(() => {
        toast({
          variant: 'destructive',
          title: 'Préférences indisponibles',
          description: 'Vos préférences e-mail n’ont pas pu être chargées.',
        });
      });
  }, [primaryEmail, toast, user]);

  const saveProfile = async () => {
    if (!user) return;

    const normalizedName = fullName.trim().replace(/\s+/g, ' ');
    if (!normalizedName) {
      toast({
        variant: 'destructive',
        title: 'Nom requis',
        description: 'Veuillez renseigner votre nom complet.',
      });
      return;
    }

    const [firstName, ...lastNameParts] = normalizedName.split(' ');
    setSavingProfile(true);
    try {
      await user.update({
        firstName,
        lastName: lastNameParts.join(' '),
      });
      toast({
        title: 'Profil mis à jour',
        description: 'Votre nom a bien été enregistré.',
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Modification impossible',
        description: 'Votre profil n’a pas pu être mis à jour. Réessayez dans un instant.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    setSavingPreferences(true);
    try {
      const response = await fetch('/api/email-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailNotifications, marketingEmails }),
      });
      if (!response.ok) throw new Error('Unable to save email preferences');
      toast({
        title: 'Préférences enregistrées',
        description: 'Vos choix de communication ont bien été mis à jour.',
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Enregistrement impossible',
        description: 'Vos préférences n’ont pas pu être enregistrées. Réessayez dans un instant.',
      });
    } finally {
      setSavingPreferences(false);
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Chargement du profil" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
          Paramètres personnels
        </p>
        <h1 className="font-headline text-3xl font-bold md:text-4xl">
          Mon Compte
        </h1>
        <p className="text-muted-foreground">
          Gérez les informations de votre profil et vos préférences.
        </p>
      </div>

      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserRound className="h-5 w-5" />
            </span>
            <div>
              <CardTitle>Profil</CardTitle>
              <CardDescription>
                Les informations associées à votre compte.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input
              id="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Adresse e-mail</Label>
            <Input id="email" type="email" value={primaryEmail} readOnly />
            <p className="text-xs text-muted-foreground">
              Adresse principale vérifiée par votre méthode de connexion.
            </p>
          </div>
          <Separator />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Connexion avec {authenticationMethod}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={saveProfile} disabled={savingProfile}>
            {savingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sauvegarder les modifications
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <CardTitle>Préférences e-mail</CardTitle>
              <CardDescription>
                Choisissez les communications que vous souhaitez recevoir.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5 pr-6">
                    <Label htmlFor="email-notifications" className="text-base">Notifications par e-mail</Label>
                    <p className="text-sm text-muted-foreground">
                        Recevoir les informations importantes concernant votre compte et vos créations.
                    </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                  aria-label="Recevoir les notifications par e-mail"
                />
            </div>
             <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5 pr-6">
                    <Label htmlFor="marketing-emails" className="text-base">Offres et newsletters</Label>
                    <p className="text-sm text-muted-foreground">
                        Recevoir les offres promotionnelles, conseils et newsletters de Studio BoomRang.
                    </p>
                </div>
                <Switch
                  id="marketing-emails"
                  checked={marketingEmails}
                  onCheckedChange={setMarketingEmails}
                  aria-label="Recevoir les offres marketing et newsletters"
                />
            </div>
        </CardContent>
         <CardFooter>
          <Button onClick={savePreferences} disabled={savingPreferences}>
            {savingPreferences && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sauvegarder les préférences
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supprimer le compte</CardTitle>
          <CardDescription>
            Une fois votre compte supprimé, toutes vos données seront définitivement effacées. Cette action est irréversible.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="destructive">Je comprends, supprimer mon compte</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
