export type AuthUser = { id: string; email?: string; user_metadata?: { full_name?: string } };
type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: AuthUser;
};

const sessionKey = "ilmivora.supabase.session";
const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"]?.replace(/\/$/, "");
const publishableKey = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

export const isSupabaseConfigured = Boolean(supabaseUrl && publishableKey);
export const isPreviewMode = !isSupabaseConfigured || import.meta.env.MODE === "test";

function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(sessionKey);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

function saveSession(session: AuthSession | null) {
  if (typeof window === "undefined") return;
  if (session) window.localStorage.setItem(sessionKey, JSON.stringify(session));
  else window.localStorage.removeItem(sessionKey);
  window.dispatchEvent(new Event("ilmivora-auth-change"));
}

async function authRequest<T>(path: string, body?: unknown): Promise<T> {
  if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");
  const response = await fetch(`${supabaseUrl}/auth/v1/${path}`, {
    method: "POST",
    headers: {
      apikey: publishableKey!,
      "content-type": "application/json",
    },
    body: JSON.stringify(body ?? {}),
  });
  const result = (await response.json()) as T & { msg?: string; message?: string; error_description?: string };
  if (!response.ok) {
    throw new Error(result.error_description ?? result.msg ?? result.message ?? "Supabase authentication failed.");
  }
  return result;
}

async function getAccessToken(): Promise<string | null> {
  const session = getStoredSession();
  if (!session) return null;
  if (!session.expires_at || session.expires_at * 1000 > Date.now() + 30_000) return session.access_token;
  try {
    const refreshed = await authRequest<AuthSession>("token?grant_type=refresh_token", {
      refresh_token: session.refresh_token,
    });
    saveSession({ ...refreshed, expires_at: refreshed.expires_at ?? Math.floor(Date.now() / 1000) + 3600 });
    return refreshed.access_token;
  } catch {
    saveSession(null);
    return null;
  }
}

/** Get a fresh Supabase access token for authenticated server routes. */
export async function getCurrentAccessToken(): Promise<string | null> {
  return getAccessToken();
}

export async function supabaseRest<T>(
  path: string,
  options: { method?: string; body?: unknown; prefer?: string; headers?: Record<string, string> } = {},
): Promise<{ data: T; response: Response }> {
  if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    apikey: publishableKey!,
    authorization: `Bearer ${token ?? publishableKey}`,
    ...options.headers,
  };
  if (options.body !== undefined) headers["content-type"] = "application/json";
  if (options.prefer) headers["prefer"] = options.prefer;

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    method: options.method ?? "GET",
    headers,
    ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
  });
  const text = await response.text();
  const data = text ? (JSON.parse(text) as T & { message?: string; details?: string }) : (null as T);
  if (!response.ok) {
    const error = data as { message?: string; details?: string } | null;
    throw new Error(error?.message ?? error?.details ?? `Supabase request failed (${response.status}).`);
  }
  return { data, response };
}

export async function signInWithPassword(email: string, password: string): Promise<AuthSession> {
  const session = await authRequest<AuthSession>("token?grant_type=password", { email, password });
  saveSession({ ...session, expires_at: session.expires_at ?? Math.floor(Date.now() / 1000) + 3600 });
  return session;
}

export async function signUpWithPassword(email: string, password: string, fullName: string): Promise<AuthSession | null> {
  const session = await authRequest<AuthSession>("signup", {
    email,
    password,
    data: { full_name: fullName },
  });
  if (session.access_token) {
    saveSession({ ...session, expires_at: session.expires_at ?? Math.floor(Date.now() / 1000) + 3600 });
    return session;
  }
  return null;
}

export function signOut() {
  saveSession(null);
}

export function getCurrentAuthUser(): AuthUser | null {
  return getStoredSession()?.user ?? null;
}

export function subscribeToAuthChanges(callback: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("ilmivora-auth-change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("ilmivora-auth-change", callback);
    window.removeEventListener("storage", callback);
  };
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  if (!getStoredSession()) return false;
  const query = new URLSearchParams({ select: "email", limit: "1" });
  const { data } = await supabaseRest<Array<{ email: string }>>(`admin_users?${query}`);
  return data.length > 0;
}

export function getSupabaseStorageUrl(path: string): string {
  if (!supabaseUrl) throw new Error("Supabase is not configured.");
  return `${supabaseUrl}/storage/v1/object/public/subject-intros/${path}`;
}

export async function uploadSubjectIntroImage(slug: string, file: Blob, contentType: string): Promise<string> {
  if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");
  const token = await getAccessToken();
  const ext = contentType.split("/")[1]?.replace("jpeg", "jpg") ?? "img";
  const path = `${encodeURIComponent(slug)}/${crypto.randomUUID()}.${ext}`;
  const response = await fetch(`${supabaseUrl}/storage/v1/object/subject-intros/${path}`, {
    method: "POST",
    headers: {
      apikey: publishableKey!,
      authorization: `Bearer ${token ?? publishableKey}`,
      "content-type": contentType,
      "x-upsert": "true",
    },
    body: file,
  });
  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(error?.message ?? "Could not upload the subject image.");
  }
  return getSupabaseStorageUrl(path);
}

export async function deleteSubjectIntroImage(url: string): Promise<void> {
  const marker = "/storage/v1/object/public/subject-intros/";
  const path = url.split(marker)[1];
  if (!path || !isSupabaseConfigured) return;
  const token = await getAccessToken();
  const response = await fetch(`${supabaseUrl}/storage/v1/object/subject-intros/${path}`, {
    method: "DELETE",
    headers: { apikey: publishableKey!, authorization: `Bearer ${token ?? publishableKey}` },
  });
  if (!response.ok && response.status !== 404) throw new Error("Could not remove the subject image.");
}
