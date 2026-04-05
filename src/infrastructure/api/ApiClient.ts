const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000';

/**
 * Typed HTTP error thrown by ApiClient.
 * Carries the status code and the parsed response body so callers can
 * surface domain-specific messages (e.g. 404 → "product not found").
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly method: string,
    public readonly path: string,
    public readonly body?: unknown,
  ) {
    super(`API ${status} on ${method} ${path}`);
    this.name = 'ApiError';
  }

  get isNotFound()   { return this.status === 404; }
  get isServerError(){ return this.status >= 500; }
  get isClientError(){ return this.status >= 400 && this.status < 500; }
}

export class ApiClient {
  static async get<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => undefined);
      throw new ApiError(response.status, 'GET', path, body);
    }
    return response.json() as Promise<T>;
  }

  static async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => undefined);
      throw new ApiError(response.status, 'POST', path, errorBody);
    }
    return response.json() as Promise<T>;
  }
}
