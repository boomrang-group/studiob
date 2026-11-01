import type { ReactNode } from 'react';
import { useUser } from '@clerk/react';

export function AuthProvider({ children }: { children: ReactNode }) {
  return children;
}

export function useAuth() {
  const hasClerkKey = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

  let clerkUser = null;
  let isLoaded = true;

  if (hasClerkKey) {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const clerk = useUser();
      clerkUser = clerk.user;
      isLoaded = clerk.isLoaded;
    } catch {
      // ClerkProvider is not mounted or errored
      isLoaded = true;
    }
  }

  return {
    user: clerkUser,
    userData: clerkUser
      ? {
          email: clerkUser.primaryEmailAddress?.emailAddress ?? '',
          displayName: clerkUser.fullName ?? '',
        }
      : null,
    loading: !isLoaded,
    isSubscribed: clerkUser?.publicMetadata?.subscription === 'active',
  };
}
