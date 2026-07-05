/** Auth feature — prepared for future authentication & RBAC */
export type AuthStatus = 'anonymous' | 'authenticated';

export interface AuthPlaceholder {
  status: AuthStatus;
  userId: null;
  roles: [];
}

export const authPlaceholder: AuthPlaceholder = {
  status: 'anonymous',
  userId: null,
  roles: [],
};
