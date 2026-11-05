import { UserData, UserRole } from '../types';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'
).replace(/\/$/, '');
const TOKEN_KEY = 'aido_access_token';

export interface AuthAccount extends UserData {
  id: string;
  accountType: 'seeker' | 'provider';
}

interface AuthResponse {
  token: string;
  user: AuthAccount;
}

interface ApiErrorResponse {
  error?: string;
}

class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  authenticated = false,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (authenticated) {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await response.json() as T & ApiErrorResponse;
  if (!response.ok) {
    if (response.status === 401 && authenticated) {
      clearAuthSession();
    }
    throw new ApiError(data.error || 'The request could not be completed.', response.status);
  }
  return data;
}

function saveAuthSession(response: AuthResponse): AuthAccount {
  sessionStorage.setItem(TOKEN_KEY, response.token);
  return response.user;
}

export function getUserRole(account: AuthAccount): UserRole {
  return account.accountType === 'provider' ? 'provider' : 'seeker';
}

export async function registerAccount(input: {
  name: string;
  mobile: string;
  password: string;
  accountType: 'seeker' | 'provider';
  skills?: string[];
}): Promise<AuthAccount> {
  const response = await request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return saveAuthSession(response);
}

export async function loginAccount(input: {
  mobile: string;
  password: string;
  accountType: 'seeker' | 'provider';
}): Promise<AuthAccount> {
  const response = await request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return saveAuthSession(response);
}

export async function restoreAuthSession(): Promise<AuthAccount | null> {
  if (!sessionStorage.getItem(TOKEN_KEY)) return null;
  try {
    const response = await request<{ user: AuthAccount }>('/auth/me', {}, true);
    return response.user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export function clearAuthSession(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

export async function submitReview(input: {
  jobId: string;
  targetName: string;
  targetMobile?: string;
  rating: number;
  comment: string;
}): Promise<void> {
  await request('/reviews', {
    method: 'POST',
    body: JSON.stringify(input),
  }, true);
}

export async function analyzeProblemImage(input: {
  imageDataUrl: string;
  service: string;
}): Promise<string> {
  const response = await request<{ description: string }>('/ai/analyze-image', {
    method: 'POST',
    body: JSON.stringify(input),
  }, true);
  return response.description;
}
