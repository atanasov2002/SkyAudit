import React from "react";
import { ToastContainer } from "react-toastify";

export const ToastProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return (
    <>
      {children}
      <ToastContainer pauseOnHover autoClose={5000} />
    </>
  );
};
