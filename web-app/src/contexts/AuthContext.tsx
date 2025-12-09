import { API_URL } from "@/app/config";
import {
  clearAuthState,
  deleteCookie,
  getCookie,
  getValidToken,
  TokenPayload,
} from "@/lib/util";
import { jwtDecode } from "jwt-decode";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router";

interface AuthContextType {
  user: TokenPayload | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  register: (data: RegisterData) => Promise<any>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  company: string;
  jobTitle?: string;
  phoneNumber?: string;
  teamSize?: string;
  cloudProviders?: string[];
  password: string;
  newsletter?: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// ============================================
// 3. AUTH PROVIDER
// ============================================

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<TokenPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check auth status on mount and validate token
  const refreshAuth = useCallback(() => {
    const validUser = getValidToken();
    setUser(validUser);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshAuth();

    // Revalidate every 30 seconds
    const interval = setInterval(refreshAuth, 30000);

    // Handle logout in other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "logout-event") {
        setUser(null);
        window.location.href = "/login";
      }
    };

    // Revalidate when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshAuth();
      }
    };

    // Handle browser back/forward cache
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        // Page restored from bfcache - revalidate
        refreshAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [refreshAuth]);

  // Auto-refresh access token before expiry
  useEffect(() => {
    if (!user) return;

    const timeUntilExpiry = user.exp * 1000 - Date.now();
    const refreshTime = timeUntilExpiry - 60000; // Refresh 1 min before expiry

    if (refreshTime > 0) {
      const timeout = setTimeout(async () => {
        await refreshAccessToken();
      }, refreshTime);

      return () => clearTimeout(timeout);
    }
  }, [user]);

  const register = async (userData: RegisterData) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      return data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  // ============================================
  // 4. LOGIN WITH ROTATING TOKENS
  // ============================================

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Important for cookies!
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Login failed");
      }

      const data = await response.json();

      // Cookies are set by backend automatically
      // Just validate and set user
      refreshAuth();

      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // ============================================
  // 5. TOKEN REFRESH (ROTATING REFRESH TOKENS)
  // ============================================

  const refreshAccessToken = async () => {
    try {
      const refreshToken = getCookie("refreshToken");
      if (!refreshToken) {
        await logout();
        return;
      }

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        credentials: "include",
      });

      if (!response.ok) {
        await logout();
        return;
      }

      // New tokens set via cookies automatically
      refreshAuth();
    } catch (error) {
      console.error("Token refresh error:", error);
      await logout();
    }
  };

  // ============================================
  // 6. LOGOUT (COMPLETE CLEANUP)
  // ============================================

  const logout = async () => {
    try {
      const refreshToken = getCookie("refreshToken");

      if (refreshToken) {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
          credentials: "include",
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      clearAuthState();

      if (typeof localStorage !== "undefined") {
        localStorage.setItem("logout-event", Date.now().toString());
        localStorage.removeItem("logout-event");
      }

      if (typeof window !== "undefined") {
        // This prevents the back button from working
        window.history.pushState(null, "", "/login");

        // Force a hard navigation (not using router)
        window.location.replace("/login");
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        register,
        login,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// import React, { createContext, useContext, useState, useEffect } from "react";
// import { useNavigate } from "react-router";
// import { useDispatch, useSelector } from "react-redux";
// import { API_URL } from "../app/config";
// import type { RootState } from "@/store";
// import { setUser, logoutUser } from "@/store/authSlice";
// import { getCachedUser, getCookie, setCachedUser } from "../lib/util";
// import { jwtDecode } from "jwt-decode";
// import { TokenPayload } from "@/features/auth/routeProtection";

// interface User {
//   id: string;
//   email: string;
//   fullName: string;
//   company: string;
//   jobTitle?: string;
//   teamSize?: string;
//   cloudProviders?: string[];
//   isEmailVerified: boolean;
// }

// interface RegisterData {
//   fullName: string;
//   email: string;
//   company: string;
//   jobTitle?: string;
//   phoneNumber?: string;
//   teamSize?: string;
//   cloudProviders?: string[];
//   password: string;
//   newsletter?: boolean;
// }

// const AuthContext = createContext({
//   loading: true,
//   user: null as any,
//   isAuthenticated: false,
//   step: "login" as "login" | "2fa",
//   tempToken: null as string | null,
//   login: async (email: string, password: string) => {},
//   register: async (data: RegisterData) => {},
//   verify2FA: async (code: string) => {},
//   logout: async () => {},
// });

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const authState = useSelector((state: RootState) => state.auth);

//   const [step, setStep] = useState<"login" | "2fa">("login");
//   const [tempToken, setTempToken] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   const [redirectPath, setRedirectPath] = useState<string | null>(null);

//   useEffect(() => {
//     if (redirectPath) {
//       navigate(redirectPath);
//       setRedirectPath(null);
//     }
//   }, [redirectPath]);

//   // ---------------------------
//   // ✅ LOCAL JWT LOGIN CHECK
//   // ---------------------------
//   useEffect(() => {
//     const cached = getCachedUser();
//     if (cached) {
//       dispatch(setUser(cached));
//       setLoading(false);
//       return;
//     }

//     const token = getCookie("accessToken");
//     if (!token) {
//       dispatch(logoutUser());
//       setLoading(false);
//       return;
//     }

//     try {
//       const decoded = jwtDecode<TokenPayload>(token);
//       if (decoded.exp * 1000 < Date.now()) {
//         dispatch(logoutUser());
//       } else {
//         const minimalUser = {
//           id: decoded.sub,
//           email: decoded.email,
//           fullName: decoded.fullName || "",
//           company: decoded.company || "",
//         };
//         dispatch(setUser(minimalUser));
//         setCachedUser(minimalUser);
//       }
//     } catch {
//       dispatch(logoutUser());
//     }

//     setLoading(false);
//   }, []);

//   // ---------------------
//   //     LOGIN USER
//   // ---------------------
//   const login = async (email: string, password: string) => {
//     try {
//       const response = await fetch(`${API_URL}/auth/login`, {
//         method: "POST",
//         credentials: "include",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data?.message || "Login failed");
//       }

//       if (data.requiresTwoFactor) {
//         setTempToken(data.tempToken);
//         setStep("2fa");
//         return { "2fa": true, token: data.tempToken };
//       }

//       // const profile = await fetch(`${API_URL}/auth/profile`, {
//       //   credentials: "include",
//       // });

//       // if (!profile.ok) return dispatch(logoutUser());

//       const userObj = data.user;
//       dispatch(setUser(userObj));
//       setCachedUser(userObj);

//       navigate(data.redirect || "/dashboard");
//     } catch (error) {
//       console.error("Login error:", error);
//       throw error;
//     }
//   };

//   // ---------------------
//   //   VERIFY 2FA CODE
//   // ---------------------
//   const verify2FA = async (code: string) => {
//     if (!tempToken) throw new Error("No temp session");

//     try {
//       const res = await fetch(`${API_URL}/auth/2fa/verify`, {
//         method: "POST",
//         credentials: "include",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ tempToken, code }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Invalid 2FA");

//       // read & decode the new token only
//       const token = getCookie("accessToken");
//       if (token) {
//         const decoded = jwtDecode<TokenPayload>(token);
//         const user = { id: decoded.sub, email: decoded.email };
//         dispatch(setUser(user));
//         setCachedUser(user);
//       }

//       // reset state
//       setStep("login");
//       setTempToken(null);

//       navigate(data.redirect || "/dashboard");
//     } catch (err) {
//       console.error("2FA verification failed:", err);
//       throw err;
//     }
//   };

//   const register = async (userData: RegisterData) => {
//     try {
//       const res = await fetch(`${API_URL}/auth/register`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(userData),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.message || "Registration failed");
//       }

//       return data;
//     } catch (error) {
//       console.error("Registration error:", error);
//       throw error;
//     }
//   };

//   const logout = async () => {
//     try {
//       await fetch(`${API_URL}/auth/logout`, {
//         method: "POST",
//         credentials: "include",
//       });
//     } catch (err) {
//       console.error("Logout failed:", err);
//     } finally {
//       dispatch(logoutUser());
//       navigate("/login");
//     }
//   };

//   const value = {
//     user: authState.user,
//     isAuthenticated: !!authState.user,
//     loading,
//     step,
//     tempToken,
//     login,
//     register,
//     logout,
//     verify2FA,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// export default AuthContext;
