import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Route,
  Redirect,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';
import { AuthProvider } from '@/hooks/use-auth';
import { AppLayout } from '@/components/app-layout';

import Home from '@/pages/home';
import Login from '@/pages/login';
import Signup from '@/pages/signup';
import Dashboard from '@/pages/dashboard';
import GenerateCourse from '@/pages/generate-course';
import GenerateScript from '@/pages/generate-script';
import GenerateQuiz from '@/pages/generate-quiz';
import SummarizeDocument from '@/pages/summarize-document';
import Quiz from '@/pages/quiz';
import EditVideo from '@/pages/edit-video';
import Account from '@/pages/account';
import Checkout from '@/pages/checkout';
import Subscribe from '@/pages/subscribe';
import Confirmation from '@/pages/confirmation';
import PaymentStatus from '@/pages/payment-status';

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || '/'
    : path;
}

function Router() {
  return (
    <AuthProvider>
      <AppLayout>
        <RoutedErrorBoundary>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/login"><Redirect to="/sign-in" /></Route>
            <Route path="/signup"><Redirect to="/sign-up" /></Route>
            <Route path="/sign-in/*?" component={Login} />
            <Route path="/sign-up/*?" component={Signup} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/generate-course" component={GenerateCourse} />
            <Route path="/generate-script" component={GenerateScript} />
            <Route path="/generate-quiz" component={GenerateQuiz} />
            <Route path="/summarize-document" component={SummarizeDocument} />
            <Route path="/quiz/:quizId" component={Quiz} />
            <Route path="/edit-video" component={EditVideo} />
            <Route path="/account" component={Account} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/subscribe" component={Subscribe} />
            <Route path="/confirmation" component={Confirmation} />
            <Route path="/payment-status" component={PaymentStatus} />
            <Route component={NotFound} />
          </Switch>
        </RoutedErrorBoundary>
      </AppLayout>
    </AuthProvider>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={{
        theme: shadcn,
        variables: {
          colorPrimary: '#5b0b98',
          colorBackground: '#ffffff',
          colorForeground: '#17131c',
          colorMutedForeground: '#6f6877',
          fontFamily: '"PT Sans", sans-serif',
          borderRadius: '0.75rem',
        },
        options: {
          logoPlacement: 'inside',
          logoLinkUrl: basePath || '/',
          logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
        },
      }}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: 'Bon retour', subtitle: 'Connectez-vous à Studio BoomRang' } },
        signUp: { start: { title: 'Créer un compte', subtitle: 'Commencez à créer avec Studio BoomRang' } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function Root() {
  return (
    <WouterRouter base={basePath}>
      <App />
    </WouterRouter>
  );
}

export default Root;
