"use client";

import { ModeToggle } from "../mode-toggle";

export default function GlassNavbar() {
  return (
    <nav
      className="
        fixed top-0 left-0 w-full z-[9999] 
        pointer-events-none   /* make the whole nav non-blocking */
      "
    >
      <div
        className="
          m-6
          backdrop-blur-md bg-white/10 border border-white/20 
          rounded-3xl shadow-2xl px-8 py-4
          pointer-events-auto
          mx-auto max-w-2xl
        "
      >
        <div className="flex items-center justify-between space-x-8">
          {/* Logo */}
          <div className="font-bold text-lg tracking-wider">SkyAudit</div>

          <ModeToggle />

          {/* Navigation Links */}
          <div className="flex items-center gap-8">
            <a
              href="#"
              className="flex items-center gap-2 hover:text-blue-300 transition-colors"
            >
              <span className="">Dashboard</span>
            </a>

            <a
              href="#"
              className="flex items-center gap-2 hover:text-blue-300 transition-colors"
            >
              <span className="">Profile</span>
            </a>

            <a
              href="#"
              className="flex items-center gap-2 hover:text-blue-300 transition-colors"
            >
              <span className="text-nowrap">Sign up</span>
            </a>

            <a
              href="#"
              className="flex items-center gap-2 hover:text-blue-300 transition-colors"
            >
              <span className="text-nowrap">Sign in</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
