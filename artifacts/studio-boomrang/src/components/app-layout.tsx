
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

function SidebarAccountActions() {
  const [pathname] = useLocation();
  const { user } = useAuth();
  const { signOut } = useClerk();

  return (
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
        <SidebarMenuButton onClick={() => signOut({ redirectUrl: basePath || '/' })}>
          <LogOut />
          <span>Se déconnecter</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function SidebarBrand() {
  return (
    <div className="flex items-center gap-3 px-5 py-5">
      <BrandMark />
      <div className="min-w-0">
        <p className="truncate font-headline text-lg font-bold leading-none text-primary">
          Studio BoomRang
        </p>
        <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Espace enseignant
        </p>
      </div>
    </div>
  );
}

function SidebarContents() {
  return (
    <>
      <SidebarHeader className="p-0">
        <SidebarBrand />
      </SidebarHeader>
      <SidebarContent className="px-3 py-3">
        <SidebarNavigation />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <SidebarAccountActions />
      </SidebarFooter>
    </>
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
  const [pathname] = useLocation();
  const { user, loading } = useAuth();

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
    <SidebarProvider className="bg-background">
      <div className="flex min-h-svh w-full">
        <aside
          aria-label="Navigation principale"
          className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex lg:w-72"
        >
          <SidebarContents />
        </aside>

        <div className="md:hidden">
          <Sidebar>
            <SidebarContents />
          </Sidebar>
        </div>

        <SidebarInset className="min-w-0">
          <Header>
            <SidebarTrigger className="md:hidden" />
            <div className="hidden min-w-0 md:block">
              <p className="truncate text-sm font-semibold text-foreground">
                {pathname === '/dashboard' ? 'Tableau de bord' : 'Studio BoomRang'}
              </p>
            </div>
          </Header>
          <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
