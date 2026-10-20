import { Platform } from 'react-native';

/**
 * api.ts — HTTP client for the CALSIO backend.
 * Base URL: EXPO_PUBLIC_API_URL overrides; otherwise Android emulator uses 10.0.2.2
 * (the emulator's alias for host localhost), iOS/web use localhost.
 */
const envUrl = process.env.EXPO_PUBLIC_API_URL;

export const API_URL =
  envUrl ?? Platform.select({ android: 'http://10.0.2.2:4000', default: 'http://localhost:4000' });

export class ApiError extends Error {
  payload: Record<string, unknown>;
  status: number;
  constructor(message: string, status: number, payload: Record<string, unknown>) {
    super(message);
    this.payload = payload;
    this.status = status;
  }
}

export async function api<T>(
  path: string,
  opts: { method?: 'GET' | 'POST'; body?: unknown; token?: string | null } = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: opts.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const payload = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new ApiError((payload.error as string) ?? res.statusText, res.status, payload);
  }
  return payload as T;
}
