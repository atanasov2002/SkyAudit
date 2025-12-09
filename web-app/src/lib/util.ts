import { jwtDecode } from "jwt-decode";

export interface TokenPayload {
  sub: string;
  email: string;
  exp: number;
  iat: number;
  name?: string;
  fullName?: string;
  company?: string;
}

// ============================================
// Cookie utilities (works in browser AND server)
// ============================================

export const getCookie = (
  name: string,
  cookieSource?: string
): string | null => {
  // Server-side: use cookieSource from request headers
  // Client-side: use document.cookie
  const cookieString =
    typeof document !== "undefined" ? document.cookie : cookieSource || "";

  if (!cookieString) return null;

  const value = `; ${cookieString}`;
  const parts = value.split(`; ${name}=`); // ← Fixed syntax error (was using template literal)

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }

  return null;
};

export const setCookie = (name: string, value: string, days: number) => {
  if (typeof document === "undefined") return; // Server-side guard

  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
};

export const deleteCookie = (name: string) => {
  if (typeof document === "undefined") return; // Server-side guard

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost`;
};

// ============================================
// Token validation (NO CACHING!)
// ============================================

export const getValidToken = (cookieSource?: string): TokenPayload | null => {
  const token = getCookie("accessToken", cookieSource);
  if (!token) return null;

  try {
    const decoded = jwtDecode<TokenPayload>(token);
    const isExpired = decoded.exp * 1000 < Date.now();
    return isExpired ? null : decoded;
  } catch {
    return null;
  }
};

// ============================================
// Auth state clearing (for logout)
// ============================================

export const clearAuthState = () => {
  if (typeof document === "undefined") return;

  // Method 1: Set expiry to past date (most reliable)
  const clearCookie = (name: string) => {
    // Clear with all possible path/domain combinations
    const hostname = window.location.hostname;

    const configs = [
      // Without domain (most reliable for localhost)
      { path: "/" },
      { path: "" },
      // With explicit domain
      { path: "/", domain: hostname },
      { path: "", domain: hostname },
      // With dot prefix
      { path: "/", domain: `.${hostname}` },
    ];

    configs.forEach(({ path, domain }) => {
      const domainStr = domain ? `; domain=${domain}` : "";
      const pathStr = path ? `; path=${path}` : "";

      // Set expiry to past date
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC${pathStr}${domainStr}`;
      // Also set Max-Age=0
      document.cookie = `${name}=; Max-Age=0${pathStr}${domainStr}`;
    });
  };

  // Clear both tokens
  clearCookie("accessToken");
  clearCookie("refreshToken");

  if (
    document.cookie.includes("accessToken") ||
    document.cookie.includes("refreshToken")
  ) {
    console.warn("⚠️ Cookies still present after clear attempt!");

    // Split all cookies and try to clear each one
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      if (name === "accessToken" || name === "refreshToken") {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
      }
    });
  }
};

// import { jwtDecode } from "jwt-decode";

// export interface TokenPayload {
//   sub: string;
//   email: string;
//   exp: number;
//   iat: number;
//   name?: string;
// }

// // Cookie utilities
// export const getCookie = (name: string, cookieHeader: string): string | null => {
//   if (typeof document === "undefined") return null;
//   const value = `; ${document.cookie}`;
//   const parts = value.split(`; ${name}=`);
//   if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
//   return null;
// };

// export const setCookie = (name: string, value: string, days: number) => {
//   const expires = new Date(Date.now() + days * 864e5).toUTCString();
//   document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
// };

// export const deleteCookie = (name: string) => {
//   document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost`;
// };

// // Validate and decode token
// export const getValidToken = (): TokenPayload | null => {
//   const token = getCookie("accessToken");
//   if (!token) return null;

//   try {
//     const decoded = jwtDecode<TokenPayload>(token);
//     const isExpired = decoded.exp * 1000 < Date.now();
//     return isExpired ? null : decoded;
//   } catch {
//     return null;
//   }
// };
