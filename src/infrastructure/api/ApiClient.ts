const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000';

export class ApiClient {
  static async get<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`API error ${response.status} on GET ${path}`);
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
      throw new Error(`API error ${response.status} on POST ${path}`);
    }
    return response.json() as Promise<T>;
  }
}
