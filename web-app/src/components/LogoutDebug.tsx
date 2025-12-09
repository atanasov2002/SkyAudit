import { useAuth } from "@/contexts/AuthContext";
import { getCookie } from "@/lib/util";
import { useEffect, useState } from "react";

export default function LogoutDebug() {
  const { logout } = useAuth();
  const [cookieString, setCookieString] = useState("(loading...)");

  // Only run on client
  useEffect(() => {
    if (typeof document !== "undefined") {
      setCookieString(document.cookie || "(no cookies)");
    }
  }, []);

  const handleDebugLogout = async () => {
    if (typeof document === "undefined") return;

    console.log("🔴 [LOGOUT] Starting logout process...");
    console.log("🍪 [LOGOUT] Cookies BEFORE:", document.cookie);

    try {
      await logout();
      console.log("✅ [LOGOUT] Logout function completed");
    } catch (error) {
      console.error("❌ [LOGOUT] Error during logout:", error);
    }

    setTimeout(() => {
      console.log("🍪 [LOGOUT] Cookies AFTER (immediate):", document.cookie);
      console.log(
        "🔍 [LOGOUT] accessToken still exists?",
        getCookie("accessToken")
      );
      console.log(
        "🔍 [LOGOUT] refreshToken still exists?",
        getCookie("refreshToken")
      );
    }, 100);

    setTimeout(() => {
      console.log("🍪 [LOGOUT] Cookies AFTER (1s delay):", document.cookie);
    }, 1000);
  };

  return (
    <div style={{ padding: "20px", border: "2px solid red", margin: "20px" }}>
      <h3>Logout Debug Panel</h3>
      <button
        onClick={handleDebugLogout}
        style={{
          padding: "10px 20px",
          backgroundColor: "#dc2626",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "16px",
          marginTop: "10px",
        }}
      >
        Debug Logout
      </button>

      <div style={{ marginTop: "20px" }}>
        <p>
          <strong>Current Cookies:</strong>
        </p>
        <pre
          style={{ fontSize: "12px", background: "#f5f5f5", padding: "10px" }}
        >
          {cookieString}
        </pre>
      </div>
    </div>
  );
}
