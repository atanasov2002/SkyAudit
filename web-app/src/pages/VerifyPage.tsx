import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

export default function VerifyPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [msg, setMsg] = useState("Verifying...");

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch("http://localhost:4001/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        setMsg("Your email has been verified! You can now log in.");
      } catch (err) {
        setMsg(err.message);
      }
    }

    if (token) verify();
  }, [token]);

  return <div className="p-4 text-center">{msg}</div>;
}
