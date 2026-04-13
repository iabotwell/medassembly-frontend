import { useAuthStore } from '../stores/authStore';
import { hasPermission } from '../lib/permissions';

export function usePermissions() {
  const { user } = useAuthStore();

  return {
    can: (permission: string) => hasPermission(user?.role, permission),
    role: user?.role,
  };
}
