export async function apiRequest<T>(method: string, url: string, body?: any): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include"
  });
  if (!res.ok) throw new Error(await res.text());
  // Only parse JSON if there is content
  if (res.status === 204) return undefined as T;
  return res.json();
}