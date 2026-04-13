import { Role } from '../types';

const PERMISSIONS: Record<Role, string[]> = {
  ADMIN: ['*'],
  ENCARGADO: ['patients:*', 'triage:*', 'attentions:read', 'shifts:*', 'emergency:sos', 'emergency:transfer', 'discharge', 'reports:*', 'dashboard:*', 'events:*'],
  DOCTOR: ['patients:read', 'triage:*', 'attentions:*', 'measurements:*', 'discharge', 'emergency:*', 'reports:*', 'dashboard:*'],
  ASISTENTE: ['patients:create', 'patients:read', 'triage:*', 'attentions:create', 'attentions:update', 'measurements:*', 'emergency:camillero', 'dashboard:*'],
  CAMILLERO: ['dashboard:read'],
  CONSULTA: ['dashboard:read', 'reports:read'],
};

export function hasPermission(role: Role | undefined, permission: string): boolean {
  if (!role) return false;
  const perms = PERMISSIONS[role] || [];
  if (perms.includes('*')) return true;
  if (perms.includes(permission)) return true;
  const [resource] = permission.split(':');
  if (perms.includes(`${resource}:*`)) return true;
  return false;
}
