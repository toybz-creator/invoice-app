export const fallbackSessionCookieName = "invoice-app-session";

export function getSessionCookieName(projectId?: string) {
  return projectId ? `a_session_${projectId}` : fallbackSessionCookieName;
}

export function getSessionCookieOptions(expires?: string) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expires ? new Date(expires) : undefined,
  };
}
