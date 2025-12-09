import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Server,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  HardDrive,
  Cpu,
  Network,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Heading, Text, Button } from "@/components/styled/StyledComponents";
import { theme } from "@/styles/theme";
import { apiClient } from "@/lib/api-client";
import { useNavigate, useParams } from "react-router";

export default function ServiceDetailsPage() {
  const navigate = useNavigate();
  const { accountId, serviceId } = useParams();
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accountId && serviceId) {
      loadService();
    }
  }, [accountId, serviceId]);

  const loadService = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getService(accountId!, serviceId!);
      setService(response.service);
      console.log({ response, service });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load service details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          border: `1px solid ${theme.colors.zinc[800]}`,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text>Loading service details...</Text>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div
        style={{
          border: `1px solid ${theme.colors.zinc[800]}`,
          minHeight: "100vh",
          padding: theme.spacing["2xl"],
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            textAlign: "center",
            padding: theme.spacing["3xl"],
            borderRadius: theme.borderRadius.xl,
            border: `1px solid ${theme.colors.zinc[800]}`,
          }}
        >
          <AlertCircle
            style={{
              width: "3rem",
              height: "3rem",
              color: theme.colors.error.default,
              margin: "0 auto",
              marginBottom: theme.spacing.lg,
            }}
          />
          <Heading
            level={2}
            style={{
              color: `${theme.colors.success}`,
              marginBottom: theme.spacing.md,
            }}
          >
            Failed to Load Service
          </Heading>
          <Text
            variant="small"
            style={{
              color: theme.colors.zinc[400],
              marginBottom: theme.spacing.xl,
            }}
          >
            {error}
          </Text>
          <Button
            onClick={() => navigate(`/dashboard/aws/accounts/${accountId}`)}
          >
            Back to Account
          </Button>
        </div>
      </div>
    );
  }

  const getServiceIcon = (type: string) => {
    const icons: Record<string, any> = {
      ec2: <Server />,
      rds: <Server />,
      s3: <HardDrive />,
      lambda: <Cpu />,
    };
    return icons[type] || <Server />;
  };

  const costTrend = service.getCostTrend
    ? service.getCostTrend()
    : service.currentMonthlyCost > service.lastMonthCost
    ? "increasing"
    : service.currentMonthlyCost < service.lastMonthCost
    ? "decreasing"
    : "stable";

  return (
    <div
      style={{
        backgroundColor: theme.colors.black,
        color: theme.colors.white,
        minHeight: "100vh",
        padding: theme.spacing["2xl"],
      }}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(`/dashboard/aws/accounts/${accountId}`)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: theme.spacing.sm,
          background: "none",
          border: "none",
          color: theme.colors.zinc[400],
          cursor: "pointer",
          marginBottom: theme.spacing.xl,
          padding: 0,
          fontSize: theme.fontSize.sm,
        }}
      >
        <ArrowLeft style={{ width: "1rem", height: "1rem" }} />
        Back to Account
      </button>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: theme.spacing.xl,
          marginBottom: theme.spacing["3xl"],
        }}
      >
        <div
          style={{
            width: "4rem",
            height: "4rem",
            backgroundColor: theme.colors.zinc[800],
            borderRadius: theme.borderRadius.lg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {React.cloneElement(getServiceIcon(service.serviceType), {
            style: { width: "2rem", height: "2rem" },
          })}
        </div>
        <div style={{ flex: 1 }}>
          <Heading
            level={1}
            style={{ fontSize: "2rem", marginBottom: theme.spacing.sm }}
          >
            {service.serviceName}
          </Heading>
          <div
            style={{
              display: "flex",
              gap: theme.spacing.md,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Text variant="small" style={{ color: theme.colors.zinc[400] }}>
              {service.resourceId}
            </Text>
            <span
              style={{
                fontSize: theme.fontSize.xs,
                padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                backgroundColor: theme.colors.zinc[900],
                borderRadius: theme.borderRadius.sm,
                textTransform: "uppercase",
              }}
            >
              {service.serviceType}
            </span>
            <span
              style={{
                fontSize: theme.fontSize.xs,
                padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                backgroundColor: theme.colors.zinc[900],
                borderRadius: theme.borderRadius.sm,
              }}
            >
              {service.region}
            </span>
            <span
              style={{
                fontSize: theme.fontSize.xs,
                padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                backgroundColor:
                  service.status === "running"
                    ? "rgba(34, 197, 94, 0.1)"
                    : "rgba(113, 113, 122, 0.1)",
                color:
                  service.status === "running"
                    ? theme.colors.success.default
                    : theme.colors.zinc[400],
                borderRadius: theme.borderRadius.sm,
                textTransform: "capitalize",
              }}
            >
              {service.status}
            </span>
          </div>
        </div>
      </div>

      {/* Cost Overview */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: theme.spacing.xl,
          marginBottom: theme.spacing["3xl"],
        }}
      >
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
              width: "2.5rem",
              height: "2.5rem",
              backgroundColor: theme.colors.zinc[800],
              borderRadius: theme.borderRadius.lg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: theme.spacing.md,
            }}
          >
            <DollarSign style={{ width: "1.25rem", height: "1.25rem" }} />
          </div>
          <Text
            variant="small"
            style={{
              color: theme.colors.zinc[400],
              marginBottom: theme.spacing.xs,
            }}
          >
            Current Monthly Cost
          </Text>
          <div
            style={{ fontSize: "1.75rem", fontWeight: theme.fontWeight.bold }}
          >
            ${service.currentMonthlyCost.toFixed(2)}
          </div>
        </div>

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
              width: "2.5rem",
              height: "2.5rem",
              backgroundColor: theme.colors.zinc[800],
              borderRadius: theme.borderRadius.lg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: theme.spacing.md,
            }}
          >
            {costTrend === "increasing" ? (
              <TrendingUp
                style={{
                  width: "1.25rem",
                  height: "1.25rem",
                  color: theme.colors.error.default,
                }}
              />
            ) : costTrend === "decreasing" ? (
              <TrendingDown
                style={{
                  width: "1.25rem",
                  height: "1.25rem",
                  color: theme.colors.success.default,
                }}
              />
            ) : (
              <Activity style={{ width: "1.25rem", height: "1.25rem" }} />
            )}
          </div>
          <Text
            variant="small"
            style={{
              color: theme.colors.zinc[400],
              marginBottom: theme.spacing.xs,
            }}
          >
            Cost Trend
          </Text>
          <div
            style={{
              fontSize: "1.75rem",
              fontWeight: theme.fontWeight.bold,
              color:
                costTrend === "increasing"
                  ? theme.colors.error.default
                  : costTrend === "decreasing"
                  ? theme.colors.success.default
                  : theme.colors.white,
              textTransform: "capitalize",
            }}
          >
            {costTrend}
          </div>
        </div>

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
              width: "2.5rem",
              height: "2.5rem",
              backgroundColor: theme.colors.zinc[800],
              borderRadius: theme.borderRadius.lg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: theme.spacing.md,
            }}
          >
            <Clock style={{ width: "1.25rem", height: "1.25rem" }} />
          </div>
          <Text
            variant="small"
            style={{
              color: theme.colors.zinc[400],
              marginBottom: theme.spacing.xs,
            }}
          >
            Last Updated
          </Text>
          <div
            style={{ fontSize: "1.75rem", fontWeight: theme.fontWeight.bold }}
          >
            {service.lastMetricsUpdate
              ? new Date(service.lastMetricsUpdate).toLocaleDateString()
              : "N/A"}
          </div>
        </div>

        {service.potentialSavings > 0 && (
          <div
            style={{
              padding: theme.spacing.xl,
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              border: `1px solid ${theme.colors.success.default}`,
              borderRadius: theme.borderRadius.xl,
            }}
          >
            <div
              style={{
                width: "2.5rem",
                height: "2.5rem",
                backgroundColor: theme.colors.success.default,
                borderRadius: theme.borderRadius.lg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: theme.spacing.md,
              }}
            >
              <TrendingDown
                style={{
                  width: "1.25rem",
                  height: "1.25rem",
                  color: theme.colors.white,
                }}
              />
            </div>
            <Text
              variant="small"
              style={{
                color: theme.colors.success.default,
                marginBottom: theme.spacing.xs,
              }}
            >
              Potential Savings
            </Text>
            <div
              style={{
                fontSize: "1.75rem",
                fontWeight: theme.fontWeight.bold,
                color: theme.colors.success.default,
              }}
            >
              ${service.potentialSavings.toFixed(2)}/mo
            </div>
          </div>
        )}
      </div>

      {/* Configuration Details */}
      <div
        style={{
          padding: theme.spacing.xl,
          backgroundColor: theme.colors.zinc[900],
          border: `1px solid ${theme.colors.zinc[800]}`,
          borderRadius: theme.borderRadius.xl,
          marginBottom: theme.spacing["3xl"],
        }}
      >
        <Heading
          level={3}
          style={{
            fontSize: theme.fontSize.xl,
            marginBottom: theme.spacing.xl,
          }}
        >
          Configuration
        </Heading>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: theme.spacing.lg,
          }}
        >
          {Object.entries(service.configuration || {}).map(([key, value]) => (
            <div key={key}>
              <Text
                variant="small"
                style={{
                  color: theme.colors.zinc[500],
                  marginBottom: theme.spacing.xs,
                  textTransform: "capitalize",
                }}
              >
                {key.replace(/([A-Z])/g, " $1").trim()}
              </Text>
              <div
                style={{
                  fontSize: theme.fontSize.base,
                  fontWeight: theme.fontWeight.medium,
                }}
              >
                {Array.isArray(value) ? value.join(", ") : String(value)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {service.recommendations && service.recommendations.length > 0 && (
        <div
          style={{
            padding: theme.spacing.xl,
            backgroundColor: theme.colors.zinc[900],
            border: `1px solid ${theme.colors.zinc[800]}`,
            borderRadius: theme.borderRadius.xl,
          }}
        >
          <Heading
            level={3}
            style={{
              fontSize: theme.fontSize.xl,
              marginBottom: theme.spacing.xl,
            }}
          >
            Recommendations ({service.recommendations.length})
          </Heading>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: theme.spacing.lg,
            }}
          >
            {service.recommendations.map((rec: any, idx: number) => (
              <div
                key={idx}
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
                        rec.severity === "critical"
                          ? theme.colors.error.default
                          : rec.severity === "high"
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
                        rec.severity === "critical"
                          ? theme.colors.error.default
                          : rec.severity === "high"
                          ? theme.colors.warning.default
                          : theme.colors.zinc[400],
                      textTransform: "uppercase",
                    }}
                  >
                    {rec.severity}
                  </span>
                  <span
                    style={{
                      fontSize: theme.fontSize.xs,
                      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                      backgroundColor: theme.colors.zinc[900],
                      borderRadius: theme.borderRadius.sm,
                      textTransform: "capitalize",
                    }}
                  >
                    {rec.type.replace(/_/g, " ")}
                  </span>
                </div>

                <h4
                  style={{
                    fontSize: theme.fontSize.base,
                    fontWeight: theme.fontWeight.semibold,
                    marginBottom: theme.spacing.xs,
                  }}
                >
                  {rec.title}
                </h4>
                <Text
                  variant="small"
                  style={{
                    color: theme.colors.zinc[400],
                    marginBottom: theme.spacing.md,
                  }}
                >
                  {rec.description}
                </Text>

                {rec.potentialSavings > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: theme.spacing.sm,
                    }}
                  >
                    <DollarSign
                      style={{
                        width: "1rem",
                        height: "1rem",
                        color: theme.colors.success.default,
                      }}
                    />
                    <span
                      style={{
                        fontSize: theme.fontSize.sm,
                        color: theme.colors.success.default,
                        fontWeight: theme.fontWeight.semibold,
                      }}
                    >
                      Save ${rec.potentialSavings.toFixed(2)}/month
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
