import type { ReactNode } from 'react';
import { useUser } from '@clerk/react';

export function AuthProvider({ children }: { children: ReactNode }) {
  return children;
}

export function useAuth() {
  const { user, isLoaded } = useUser();
  return {
    user,
    userData: user
      ? {
          email: user.primaryEmailAddress?.emailAddress ?? '',
          displayName: user.fullName ?? '',
        }
      : null,
    loading: !isLoaded,
    isSubscribed: user?.publicMetadata?.subscription === 'active',
  };
}