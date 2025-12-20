// File: src/providers/ToastProvider.tsx (or wherever this code lives)

import React, { useEffect } from "react"; // <-- Import useEffect
import { ToastContainer } from "react-toastify";

export const ToastProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  // 1. Load the ToastContainer component
  // 2. Load the CSS ONLY on the client after hydration

  useEffect(() => {
    // This runs only in the browser, after initial render/hydration
    import("react-toastify/dist/ReactToastify.css");
  }, []);

  return (
    <>
      {children}
      <ToastContainer pauseOnHover autoClose={5000} />
    </>
  );
};
