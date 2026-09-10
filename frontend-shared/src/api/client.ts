const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(body || res.statusText, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

/**
 * headers引数はstaff側で認証トークン（Authorization: Bearer <token>）を付与するために使う。
 * patient側は渡さなければ従来通り。
 */
export const api = {
  get: <T>(path: string, headers?: HeadersInit) => request<T>(path, { headers }),
  post: <T>(path: string, data?: unknown, headers?: HeadersInit) =>
    request<T>(path, { method: "POST", body: data ? JSON.stringify(data) : undefined, headers }),
  patch: <T>(path: string, data?: unknown, headers?: HeadersInit) =>
    request<T>(path, { method: "PATCH", body: data ? JSON.stringify(data) : undefined, headers })
};

export function wsUrl(pathWithQuery: string): string {
  // path部分だけでなくクエリ文字列(?lang=en 等)も正しく解釈できるよう、
  // URLの相対参照として解決してからプロトコルだけws(s):に差し替える。
  const target = new URL(pathWithQuery, API_BASE_URL);
  target.protocol = target.protocol === "https:" ? "wss:" : "ws:";
  return target.toString();
}
