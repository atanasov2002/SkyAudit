import { redirect } from "react-router";
import { getValidToken } from "../../lib/util";

export interface TokenPayload {
  sub: string;
  email: string;
  exp: number;
  iat: number;
  fullName?: string;
  company?: string;
}

export async function requireAuth(request: Request): Promise<TokenPayload> {
  // Get cookies from request header (server-side) or document.cookie (client-side)
  const cookieHeader =
    typeof document === "undefined"
      ? request.headers.get("cookie") || ""
      : document.cookie;

  console.log("🔐 [requireAuth] Checking authentication...");
  console.log(
    "🍪 [requireAuth] Cookie header:",
    cookieHeader ? "Present" : "Missing"
  );

  // Validate token (NO caching - always fresh check)
  const user = getValidToken(cookieHeader);

  if (!user) {
    console.log("❌ [requireAuth] No valid token found, redirecting to login");
    // No valid token - redirect to login
    throw redirect("/login");
  }

  console.log("✅ [requireAuth] Valid token found for user:", user.email);
  console.log(
    "⏰ [requireAuth] Token expires at:",
    new Date(user.exp * 1000).toISOString()
  );

  // Return user data to the route component
  return user;
}

export function checkAuth(request: Request): TokenPayload | null {
  const cookieHeader =
    typeof document === "undefined"
      ? request.headers.get("cookie") || ""
      : document.cookie;

  return getValidToken(cookieHeader);
}
