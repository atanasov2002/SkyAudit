import { useState } from "react";
import {
  TrendingDown,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Server,
  Plus,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useNavigate } from "react-router";
import { theme } from "@/styles/theme";
import { SnakeButton } from "@/components/styled/StyledComponents";
import { useDashboard } from "@/hooks/useAwsData";
import { useProfile } from "@/hooks/useAuth";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("7d");
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: dashboardData,
    isLoading: loading,
    error,
    refetch,
  } = useDashboard();

  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = useProfile();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleConnectAccount = () => {
    navigate("/dashboard/aws/connect");
  };

  const handleViewAccount = (accountId: string) => {
    navigate(`/dashboard/aws/accounts/${accountId}`);
  };

  const handleViewAllAlerts = () => {
    navigate("/alerts");
  };

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: theme.colors.black,
          color: theme.colors.white,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <RefreshCw
            style={{
              width: "3rem",
              height: "3rem",
              animation: "spin 1s linear infinite",
              margin: "0 auto",
              marginBottom: theme.spacing.lg,
              color: theme.colors.white,
            }}
          />
          <p style={{ color: theme.colors.zinc[400] }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          backgroundColor: theme.colors.black,
          color: theme.colors.white,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: theme.spacing["2xl"],
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "500px" }}>
          <AlertTriangle
            style={{
              width: "3rem",
              height: "3rem",
              color: theme.colors.error.default,
              margin: "0 auto",
              marginBottom: theme.spacing.lg,
            }}
          />
          <h2
            style={{
              fontSize: theme.fontSize["2xl"],
              fontWeight: theme.fontWeight.bold,
              marginBottom: theme.spacing.md,
            }}
          >
            Failed to Load Dashboard
          </h2>
          <p
            style={{
              color: theme.colors.zinc[400],
              marginBottom: theme.spacing.xl,
            }}
          >
            <p>{error instanceof Error ? error.message : String(error)}</p>
          </p>
          <button
            onClick={handleRefresh}
            style={{
              padding: `${theme.spacing.md} ${theme.spacing.xl}`,
              backgroundColor: theme.colors.white,
              color: theme.colors.black,
              border: "none",
              borderRadius: theme.borderRadius.lg,
              fontSize: theme.fontSize.base,
              fontWeight: theme.fontWeight.medium,
              cursor: "pointer",
              transition: `all ${theme.transitions.normal}`,
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const metrics = [
    {
      title: "Total Monthly Cost",
      value: `$${dashboardData.dashboard.totalMonthlyCost}`,
      change: "+8.2%",
      trend: "up" as const,
      icon: <DollarSign style={{ width: "1.5rem", height: "1.5rem" }} />,
      color: theme.colors.white,
    },
    {
      title: "Potential Savings",
      value: `$${dashboardData.dashboard.potentialSavings}`,
      change: "33.6%",
      trend: "down" as const,
      icon: <TrendingDown style={{ width: "1.5rem", height: "1.5rem" }} />,
      color: theme.colors.success.default,
    },
    {
      title: "Active Resources",
      value: dashboardData.dashboard.totalServices,
      change: `+${dashboardData.dashboard.totalServices}`,
      trend: "up" as const,
      icon: <Server style={{ width: "1.5rem", height: "1.5rem" }} />,
      color: theme.colors.white,
    },
    {
      title: "Critical Alerts",
      value: dashboardData.dashboard.criticalAlerts,
      change:
        dashboardData.dashboard.criticalAlerts > 0
          ? `${dashboardData.dashboard.criticalAlerts}`
          : "None",
      trend: "down" as const,
      icon: <AlertTriangle style={{ width: "1.5rem", height: "1.5rem" }} />,
      color: theme.colors.warning.default,
    },
  ];

  return (
    <div style={{ padding: "0 100px 0 100px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: theme.spacing["3xl"],
          flexWrap: "wrap",
          gap: theme.spacing.xl,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: theme.fontSize["3xl"],
              fontWeight: theme.fontWeight.bold,
              marginBottom: theme.spacing.sm,
              color: theme.colors.white,
            }}
          >
            Welcome back
            {userData?.user?.name
              ? `, ${userData.user.name}`
              : userData?.user?.email
              ? `, ${userData.user.email}`
              : ""}
          </h1>
          <p
            style={{
              fontSize: theme.fontSize.sm,
              color: theme.colors.zinc[400],
            }}
          >
            Here's what's happening with your AWS infrastructure today
          </p>
        </div>
        <div style={{ display: "flex", gap: theme.spacing.md }}>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.sm,
              padding: `${theme.spacing.md} ${theme.spacing.lg}`,
              backgroundColor: theme.colors.zinc[800],
              color: theme.colors.white,
              border: `1px solid ${theme.colors.zinc[700]}`,
              borderRadius: theme.borderRadius.lg,
              fontSize: theme.fontSize.sm,
              fontWeight: theme.fontWeight.medium,
              cursor: refreshing ? "not-allowed" : "pointer",
              transition: `all ${theme.transitions.normal}`,
              opacity: refreshing ? 0.6 : 1,
            }}
          >
            <RefreshCw
              style={{
                width: "1rem",
                height: "1rem",
                animation: refreshing ? "spin 1s linear infinite" : "none",
              }}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <SnakeButton onClick={handleConnectAccount}>
            <Plus style={{ width: "1rem", height: "1rem" }} />
            Connect Account
            <span className="top-border" />
            <span className="bottom-border" />
          </SnakeButton>
        </div>
      </div>

      {/* Time Range Selector */}
      <div
        style={{
          display: "flex",
          gap: theme.spacing.md,
          marginBottom: theme.spacing["2xl"],
          flexWrap: "wrap",
        }}
      >
        {[
          { value: "24h", label: "Last 24 Hours" },
          { value: "7d", label: "Last 7 Days" },
          { value: "30d", label: "Last 30 Days" },
          { value: "90d", label: "Last 90 Days" },
        ].map((range) => (
          <button
            key={range.value}
            onClick={() => setTimeRange(range.value)}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
              backgroundColor:
                timeRange === range.value
                  ? theme.colors.white
                  : theme.colors.zinc[800],
              color:
                timeRange === range.value
                  ? theme.colors.black
                  : theme.colors.white,
              border: `1px solid ${
                timeRange === range.value
                  ? theme.colors.zinc[900]
                  : theme.colors.zinc[600]
              }`,
              borderRadius: theme.borderRadius.lg,
              fontSize: theme.fontSize.sm,
              fontWeight: theme.fontWeight.medium,
              cursor: "pointer",
              transition: `all ${theme.transitions.normal}`,
            }}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Metrics Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: theme.spacing.xl,
          marginBottom: theme.spacing["3xl"],
        }}
      >
        {metrics.map((metric, index) => (
          <div
            key={index}
            style={{
              padding: theme.spacing.xl,
              border: `1px solid ${theme.colors.zinc[800]}`,
              borderRadius: theme.borderRadius.xl,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: theme.spacing.lg,
              }}
            >
              <div
                style={{
                  width: "3rem",
                  height: "3rem",
                  backgroundColor: theme.colors.zinc[800],
                  borderRadius: theme.borderRadius.lg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: metric.color,
                }}
              >
                {metric.icon}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.xs,
                  color:
                    metric.trend === "up"
                      ? theme.colors.error.default
                      : theme.colors.success.default,
                }}
              >
                {metric.trend === "up" ? (
                  <ArrowUpRight style={{ width: "1rem", height: "1rem" }} />
                ) : (
                  <ArrowDownRight style={{ width: "1rem", height: "1rem" }} />
                )}
                <span
                  style={{
                    fontSize: theme.fontSize.sm,
                    fontWeight: theme.fontWeight.medium,
                  }}
                >
                  {metric.change}
                </span>
              </div>
            </div>
            <div>
              <p
                style={{
                  fontSize: theme.fontSize.sm,
                  color: theme.colors.zinc[400],
                  marginBottom: theme.spacing.xs,
                }}
              >
                {metric.title}
              </p>
              <div
                style={{
                  fontSize: theme.fontSize["2xl"],
                  fontWeight: theme.fontWeight.bold,
                }}
              >
                {metric.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Connected Accounts */}
      {dashboardData.dashboard.accounts &&
        dashboardData.dashboard.accounts.length > 0 && (
          <div
            style={{
              padding: theme.spacing.xl,
              border: `1px solid ${theme.colors.zinc[800]}`,
              borderRadius: theme.borderRadius.xl,
              marginBottom: theme.spacing["3xl"],
            }}
          >
            <h3
              style={{
                fontSize: theme.fontSize.xl,
                fontWeight: theme.fontWeight.semibold,
                marginBottom: theme.spacing.xl,
              }}
            >
              Connected AWS Accounts ({dashboardData.dashboard.accounts.length})
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: theme.spacing.lg,
                backgroundColor: "transparent",
              }}
            >
              {dashboardData.dashboard.accounts.map((account) => (
                <div
                  key={account.awsAccountId}
                  onClick={() => handleViewAccount(account.awsAccountId)}
                  style={{
                    padding: theme.spacing.xl,
                    backgroundColor: "transparent",
                    border: `1px solid ${theme.colors.zinc[700]}`,
                    borderRadius: theme.borderRadius.lg,
                    cursor: "pointer",
                    transition: `all ${theme.transitions.normal}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.zinc[600];
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.zinc[700];
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: theme.spacing.md,
                    }}
                  >
                    <div>
                      <h4
                        style={{
                          fontSize: theme.fontSize.lg,
                          fontWeight: theme.fontWeight.semibold,
                          marginBottom: theme.spacing.xs,
                        }}
                      >
                        {account.name}
                      </h4>
                      <p
                        style={{
                          fontSize: theme.fontSize.sm,
                          color: theme.colors.zinc[400],
                        }}
                      >
                        {account.totalServices} services
                      </p>
                    </div>
                    <span
                      style={{
                        padding: `${theme.spacing.xs} ${theme.spacing.md}`,
                        backgroundColor:
                          account.status === "ACTIVE"
                            ? "rgba(34, 197, 94, 0.1)"
                            : "rgba(239, 68, 68, 0.1)",
                        color:
                          account.status === "ACTIVE"
                            ? theme.colors.success.default
                            : theme.colors.error.default,
                        borderRadius: theme.borderRadius.md,
                        fontSize: theme.fontSize.xs,
                        fontWeight: theme.fontWeight.medium,
                        textTransform: "capitalize",
                      }}
                    >
                      {account.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* No Accounts Message */}
      {dashboardData.dashboard.accounts &&
        dashboardData.dashboard.accounts.length === 0 && (
          <div
            style={{
              padding: theme.spacing["4xl"],
              border: `1px solid ${theme.colors.zinc[800]}`,
              borderRadius: theme.borderRadius.xl,
              marginBottom: theme.spacing["3xl"],
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Server
              style={{
                width: "3rem",
                height: "3rem",
                color: theme.colors.zinc[600],
                margin: "0 auto",
                marginBottom: theme.spacing.lg,
              }}
            />
            <h3
              style={{
                fontSize: theme.fontSize.xl,
                fontWeight: theme.fontWeight.semibold,
                marginBottom: theme.spacing.md,
                color: theme.colors.white,
              }}
            >
              No AWS Accounts Connected
            </h3>
            <p
              style={{
                fontSize: theme.fontSize.sm,
                color: theme.colors.zinc[400],
                marginBottom: theme.spacing.xl,
              }}
            >
              Connect your first AWS account to start monitoring your
              infrastructure
            </p>
            <SnakeButton onClick={handleConnectAccount}>
              <Plus style={{ width: "1rem", height: "1rem" }} />
              Connect Account
              <span className="top-border" />
              <span className="bottom-border" />
            </SnakeButton>
          </div>
        )}

      {/* Recent Alerts */}
      {dashboardData.dashboard.recentAlerts &&
        dashboardData.dashboard.recentAlerts.length > 0 && (
          <div
            style={{
              padding: theme.spacing.xl,
              backgroundColor: theme.colors.zinc[900],
              border: `1px solid ${theme.colors.zinc[800]}`,
              borderRadius: theme.borderRadius.xl,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: theme.spacing.xl,
              }}
            >
              <h3
                style={{
                  fontSize: theme.fontSize.xl,
                  fontWeight: theme.fontWeight.semibold,
                  color: theme.colors.white,
                }}
              >
                Recent Alerts
              </h3>
              <button
                onClick={handleViewAllAlerts}
                style={{
                  padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                  backgroundColor: theme.colors.zinc[800],
                  color: theme.colors.white,
                  border: `1px solid ${theme.colors.zinc[700]}`,
                  borderRadius: theme.borderRadius.lg,
                  fontSize: theme.fontSize.sm,
                  cursor: "pointer",
                  transition: `all ${theme.transitions.normal}`,
                }}
              >
                View All
              </button>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: theme.spacing.lg,
              }}
            >
              {dashboardData.dashboard.recentAlerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    padding: theme.spacing.lg,
                    backgroundColor: theme.colors.zinc[800],
                    border: `1px solid ${theme.colors.zinc[700]}`,
                    borderRadius: theme.borderRadius.lg,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: theme.spacing.md,
                          marginBottom: theme.spacing.sm,
                        }}
                      >
                        <div
                          style={{
                            width: "0.5rem",
                            height: "0.5rem",
                            backgroundColor:
                              alert.severity === "critical"
                                ? theme.colors.error.default
                                : alert.severity === "high"
                                ? theme.colors.warning.default
                                : theme.colors.zinc[500],
                            borderRadius: "50%",
                          }}
                        />
                        <span
                          style={{
                            fontSize: theme.fontSize.xs,
                            fontWeight: theme.fontWeight.medium,
                            color:
                              alert.severity === "critical"
                                ? theme.colors.error.default
                                : alert.severity === "high"
                                ? theme.colors.warning.default
                                : theme.colors.zinc[400],
                            textTransform: "uppercase",
                          }}
                        >
                          {alert.severity}
                        </span>
                      </div>
                      <h4
                        style={{
                          fontSize: theme.fontSize.base,
                          fontWeight: theme.fontWeight.semibold,
                          marginBottom: theme.spacing.xs,
                          color: theme.colors.white,
                        }}
                      >
                        {alert.title}
                      </h4>
                      <p
                        style={{
                          fontSize: theme.fontSize.sm,
                          color: theme.colors.zinc[400],
                        }}
                      >
                        {alert.description}
                      </p>
                    </div>
                    {alert.estimatedImpact !== undefined &&
                      alert.estimatedImpact > 0 && (
                        <span
                          style={{
                            fontSize: theme.fontSize.sm,
                            color: theme.colors.success.default,
                            fontWeight: theme.fontWeight.semibold,
                            marginLeft: theme.spacing.lg,
                          }}
                        >
                          ${alert.estimatedImpact.toFixed(2)}/mo
                        </span>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* CSS for spin animation */}
      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}
