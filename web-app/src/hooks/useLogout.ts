import { apiClient } from "@/lib/api-client";
import { clearAuthState } from "@/utils/auth/auth-util";
import { useNavigate } from "react-router";

export function useLogout() {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      // Get refresh token before clearing
      const refreshToken = getCookie("refreshToken", document.cookie);

      if (refreshToken) {
        // Call backend logout
        await apiClient.logout({ refreshToken });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear auth state regardless of API call success
      clearAuthState();

      // Use replace to prevent back button from returning to protected pages
      navigate("/login", { replace: true });

      // Force reload to clear any lingering state
      window.location.href = "/login";
    }
  };

  return logout;
}

function getCookie(name: string, cookieString: string): string | undefined {
  const value = `; ${cookieString}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}
