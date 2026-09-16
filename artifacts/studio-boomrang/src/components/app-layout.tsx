
"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  BookCopy,
  Clapperboard,
  FileQuestion,
  FileText,
  LayoutDashboard,
  Settings,
  CircleUser,
  Crown,
  Film,
  LogIn,
  LogOut,
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useClerk } from '@clerk/react';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function BrandMark() {
  return (
    <span
      aria-hidden="true"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
    >
      SB
    </span>
  );
}

function SidebarNavigation() {
  const [pathname] = useLocation();

  const menuItems = [
    {
      href: '/dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
    },
    {
      href: '/generate-course',
      label: 'Générateur de Cours',
      icon: BookCopy,
    },
    {
      href: '/generate-script',
      label: 'Script Vidéo',
      icon: Clapperboard,
    },
    {
      href: '/edit-video',
      label: 'Editeur Vidéo',
      icon: Film,
    },
    {
      href: '/generate-quiz',
      label: 'Générateur de Quiz',
      icon: FileQuestion,
    },
    {
      href: '/summarize-document',
      label: 'Synthèse de Document',
      icon: FileText,
    },
  ];

  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            tooltip={item.label}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

function Header({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    return (
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        {children}
        <div className="flex-1 text-right">
            {!user && !loading && (
                 <Button asChild>
                    <Link href="/sign-in">
                        <LogIn className="mr-2 h-4 w-4" />
                        Accéder à l'app
                    </Link>
                </Button>
            )}
        </div>
        </header>
    );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [pathname, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut({ redirectUrl: basePath || '/' });
  };

  const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');
  const showSidebar = user && !loading && !isAuthPage;

  if (!showSidebar) {
      return (
        <>
            <Header>
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <BrandMark />
                    <span className="font-headline text-primary">Studio BoomRang</span>
                </Link>
            </Header>
            <main>{children}</main>
        </>
      )
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <BrandMark />
            <h2 className="text-xl font-bold font-headline text-primary">
              Studio BoomRang
            </h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNavigation />
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            {user && (
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/account'}>
                        <Link href="/account">
                            <CircleUser />
                            <span>Mon Compte</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            )}
             <SidebarMenuItem>
                {user ? (
                    <SidebarMenuButton onClick={handleSignOut}>
                        <LogOut/>
                        <span>Se déconnecter</span>
                    </SidebarMenuButton>
                ) : (
                      <SidebarMenuButton asChild isActive={pathname === '/sign-in'}>
                         <Link href="/sign-in">
                            <LogIn/>
                            <span>Se connecter</span>
                        </Link>
                    </SidebarMenuButton>
                )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header>
          <SidebarTrigger className="md:hidden" />
        </Header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
