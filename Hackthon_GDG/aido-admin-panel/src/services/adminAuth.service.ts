const USERS_ENDPOINT = (import.meta.env.VITE_UNIFIED_API_ENDPOINT || '').replace(/\/$/, '');
const API_BASE_URL = USERS_ENDPOINT.replace(/\/users$/, '');
const TOKEN_KEY = 'aido_admin_token';
const EMAIL_KEY = 'aido_admin_email';

export async function loginAdmin(email: string, password: string): Promise<string> {
  if (!API_BASE_URL) {
    throw new Error('Configure VITE_UNIFIED_API_ENDPOINT to connect to the AIDO API.');
  }
  const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json() as { token?: string; user?: { email?: string }; error?: string };
  if (!response.ok || !data.token || !data.user?.email) {
    throw new Error(data.error || 'Admin sign-in failed.');
  }
  sessionStorage.setItem(TOKEN_KEY, data.token);
  sessionStorage.setItem(EMAIL_KEY, data.user.email);
  return data.user.email;
}

export function getAdminSession(): string | null {
  if (!sessionStorage.getItem(TOKEN_KEY)) return null;
  return sessionStorage.getItem(EMAIL_KEY);
}

export function getAdminToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem('aido_admin_session');
}
