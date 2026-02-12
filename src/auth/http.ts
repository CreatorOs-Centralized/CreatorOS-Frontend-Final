export class HttpError extends Error {
  status: number;
  body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.body = body;
  }
}

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, init);

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  let body: unknown = undefined;
  if (isJson) {
    try {
      body = await response.json();
    } catch {
      body = undefined;
    }
  } else {
    try {
      body = await response.text();
    } catch {
      body = undefined;
    }
  }

  if (!response.ok) {
    const message =
      typeof body === "string" && body ? body : `HTTP ${response.status}`;
    throw new HttpError(message, response.status, body);
  }

  return body as T;
}

export async function fetchNoContent(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<void> {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new HttpError(`HTTP ${response.status}`, response.status);
  }
}
