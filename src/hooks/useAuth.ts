import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';

export function useAuth() {
  const { user, isAuthenticated, setUser, logout } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !user) {
      authService.getProfile()
        .then(setUser)
        .catch(() => logout());
    }
  }, [isAuthenticated, user, setUser, logout]);

  return { user, isAuthenticated, logout };
}
