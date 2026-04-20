import { Role } from '../types';

const PERMISSIONS: Record<Role, string[]> = {
  ADMIN: ['*'],
  ENCARGADO_TURNO: ['patients:read', 'patients:create', 'patients:update', 'triage:read', 'attentions:read', 'shifts:read', 'shifts:create', 'shifts:update', 'emergency:sos', 'emergency:transfer', 'discharge', 'reports:*', 'dashboard:*', 'events:create', 'events:update', 'congregations:read', 'contacts:read', 'contacts:create', 'contacts:update'],
  ENCARGADO_SALUD: ['patients:read', 'patients:create', 'patients:update', 'triage:read', 'triage:create', 'triage:update', 'attentions:read', 'attentions:create', 'attentions:update', 'measurements:read', 'measurements:create', 'measurements:update', 'discharge', 'emergency:sos', 'emergency:transfer', 'emergency:camillero', 'supplies:read', 'supplies:create', 'supplies:update', 'reports:*', 'dashboard:*'],
  DOCTOR: ['patients:read', 'triage:read', 'triage:create', 'triage:update', 'attentions:read', 'attentions:create', 'attentions:update', 'measurements:read', 'measurements:create', 'measurements:update', 'discharge', 'emergency:sos', 'emergency:transfer', 'emergency:camillero', 'reports:*', 'dashboard:*'],
  ASISTENTE: ['patients:create', 'patients:read', 'triage:read', 'triage:create', 'triage:update', 'attentions:create', 'attentions:update', 'measurements:read', 'measurements:create', 'measurements:update', 'emergency:camillero', 'dashboard:*'],
  CAMILLERO: ['dashboard:read'],
  CONSULTA: ['dashboard:read', 'reports:read'],
};

export function hasPermission(role: Role | undefined, permission: string): boolean {
  if (!role) return false;
  // Only SUPER ADMIN can delete anything
  if (permission.endsWith(':delete')) return role === 'ADMIN';
  const perms = PERMISSIONS[role] || [];
  if (perms.includes('*')) return true;
  if (perms.includes(permission)) return true;
  const [resource] = permission.split(':');
  if (perms.includes(`${resource}:*`)) return true;
  return false;
}
