import type { z } from "zod";

export function getCredentials() {
  const API_KEY = process.env.LASTFM_API_KEY;
  const USERNAME = process.env.LASTFM_USERNAME;
  const API_URL = "https://ws.audioscrobbler.com/2.0/";

  if (!API_KEY || !USERNAME) {
    throw new Error(
      "Missing Last.fm API Key or Username in environment variables."
    );
  }

  return { API_KEY, USERNAME, API_URL };
}

export function asArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

export async function lastfmRequest<T>({
  method,
  params = {},
  schema,
  revalidate,
  label,
}: {
  method: string;
  params?: Record<string, string>;
  schema: z.ZodTypeAny;
  revalidate: number;
  label: string;
}): Promise<T> {
  const { API_KEY, USERNAME, API_URL } = getCredentials();

  const searchParams = new URLSearchParams({
    method,
    user: USERNAME,
    api_key: API_KEY,
    format: "json",
    ...params,
  });

  const url = `${API_URL}?${searchParams.toString()}`;

  const response = await fetch(
    url,
    revalidate === 0
      ? { cache: "no-store" }
      : { next: { revalidate } }
  );

  if (!response.ok) {
    const responseText = await response
      .text()
      .catch(() => "<failed to read body>");
    console.error(`Last.fm ${label} fetch failed`, {
      status: response.status,
      statusText: response.statusText,
      url,
      responseText,
    });
    throw new Error(
      `Failed to fetch ${label} from Last.fm: ${response.statusText}`
    );
  }

  const data = await response.json();
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    console.error(`Last.fm ${label} parse error`, parsed.error.format());
    throw new Error(`Failed to parse ${label} data from Last.fm API.`);
  }

  return parsed.data as T;
}
