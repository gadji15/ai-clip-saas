import 'server-only';

type LaravelConfig = {
  baseUrl: string;
  internalApiSecret: string;
};

export function getLaravelConfig(): LaravelConfig {
  return {
    baseUrl: process.env.LARAVEL_BASE_URL ?? 'http://localhost:8080',
    internalApiSecret: process.env.INTERNAL_API_SECRET ?? 'change-me',
  };
}

export async function laravelInternalFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const { baseUrl, internalApiSecret } = getLaravelConfig();
  const url = new URL(path, baseUrl);

  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  headers.set('X-Internal-Secret', internalApiSecret);

  return fetch(url, {
    ...init,
    headers,
    cache: init.cache ?? 'no-store',
  });
}
