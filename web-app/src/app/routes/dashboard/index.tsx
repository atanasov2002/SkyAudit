import DashboardPage from "@/pages/DashboardPage";
import type { Route } from "../+types/dashboard";
import { requireAuth } from "@/features/auth/routeProtection";
import React, { useEffect, useState } from "react";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const user = await requireAuth(request);

  return {
    user,
  };
};

export const headers = () => ({
  "Cache-Control":
    "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
  "Surrogate-Control": "no-store",
});

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const [isInitialMount, setIsInitialMount] = useState(true);

  useEffect(() => {
    // Mark that initial mount has completed
    setIsInitialMount(false);
  }, []);

  React.useEffect(() => {
    // Function to check auth and redirect if needed
    const verifyAuth = () => {
      const hasAccessToken = document.cookie.includes("accessToken");
      const hasRefreshToken = document.cookie.includes("refreshToken");

      console.log("🍪 Auth check:", { hasAccessToken, hasRefreshToken });

      if (!hasAccessToken && !hasRefreshToken) {
        console.log("❌ No tokens found, redirecting to login...");
        window.location.href = "/login";
        return false;
      }
      return true;
    };

    // Handle browser back-forward cache restoration
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        console.log("🔄 Page restored from bfcache, verifying auth...");
        verifyAuth();
      }
    };

    // Handle visibility change (tab becomes active)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !isInitialMount) {
        console.log("👁️ Tab became visible, verifying auth...");
        verifyAuth();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isInitialMount]);

  return (
    <div className="min-h-screen mx-[10vw]">
      <DashboardPage />
    </div>
  );
}
