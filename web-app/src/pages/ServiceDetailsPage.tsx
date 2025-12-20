import { useState } from "react";
import {
  ArrowLeft,
  Server,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  HardDrive,
  Cpu,
  Activity,
  AlertCircle,
} from "lucide-react";
import { theme } from "@/styles/theme";

// Types
interface MetricDataPoint {
  timestamp: string;
  value: number;
}

interface Configuration {
  [key: string]: string | number | string[];
}

interface Recommendation {
  severity: "critical" | "high" | "medium" | "low";
  type: string;
  title: string;
  description: string;
  potentialSavings: number;
}

interface ServiceMetrics {
  cpuUtilization?: MetricDataPoint[];
  networkIn?: MetricDataPoint[];
  networkOut?: MetricDataPoint[];
  [key: string]: MetricDataPoint[] | undefined;
}

interface Service {
  serviceName: string;
  resourceId: string;
  serviceType: string;
  region: string;
  status: string;
  currentMonthlyCost: number;
  lastMonthCost: number;
  potentialSavings: number;
  lastMetricsUpdate?: string;
  configuration?: Configuration;
  recommendations?: Recommendation[];
  metrics?: ServiceMetrics;
}

interface CardProps {
  children: React.ReactNode;
  highlight?: boolean;
}

interface StatCardProps {
  icon: React.ComponentType<{ size: number }>;
  label: string;
  value: string;
  trend?: number;
  color?: string;
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error";
}

interface MetricChartProps {
  data: MetricDataPoint[];
  type: "cpu" | "network";
  label: string;
}

interface MetricsDashboardProps {
  metrics?: ServiceMetrics;
}

// Components
const Card = ({ children, highlight = false }: CardProps) => (
  <div
    style={{
      border: `1px solid ${highlight ? "rgba(16,185,129,0.3)" : "#27272a"}`,
      borderRadius: "0.75rem",
      padding: "1.5rem",
      transition: "border-color 0.2s",
    }}
  >
    {children}
  </div>
);

const StatCard = ({
  icon: Icon,
  label,
  value,
  trend,
  color = "#71717a",
}: StatCardProps) => (
  <Card>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "1rem",
      }}
    >
      <div
        style={{
          padding: "0.625rem",
          borderRadius: "0.5rem",
          background: "rgba(39,39,42,0.8)",
          color,
        }}
      >
        <Icon size={20} />
      </div>
      {trend !== undefined && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            fontSize: "0.75rem",
            fontWeight: "500",
            color,
          }}
        >
          {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <p
      style={{
        fontSize: "0.875rem",
        marginBottom: "0.25rem",
      }}
    >
      {label}
    </p>
    <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{value}</p>
  </Card>
);

const Badge = ({ children, variant = "default" }: BadgeProps) => {
  const styles = {
    default: { bg: "#27272a", color: "#d4d4d8", border: "none" },
    success: {
      bg: "rgba(16,185,129,0.2)",
      color: "#34d399",
      border: "1px solid rgba(16,185,129,0.3)",
    },
    warning: {
      bg: "rgba(245,158,11,0.2)",
      color: "#fbbf24",
      border: "1px solid rgba(245,158,11,0.3)",
    },
    error: {
      bg: "rgba(239,68,68,0.2)",
      color: "#f87171",
      border: "1px solid rgba(239,68,68,0.3)",
    },
  };
  const s = styles[variant];

  return (
    <span
      style={{
        padding: "0.25rem 0.625rem",
        borderRadius: "0.375rem",
        fontSize: "0.75rem",
        fontWeight: "500",
        background: s.bg,
        color: s.color,
        border: s.border,
      }}
    >
      {children}
    </span>
  );
};

const MetricChart = ({ data, type, label }: MetricChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 0", color: "#71717a" }}>
        No data available
      </div>
    );
  }

  const formatValue = (value: number): string => {
    if (type === "cpu") return `${value.toFixed(1)}%`;
    if (type === "network") return `${(value / 1000000).toFixed(2)} MB`;
    return value.toFixed(2);
  };

  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const avg = data.reduce((s, d) => s + d.value, 0) / data.length;
  const range = max - min || 1;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h3 style={{ fontSize: "1.125rem", fontWeight: "600" }}>{label}</h3>
        <span style={{ fontSize: "0.875rem", color: "#71717a" }}>
          Last 24 hours • {data.length} points
        </span>
      </div>
      <div
        style={{
          position: "relative",
          height: "16rem",
          borderRadius: "0.5rem",
          padding: "1rem",
          border: "1px solid #27272a",
        }}
      >
        <svg
          style={{ width: "100%", height: "100%" }}
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <defs>
            <linearGradient id={`g-${type}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 25, 50, 75, 100].map((p) => (
            <line
              key={p}
              x1="0"
              y1={p}
              x2="100"
              y2={p}
              stroke="#27272a"
              strokeWidth="0.3"
            />
          ))}
          <path
            d={`M 0,${100 - ((data[0].value - min) / range) * 100} ${data
              .map(
                (d, i) =>
                  `L ${(i / (data.length - 1)) * 100},${
                    100 - ((d.value - min) / range) * 100
                  }`
              )
              .join(" ")} L 100,100 L 0,100 Z`}
            fill={`url(#g-${type})`}
          />
          <polyline
            points={data
              .map(
                (d, i) =>
                  `${(i / (data.length - 1)) * 100},${
                    100 - ((d.value - min) / range) * 100
                  }`
              )
              .join(" ")}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="0.5"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            left: "0",
            top: "0",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "1rem 0",
            fontSize: "0.75rem",
            color: "#52525b",
            marginLeft: "-3rem",
          }}
        >
          <span>{formatValue(max)}</span>
          <span>{formatValue((max + min) / 2)}</span>
          <span>{formatValue(min)}</span>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: "2rem",
          marginTop: "1rem",
          fontSize: "0.875rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: "0.75rem",
              height: "0.75rem",
              borderRadius: "50%",
              background: "#3b82f6",
            }}
          />
          <span style={{ color: "#a1a1aa" }}>
            Current: {formatValue(data[data.length - 1].value)}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: "0.75rem",
              height: "0.75rem",
              borderRadius: "50%",
              background: "#10b981",
            }}
          />
          <span style={{ color: "#a1a1aa" }}>Avg: {formatValue(avg)}</span>
        </div>
      </div>
    </div>
  );
};

const MetricsDashboard = ({ metrics }: MetricsDashboardProps) => {
  const [activeTab, setActiveTab] = useState("cpuUtilization");

  const tabs = [
    { key: "cpuUtilization", label: "CPU Utilization", type: "cpu" as const },
    { key: "networkIn", label: "Network In", type: "network" as const },
    { key: "networkOut", label: "Network Out", type: "network" as const },
  ];

  const currentTab = tabs.find((t) => t.key === activeTab);
  const data = metrics?.[activeTab] || [];

  if (!metrics) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "3rem 0" }}>
          Loading metrics...
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
          borderBottom: "1px solid #27272a",
          paddingBottom: "1rem",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "500",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s",
              background: activeTab === tab.key ? "#2563eb" : "transparent",
              boxShadow:
                activeTab === tab.key
                  ? "0 4px 20px rgba(37,99,235,0.25)"
                  : "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {currentTab && (
        <MetricChart
          data={data}
          type={currentTab.type}
          label={currentTab.label}
        />
      )}
    </Card>
  );
};

// Main Component Props
interface ServiceDetailsPageProps {
  navigate: (path: string) => void;
  accountId?: string;
  serviceId?: string;
  data?: { service?: Service };
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
}

export default function ServiceDetailsPage({
  navigate,
  accountId,
  serviceId,
  data,
  isLoading,
  isError,
  error,
}: ServiceDetailsPageProps) {
  const service = data?.service;

  const getServiceIcon = (type: string) => {
    const icons: Record<string, React.ComponentType<{ size: number }>> = {
      ec2: Server,
      rds: Server,
      s3: HardDrive,
      lambda: Cpu,
    };
    return icons[type] || Server;
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Activity
            style={{
              width: "3rem",
              height: "3rem",
              color: "#3b82f6",
              margin: "0 auto 1rem",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ color: "#71717a" }}>Loading service details...</p>
        </div>
      </div>
    );
  }

  if (isError || !service) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#000",
          color: "#fff",
          padding: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            textAlign: "center",
            padding: "3rem",
            borderRadius: "0.75rem",
            border: "1px solid #27272a",
            background: "rgba(24,24,27,0.5)",
          }}
        >
          <AlertCircle
            style={{
              width: "3rem",
              height: "3rem",
              color: "#ef4444",
              margin: "0 auto 1rem",
            }}
          />
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            Failed to Load Service
          </h2>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#71717a",
              marginBottom: "2rem",
            }}
          >
            {error?.message || "Service not found"}
          </p>
          <button
            onClick={() => navigate(`/dashboard/aws/accounts/${accountId}`)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              border: "1px solid #27272a",
              background: "rgba(39,39,42,0.8)",
              color: "#fff",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Back to Account
          </button>
        </div>
      </div>
    );
  }

  const ServiceIcon = getServiceIcon(service.serviceType);
  const costTrend =
    service.currentMonthlyCost > service.lastMonthCost
      ? "increasing"
      : "decreasing";
  const costChange = (
    ((service.currentMonthlyCost - service.lastMonthCost) /
      service.lastMonthCost) *
    100
  ).toFixed(1);

  return (
    <div
      style={{
        minHeight: "100vh",
        borderTop: `1px solid ${theme.colors.zinc[800]}`,
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
        <button
          onClick={() => navigate(`/dashboard/aws/accounts/${accountId}`)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "#a1a1aa",
            background: "none",
            border: "none",
            cursor: "pointer",
            marginBottom: "2rem",
            fontSize: "0.875rem",
            transition: "color 0.2s",
          }}
        >
          <ArrowLeft size={16} />
          Back to Account
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              width: "4rem",
              height: "4rem",
              background: "#27272a",
              borderRadius: "0.75rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#d4d4d8",
            }}
          >
            <ServiceIcon size={32} />
          </div>
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontSize: "1.875rem",
                fontWeight: "bold",
                marginBottom: "0.75rem",
              }}
            >
              {service.serviceName}
            </h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: "0.875rem", color: "#71717a" }}>
                {service.resourceId}
              </span>
              <Badge>{service.serviceType.toUpperCase()}</Badge>
              <Badge>{service.region}</Badge>
              <Badge
                variant={service.status === "running" ? "success" : "default"}
              >
                {service.status}
              </Badge>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <MetricsDashboard metrics={service.metrics} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <StatCard
            icon={DollarSign}
            label="Current Monthly Cost"
            value={`$${service.currentMonthlyCost.toFixed(2)}`}
            trend={parseFloat(costChange)}
            color={costTrend === "increasing" ? "#ef4444" : "#10b981"}
          />
          <StatCard
            icon={costTrend === "increasing" ? TrendingUp : TrendingDown}
            label="Cost Trend"
            value={costTrend}
            color={costTrend === "increasing" ? "#ef4444" : "#10b981"}
          />
          <StatCard
            icon={Clock}
            label="Last Updated"
            value={
              service.lastMetricsUpdate
                ? new Date(service.lastMetricsUpdate).toLocaleDateString()
                : "N/A"
            }
          />
          {service.potentialSavings > 0 && (
            <StatCard
              icon={TrendingDown}
              label="Potential Savings"
              value={`$${service.potentialSavings.toFixed(2)}/mo`}
              color="#10b981"
            />
          )}
        </div>

        {service.configuration && (
          <div style={{ marginBottom: "2rem" }}>
            <Card>
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  marginBottom: "1.5rem",
                }}
              >
                Configuration
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
                  gap: "1.5rem",
                }}
              >
                {Object.entries(service.configuration).map(([k, v]) => (
                  <div key={k}>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "#71717a",
                        marginBottom: "0.25rem",
                        textTransform: "capitalize",
                      }}
                    >
                      {k.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    <p
                      style={{
                        fontSize: "1rem",
                        fontWeight: "500",
                      }}
                    >
                      {Array.isArray(v) ? v.join(", ") : String(v)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {service.recommendations && service.recommendations.length > 0 && (
          <Card>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: "bold",
                marginBottom: "1.5rem",
              }}
            >
              Recommendations ({service.recommendations.length})
            </h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {service.recommendations.map((r, i) => (
                <div
                  key={i}
                  style={{
                    padding: "1.25rem",
                    borderRadius: "0.5rem",
                    border: `1px solid ${
                      r.severity === "critical"
                        ? "rgba(239,68,68,0.3)"
                        : r.severity === "high"
                        ? "rgba(245,158,11,0.3)"
                        : "#3f3f46"
                    }`,
                    background:
                      r.severity === "critical"
                        ? "rgba(239,68,68,0.05)"
                        : r.severity === "high"
                        ? "rgba(245,158,11,0.05)"
                        : "rgba(39,39,42,0.5)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <Badge
                      variant={
                        r.severity === "critical"
                          ? "error"
                          : r.severity === "high"
                          ? "warning"
                          : "default"
                      }
                    >
                      {r.severity}
                    </Badge>
                    <Badge>{r.type.replace(/_/g, " ")}</Badge>
                  </div>
                  <h3
                    style={{
                      fontSize: "1rem",
                      fontWeight: "600",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {r.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#a1a1aa",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {r.description}
                  </p>
                  {r.potentialSavings > 0 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "#34d399",
                      }}
                    >
                      <DollarSign size={16} />
                      <span style={{ fontSize: "0.875rem", fontWeight: "600" }}>
                        Save ${r.potentialSavings.toFixed(2)}/month
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
