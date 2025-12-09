// routes/dashboard.tsx

import { Outlet } from "react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { theme } from "@/styles/theme";

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          minHeight: "100vh",
        }}
      >
        <AppSidebar />
        <main
          style={{
            flex: 1,
            width: "100%",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              display: "block",
              padding: theme.spacing.lg,
            }}
          >
            <SidebarTrigger
              style={{
                padding: theme.spacing.sm,
                backgroundColor: theme.colors.zinc[950],
                border: `1px solid ${theme.colors.zinc[800]}`,
                borderRadius: theme.borderRadius.md,
                color: theme.colors.white,
                cursor: "pointer",
                transition: `all ${theme.transitions.normal}`,
              }}
            />
          </div>
          <div className="w-full h-full">
            <div>
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
