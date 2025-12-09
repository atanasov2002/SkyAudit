// components/app-sidebar.tsx

import React from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Cloud,
  LayoutDashboard,
  Server,
  Database,
  HardDrive,
  Network,
  Cpu,
  Globe,
  TrendingDown,
  Bell,
  Settings,
  FileText,
  CreditCard,
  Users,
  LogOut,
} from "lucide-react";
import { theme } from "@/styles/theme";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ModeToggle } from "./mode-toggle";
import { useAuth } from "@/contexts/AuthContext";
import LogoutDebug from "./LogoutDebug";

const menuItems = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
      { title: "Cost Analysis", icon: TrendingDown, url: "/dashboard/costs" },
      {
        title: "Recommendations",
        icon: FileText,
        url: "/dashboard/recommendations",
      },
    ],
  },
  {
    title: "AWS Services",
    items: [
      { title: "EC2 Instances", icon: Server, url: "/dashboard/ec2" },
      { title: "RDS Databases", icon: Database, url: "/dashboard/rds" },
      { title: "S3 Storage", icon: HardDrive, url: "/dashboard/s3" },
      { title: "VPC & Networking", icon: Network, url: "/dashboard/vpc" },
      { title: "Lambda Functions", icon: Cpu, url: "/dashboard/lambda" },
      { title: "CloudFront & DNS", icon: Globe, url: "/dashboard/cloudfront" },
    ],
  },
  {
    title: "Management",
    items: [
      { title: "Alerts", icon: Bell, url: "/dashboard/alerts" },
      { title: "Billing", icon: CreditCard, url: "/dashboard/billing" },
      { title: "Team", icon: Users, url: "/dashboard/team" },
      { title: "Profile", icon: Settings, url: "/dashboard/profile" },
    ],
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Sidebar
      style={{
        backgroundColor: theme.colors.zinc[950],
        borderRight: `1px solid ${theme.colors.zinc[800]}`,
      }}
    >
      <SidebarHeader
        style={{
          padding: theme.spacing.xl,
          borderBottom: `1px solid ${theme.colors.zinc[800]}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: theme.spacing.md,
          }}
        >
          <div
            style={{
              width: "2rem",
              height: "2rem",
              backgroundColor: theme.colors.white,
              borderRadius: theme.borderRadius.md,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Cloud
              style={{ width: "1.25rem", height: "1.25rem", color: "black" }}
            />
          </div>
          <span
            style={{
              fontSize: theme.fontSize.lg,
              fontWeight: theme.fontWeight.bold,
            }}
          >
            CloudAudit
          </span>
          <ModeToggle />
        </div>
      </SidebarHeader>

      <SidebarContent style={{ padding: theme.spacing.md }}>
        {menuItems.map((group, groupIndex) => (
          <SidebarGroup key={groupIndex}>
            <SidebarGroupLabel
              style={{
                color: theme.colors.zinc[500],
                fontSize: theme.fontSize.xs,
                fontWeight: theme.fontWeight.semibold,
                textTransform: "uppercase",
                padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                letterSpacing: "0.05em",
              }}
            >
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item, itemIndex) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={itemIndex}>
                      <SidebarMenuButton
                        onClick={() => navigate(item.url)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: theme.spacing.md,
                          padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                          borderRadius: theme.borderRadius.lg,
                          backgroundColor: isActive
                            ? theme.colors.white
                            : "transparent",
                          color: isActive
                            ? theme.colors.black
                            : theme.colors.zinc[400],
                          fontSize: theme.fontSize.sm,
                          fontWeight: isActive
                            ? theme.fontWeight.semibold
                            : theme.fontWeight.medium,
                          cursor: "pointer",
                          transition: `all ${theme.transitions.normal}`,
                          border: "none",
                          width: "100%",
                          textAlign: "left",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor =
                              theme.colors.zinc[900];
                            e.currentTarget.style.color = theme.colors.white;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                            e.currentTarget.style.color =
                              theme.colors.zinc[400];
                          }
                        }}
                      >
                        <item.icon
                          style={{ width: "1.25rem", height: "1.25rem" }}
                        />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter
        style={{
          padding: theme.spacing.lg,
          borderTop: `1px solid ${theme.colors.zinc[800]}`,
        }}
      >
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: theme.spacing.md,
            padding: `${theme.spacing.md} ${theme.spacing.lg}`,
            backgroundColor: "transparent",
            color: theme.colors.zinc[400],
            border: "none",
            borderRadius: theme.borderRadius.lg,
            fontSize: theme.fontSize.sm,
            fontWeight: theme.fontWeight.medium,
            cursor: "pointer",
            transition: `all ${theme.transitions.normal}`,
            width: "100%",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.zinc[900];
            e.currentTarget.style.color = theme.colors.error.default;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = theme.colors.zinc[400];
          }}
        >
          <LogOut style={{ width: "1.25rem", height: "1.25rem" }} />
          <span>Log Out</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
