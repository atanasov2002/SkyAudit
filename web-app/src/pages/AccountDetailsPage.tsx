import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  RefreshCw,
  Server,
  Database,
  HardDrive,
  Cpu,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Trash2,
  Settings,
  CheckCircle,
} from "lucide-react";
import { Heading, Text, Button } from "@/components/styled/StyledComponents";
import { theme } from "@/styles/theme";
import { apiClient } from "@/lib/api-client";
import { useNavigate, useParams } from "react-router";
import {
  useAwsAccount,
  useCostSummary,
  useDisconnectAwsAccount,
  useSyncAwsAccount,
} from "@/hooks/useAws";
import { useServices } from "@/hooks/useAwsData";
import { ServiceDataType } from "@/types/app";

export default function AccountDetailsPage() {
  const navigate = useNavigate();
  const { accountId } = useParams();

  const [filter, setFilter] = useState("all");

  const {
    data: accountData,
    isLoading: isAccountLoading,
    error: accountError,
  } = useAwsAccount(accountId!);

  const { data: servicesData, isLoading: isServicesLoading } = useServices(
    accountId!
  );

  const { data: costData, isLoading: isCostLoading } = useCostSummary(
    accountId!
  );

  const syncMutation = useSyncAwsAccount();
  const disconnectMutation = useDisconnectAwsAccount();

  const isLoading = isAccountLoading || isServicesLoading || isCostLoading;

  const account = accountData?.account;
  const services = servicesData?.services || [];
  const costSummary = costData?.summary;

  // Capture any error
  const error = accountError || syncMutation.error || disconnectMutation.error;

  // 4. Handlers
  const handleSync = () => {
    syncMutation.mutate(accountId!);
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to disconnect this AWS account? This will remove all associated data."
      )
    ) {
      return;
    }

    await disconnectMutation.mutateAsync(accountId!);
    navigate("/dashboard");
  };

  if (isLoading) {
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
            }}
          />
          <Text>Loading account details...</Text>
        </div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div
        style={{
          backgroundColor: theme.colors.black,
          color: theme.colors.white,
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
            backgroundColor: theme.colors.zinc[900],
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
          <Heading level={2} style={{ marginBottom: theme.spacing.md }}>
            Failed to Load Account
          </Heading>
          <Text
            variant="small"
            style={{
              color: theme.colors.zinc[400],
              marginBottom: theme.spacing.xl,
            }}
          >
            {error?.message || "Account data is unavailable or missing."}
          </Text>
          <Button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const getServiceIcon = (type: string) => {
    const icons: Record<string, any> = {
      ec2: <Server />,
      rds: <Database />,
      s3: <HardDrive />,
      lambda: <Cpu />,
    };
    return icons[type] || <Server />;
  };

  const filteredServices = services.filter((service: any) => {
    if (filter === "all") return true;
    // Assuming 'status' is a field on your service object
    // You'll need to adjust the filtering condition based on your actual service object fields
    if (filter === "alerts" && service.status === "alert") return true;
    if (filter === "running" && service.status === "running") return true;
    return false;
  });

  return (
    <div
      style={{
        border: `1px solid ${theme.colors.zinc[800]}`,
        minHeight: "100vh",
        padding: theme.spacing["2xl"],
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: theme.spacing["3xl"] }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: theme.spacing.sm,
            background: "none",
            border: "none",
            cursor: "pointer",
            marginBottom: theme.spacing.xl,
            padding: 0,
            fontSize: theme.fontSize.sm,
          }}
        >
          <ArrowLeft style={{ width: "1rem", height: "1rem" }} />
          Back to Dashboard
        </button>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: theme.spacing.xl,
          }}
        >
          <div>
            <Heading
              level={1}
              style={{ fontSize: "2rem", marginBottom: theme.spacing.sm }}
            >
              {account.name}
            </Heading>
            <div
              style={{
                display: "flex",
                gap: theme.spacing.md,
                alignItems: "center",
              }}
            >
              <Text variant="small" style={{ color: theme.colors.zinc[400] }}>
                AWS Account ID: {account.awsAccountId}
              </Text>
              <span
                style={{
                  padding: `${theme.spacing.xs} ${theme.spacing.md}`,
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

          <div style={{ display: "flex", gap: theme.spacing.md }}>
            <Button
              variant="secondary"
              onClick={handleSync}
              loading={syncMutation.isPending}
              icon={<RefreshCw style={{ width: "1rem", height: "1rem" }} />}
              style={{ width: "auto" }}
            >
              {syncMutation.isPending ? "Syncing..." : "Sync Now"}
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                navigate(`/dashboard/aws/accounts/${accountId}/settings`)
              }
              icon={<Settings style={{ width: "1rem", height: "1rem" }} />}
              style={{ width: "auto" }}
            >
              Settings
            </Button>
            <Button
              variant="secondary"
              onClick={handleDelete}
              icon={<Trash2 style={{ width: "1rem", height: "1rem" }} />}
              style={{
                width: "auto",
                borderColor: theme.colors.error.default,
                color: theme.colors.error.default,
              }}
            >
              Disconnect
            </Button>
          </div>
        </div>
      </div>

      {/* Cost Summary */}
      {costSummary && (
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
              border: `1px solid ${theme.colors.zinc[800]}`,
              borderRadius: theme.borderRadius.xl,
            }}
          >
            <div
              style={{
                width: "2.5rem",
                height: "2.5rem",
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
                marginBottom: theme.spacing.xs,
              }}
            >
              Current Monthly Cost
            </Text>
            <div
              style={{ fontSize: "1.75rem", fontWeight: theme.fontWeight.bold }}
            >
              ${costSummary.totalCurrentCost.toFixed(2)}
            </div>
          </div>

          <div
            style={{
              padding: theme.spacing.xl,
              border: `1px solid ${theme.colors.zinc[800]}`,
              borderRadius: theme.borderRadius.xl,
            }}
          >
            <div
              style={{
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: theme.borderRadius.lg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: theme.spacing.md,
              }}
            >
              {costSummary.costChange >= 0 ? (
                <TrendingUp
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                    color: theme.colors.error.default,
                  }}
                />
              ) : (
                <TrendingDown
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                    color: theme.colors.success.default,
                  }}
                />
              )}
            </div>
            <Text
              variant="small"
              style={{
                marginBottom: theme.spacing.xs,
              }}
            >
              Change from Last Month
            </Text>
            <div
              style={{
                fontSize: "1.75rem",
                fontWeight: theme.fontWeight.bold,
                color:
                  costSummary.costChange >= 0
                    ? theme.colors.error.default
                    : theme.colors.success.default,
              }}
            >
              {costSummary.costChange >= 0 ? "+" : ""}
              {costSummary.costChange.toFixed(1)}%
            </div>
          </div>

          <div
            style={{
              padding: theme.spacing.xl,
              border: `1px solid ${theme.colors.zinc[800]}`,
              borderRadius: theme.borderRadius.xl,
            }}
          >
            <div
              style={{
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: theme.borderRadius.lg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: theme.spacing.md,
              }}
            >
              <Server style={{ width: "1.25rem", height: "1.25rem" }} />
            </div>
            <Text
              variant="small"
              style={{
                marginBottom: theme.spacing.xs,
              }}
            >
              Total Resources
            </Text>
            <div
              style={{ fontSize: "1.75rem", fontWeight: theme.fontWeight.bold }}
            >
              {costSummary.totalServices}
            </div>
          </div>

          <div
            style={{
              padding: theme.spacing.xl,
              border: `1px solid ${theme.colors.zinc[800]}`,
              borderRadius: theme.borderRadius.xl,
            }}
          >
            <div
              style={{
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: theme.borderRadius.lg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: theme.spacing.md,
              }}
            >
              <CheckCircle
                style={{
                  width: "1.25rem",
                  height: "1.25rem",
                  color: theme.colors.success.default,
                }}
              />
            </div>
            <Text
              variant="small"
              style={{
                marginBottom: theme.spacing.xs,
              }}
            >
              Running Services
            </Text>
            <div
              style={{ fontSize: "1.75rem", fontWeight: theme.fontWeight.bold }}
            >
              {costSummary.runningServices}
            </div>
          </div>
        </div>
      )}

      {/* Service Filters */}
      <div
        style={{
          display: "flex",
          gap: theme.spacing.md,
          marginBottom: theme.spacing.xl,
          flexWrap: "wrap",
        }}
      >
        {["all", "ec2", "rds", "s3", "lambda"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
              backgroundColor:
                filter === type ? theme.colors.white : theme.colors.zinc[900],
              color: filter === type ? theme.colors.black : theme.colors.white,
              border: `1px solid ${
                filter === type ? theme.colors.black : theme.colors.zinc[800]
              }`,
              borderRadius: theme.borderRadius.lg,
              fontSize: theme.fontSize.sm,
              fontWeight: theme.fontWeight.medium,
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Services List */}
      <div
        style={{
          padding: theme.spacing.xl,
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
          Resources ({filteredServices.length})
        </Heading>

        {filteredServices.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: theme.spacing["3xl"],
            }}
          >
            <Text>No resources found</Text>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: theme.spacing.md,
            }}
          >
            {filteredServices.map((service: ServiceDataType) => (
              <div
                key={service.id}
                onClick={() =>
                  navigate(
                    `/dashboard/aws/accounts/${accountId}/services/${service.id}`
                  )
                }
                style={{
                  padding: theme.spacing.lg,
                  border: `1px solid ${theme.colors.zinc[700]}`,
                  borderRadius: theme.borderRadius.lg,
                  cursor: "pointer",
                  transition: `all ${theme.transitions.normal}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.zinc[600];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.zinc[700];
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: theme.spacing.lg,
                    }}
                  >
                    <div
                      style={{
                        width: "2.5rem",
                        height: "2.5rem",
                        borderRadius: theme.borderRadius.md,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {React.cloneElement(getServiceIcon(service.serviceType), {
                        style: { width: "1.25rem", height: "1.25rem" },
                      })}
                    </div>
                    <div>
                      <h4
                        style={{
                          fontSize: theme.fontSize.base,
                          fontWeight: theme.fontWeight.semibold,
                          marginBottom: theme.spacing.xs,
                        }}
                      >
                        {service.serviceName}
                      </h4>
                      <div
                        style={{
                          display: "flex",
                          gap: theme.spacing.md,
                          alignItems: "center",
                        }}
                      >
                        <Text variant="small">{service.resourceId}</Text>
                        <span
                          style={{
                            fontSize: theme.fontSize.xs,
                            padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                            borderRadius: theme.borderRadius.sm,
                          }}
                        >
                          {service.region}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: theme.fontSize.lg,
                        fontWeight: theme.fontWeight.semibold,
                      }}
                    >
                      ${service.currentMonthlyCost.toFixed(2)}/mo
                    </div>
                    <Text variant="small">{service.status}</Text>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
