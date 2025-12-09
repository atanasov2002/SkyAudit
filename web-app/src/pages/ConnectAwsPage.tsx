import React, { useState } from "react";
import {
  Cloud,
  Shield,
  Key,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import {
  PageContainer,
  Card,
  Heading,
  Text,
  Form,
  FieldGroup,
  Label,
  Input,
  Button,
  ErrorText,
  HelperText,
  Checkbox,
  StyledHeading,
} from "@/components/styled/StyledComponents";
import { theme } from "@/styles/theme";
import { apiClient } from "@/lib/api-client";
import { useNavigate } from "react-router";
import { useConnectAwsAccount } from "@/hooks/useAws";

export default function ConnectAwsPage() {
  const navigate = useNavigate();

  const connectMutation = useConnectAwsAccount();

  const [step, setStep] = useState<"method" | "role" | "keys">("method");
  const [success, setSuccess] = useState(false);

  // Form data
  const [accountName, setAccountName] = useState("");
  const [roleArn, setRoleArn] = useState("");
  const [externalId] = useState(
    () =>
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
  );
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretAccessKey, setSecretAccessKey] = useState("");
  const [selectedRegions, setSelectedRegions] = useState(["eu-north-1"]);

  const availableRegions = [
    "us-east-1",
    "us-east-2",
    "us-west-1",
    "us-west-2",
    "eu-west-1",
    "eu-west-2",
    "eu-north-1",
    "eu-central-1",
    "ap-southeast-1",
    "ap-southeast-2",
    "ap-northeast-1",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      accountName,
      regions: selectedRegions,
    };

    if (step === "role") {
      payload.roleArn = roleArn;
      payload.externalId = externalId;
    } else {
      payload.accessKeyId = accessKeyId;
      payload.secretAccessKey = secretAccessKey;
    }

    connectMutation.mutate(payload, {
      onSuccess: () => {
        setSuccess(true);
        setTimeout(() => navigate("/dashboard"), 1500);
      },
    });
  };

  const toggleRegion = (region: string) => {
    setSelectedRegions((prev) =>
      prev.includes(region)
        ? prev.filter((r) => r !== region)
        : [...prev, region]
    );
  };

  if (success) {
    return (
      <PageContainer>
        <Card style={{ textAlign: "center" }}>
          <div
            style={{
              width: "4rem",
              height: "4rem",
              backgroundColor: theme.colors.success.default,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              marginBottom: theme.spacing.xl,
            }}
          >
            <CheckCircle
              style={{
                width: "2rem",
                height: "2rem",
                color: theme.colors.white,
              }}
            />
          </div>
          <Heading level={2} style={{ marginBottom: theme.spacing.md }}>
            AWS Account Connected!
          </Heading>
          <Text
            variant="small"
            style={{
              color: theme.colors.zinc[400],
              marginBottom: theme.spacing.xl,
            }}
          >
            We're now discovering your AWS resources. This may take a few
            minutes.
          </Text>
          <Button onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
        </Card>
      </PageContainer>
    );
  }

  if (step === "method") {
    return (
      <PageContainer style={{ backgroundColor: "transparent" }}>
        <Card style={{ maxWidth: "600px", backgroundColor: "transparent" }}>
          <button
            onClick={() => navigate("/dashboard")}
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
            }}
          >
            <ArrowLeft style={{ width: "1rem", height: "1rem" }} />
            Back to Dashboard
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.md,
              marginBottom: theme.spacing["3xl"],
            }}
          >
            <div
              style={{
                width: "3rem",
                height: "3rem",
                backgroundColor: theme.colors.white,
                borderRadius: theme.borderRadius.lg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Cloud
                style={{
                  width: "1.5rem",
                  height: "1.5rem",
                  color: theme.colors.black,
                }}
              />
            </div>
            <div>
              <Heading
                level={2}
                style={{
                  marginBottom: theme.spacing.xs,
                  color: "AccentColor",
                }}
              >
                Connect AWS Account
              </Heading>

              <Text variant="small" style={{ color: theme.colors.zinc[400] }}>
                Choose how to authenticate with AWS
              </Text>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: theme.spacing.lg,
            }}
          >
            {/* IAM Role (Recommended) */}
            <div
              onClick={() => setStep("role")}
              style={{
                padding: theme.spacing.xl,
                backgroundColor: theme.colors.zinc[800],
                border: `2px solid ${theme.colors.success.default}`,
                borderRadius: theme.borderRadius.lg,
                cursor: "pointer",
                transition: `all ${theme.transitions.normal}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: theme.spacing.lg,
                }}
              >
                <div
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    backgroundColor: theme.colors.success.default,
                    borderRadius: theme.borderRadius.md,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Shield
                    style={{
                      width: "1.25rem",
                      height: "1.25rem",
                      color: theme.colors.white,
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: theme.spacing.sm,
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    <h3
                      style={{
                        fontSize: theme.fontSize.lg,
                        fontWeight: theme.fontWeight.semibold,
                      }}
                    >
                      IAM Role (Recommended)
                    </h3>
                    <span
                      style={{
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        backgroundColor: theme.colors.success.default,
                        color: theme.colors.white,
                        borderRadius: theme.borderRadius.sm,
                        fontSize: theme.fontSize.xs,
                        fontWeight: theme.fontWeight.medium,
                      }}
                    >
                      Most Secure
                    </span>
                  </div>
                  <Text
                    variant="small"
                    style={{
                      color: theme.colors.zinc[400],
                      marginBottom: theme.spacing.md,
                    }}
                  >
                    Use cross-account IAM role with temporary credentials. No
                    permanent keys stored.
                  </Text>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: theme.spacing.xs,
                    }}
                  >
                    <li
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: theme.spacing.xs,
                      }}
                    >
                      <CheckCircle
                        style={{
                          width: "1rem",
                          height: "1rem",
                          color: theme.colors.success.default,
                        }}
                      />
                      <span style={{ fontSize: theme.fontSize.sm }}>
                        No credentials stored
                      </span>
                    </li>
                    <li
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: theme.spacing.xs,
                      }}
                    >
                      <CheckCircle
                        style={{
                          width: "1rem",
                          height: "1rem",
                          color: theme.colors.success.default,
                        }}
                      />
                      <span style={{ fontSize: theme.fontSize.sm }}>
                        Easy to revoke access
                      </span>
                    </li>
                    <li
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: theme.spacing.xs,
                      }}
                    >
                      <CheckCircle
                        style={{
                          width: "1rem",
                          height: "1rem",
                          color: theme.colors.success.default,
                        }}
                      />
                      <span style={{ fontSize: theme.fontSize.sm }}>
                        AWS best practice
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* IAM User */}
            <div
              onClick={() => setStep("keys")}
              style={{
                padding: theme.spacing.xl,
                backgroundColor: theme.colors.zinc[800],
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
                  alignItems: "flex-start",
                  gap: theme.spacing.lg,
                }}
              >
                <div
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    backgroundColor: theme.colors.zinc[700],
                    borderRadius: theme.borderRadius.md,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Key style={{ width: "1.25rem", height: "1.25rem" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: theme.fontSize.lg,
                      fontWeight: theme.fontWeight.semibold,
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    IAM User Access Keys
                  </h3>
                  <Text
                    variant="small"
                    style={{ color: theme.colors.zinc[400] }}
                  >
                    Use programmatic access keys from an IAM user. Simpler setup
                    but less secure.
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Card>
        <button
          onClick={() => setStep("method")}
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
          }}
        >
          <ArrowLeft style={{ width: "1rem", height: "1rem" }} />
          Change Method
        </button>

        <Heading level={2} style={{ marginBottom: theme.spacing.md }}>
          {step === "role" ? "Connect via IAM Role" : "Connect via Access Keys"}
        </Heading>
        <Text
          variant="small"
          style={{
            color: theme.colors.zinc[400],
            marginBottom: theme.spacing["3xl"],
          }}
        >
          {step === "role"
            ? "Create an IAM role in your AWS account and provide the ARN"
            : "Provide your AWS access key ID and secret access key"}
        </Text>

        {step === "role" && (
          <div
            style={{
              padding: theme.spacing.lg,
              backgroundColor: theme.colors.zinc[800],
              border: `1px solid ${theme.colors.zinc[700]}`,
              borderRadius: theme.borderRadius.lg,
              marginBottom: theme.spacing["2xl"],
            }}
          >
            <h4
              style={{
                fontSize: theme.fontSize.base,
                fontWeight: theme.fontWeight.semibold,
                marginBottom: theme.spacing.md,
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.sm,
              }}
            >
              <AlertCircle style={{ width: "1.25rem", height: "1.25rem" }} />
              Setup Instructions
            </h4>
            <ol
              style={{
                paddingLeft: theme.spacing.xl,
                display: "flex",
                flexDirection: "column",
                gap: theme.spacing.sm,
                fontSize: theme.fontSize.sm,
                color: theme.colors.zinc[400],
              }}
            >
              <li>Go to AWS IAM Console → Roles → Create Role</li>
              <li>Select "Another AWS Account"</li>
              <li>
                Use External ID:{" "}
                <code
                  style={{
                    backgroundColor: theme.colors.zinc[900],
                    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                    borderRadius: theme.borderRadius.sm,
                  }}
                >
                  {externalId}
                </code>
              </li>
              <li>
                Attach policies: ReadOnlyAccess, CostExplorerReadOnlyAccess
              </li>
              <li>Copy the Role ARN and paste it below</li>
            </ol>
            <a
              href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-user.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: theme.spacing.xs,
                color: theme.colors.white,
                fontSize: theme.fontSize.sm,
                marginTop: theme.spacing.md,
                textDecoration: "none",
              }}
            >
              View detailed guide
              <ExternalLink style={{ width: "1rem", height: "1rem" }} />
            </a>
          </div>
        )}

        <Form onSubmit={handleSubmit}>
          <FieldGroup>
            <Label htmlFor="accountName" required>
              Account Name
            </Label>
            <Input
              id="accountName"
              type="text"
              placeholder="e.g., Production, Development, etc."
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required
            />
            <HelperText>
              A friendly name to identify this AWS account
            </HelperText>
          </FieldGroup>

          {step === "role" ? (
            <>
              <FieldGroup>
                <Label htmlFor="roleArn" required>
                  IAM Role ARN
                </Label>
                <Input
                  id="roleArn"
                  type="text"
                  placeholder="arn:aws:iam::123456789012:role/SkyAuditRole"
                  value={roleArn}
                  onChange={(e) => setRoleArn(e.target.value)}
                  required
                />
              </FieldGroup>

              <FieldGroup>
                <Label>External ID (for security)</Label>
                <Input
                  type="text"
                  value={externalId}
                  readOnly
                  style={{ backgroundColor: theme.colors.zinc[800] }}
                />
                <HelperText>
                  Use this External ID when creating the role
                </HelperText>
              </FieldGroup>
            </>
          ) : (
            <>
              <FieldGroup>
                <Label htmlFor="accessKeyId" required>
                  Access Key ID
                </Label>
                <Input
                  id="accessKeyId"
                  type="text"
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                  value={accessKeyId}
                  onChange={(e) => setAccessKeyId(e.target.value)}
                  required
                />
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="secretAccessKey" required>
                  Secret Access Key
                </Label>
                <Input
                  id="secretAccessKey"
                  type="password"
                  placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                  value={secretAccessKey}
                  onChange={(e) => setSecretAccessKey(e.target.value)}
                  required
                />
                <HelperText style={{ color: theme.colors.warning.default }}>
                  ⚠️ Keys are encrypted but use IAM Role for better security
                </HelperText>
              </FieldGroup>
            </>
          )}

          <FieldGroup>
            <Label>Regions to Monitor</Label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: theme.spacing.sm,
              }}
            >
              {availableRegions.map((region) => (
                <Checkbox
                  key={region}
                  id={region}
                  checked={selectedRegions.includes(region)}
                  onChange={() => toggleRegion(region)}
                  label={region}
                />
              ))}
            </div>
            <HelperText>
              Select the regions where your resources are deployed
            </HelperText>
          </FieldGroup>

          {connectMutation.isError && (
            <ErrorText
              icon={<AlertCircle style={{ width: "1rem", height: "1rem" }} />}
            >
              {connectMutation.error?.message}
            </ErrorText>
          )}

          <Button
            type="submit"
            loading={connectMutation.isPending}
            disabled={
              connectMutation.isPending ||
              connectMutation.isError ||
              connectMutation.isPaused
            }
          >
            {connectMutation.isPending
              ? "Connecting..."
              : "Connect AWS Account"}
          </Button>
        </Form>
      </Card>
    </PageContainer>
  );
}
