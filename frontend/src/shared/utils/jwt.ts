// Grab existing jwt userToken if any, and find the expiry time of that token.
export function getJwtExpMs(token: string): number | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    // convert any token characters that are not base64-compatible
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const parsed = JSON.parse(json) as { exp?: number };
    if (!parsed.exp) return null;

    return parsed.exp * 1000;
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string, skewMs = 5000): boolean {
  // skewMs at 5 seconds is for buffer to make app assume token is expired 5s before it actually expires
  const expMs = getJwtExpMs(token);
  if (!expMs) return true;
  return Date.now() >= expMs - skewMs;
}
