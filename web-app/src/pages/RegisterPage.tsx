// src/pages/RegisterPage.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  Cloud,
  User,
  Mail,
  Building,
  Key,
  CheckCircle2,
  AlertCircle,
  Eye,
  TrendingDown,
  BarChart3,
  Shield,
  Bell,
  Database,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Logo,
  Form,
  FieldGroup,
  Label,
  Input,
  Select,
  Checkbox,
  Button,
  ErrorText,
  Heading,
  Text,
  Link,
  FeatureList,
  FeatureItem,
  PasswordStrength,
} from "@/components/styled/StyledComponents";
import { theme } from "@/styles/theme";

export default function Register() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    company: "",
    jobTitle: "",
    phoneNumber: "",
    teamSize: "",
    cloudProviders: [] as string[],
    password: "",
    confirmPassword: "",
    newsletter: true,
  });
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  React.useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate]);

  const cloudProviderOptions = [
    "AWS",
    "Azure",
    "GCP",
    "Oracle Cloud",
    "IBM Cloud",
    "Other",
  ];
  const teamSizeOptions = ["1-10", "11-50", "51-200", "201-1000", "1000+"];

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!validateEmail(formData.email))
      newErrors.email = "Valid email is required";
    if (!formData.company.trim())
      newErrors.company = "Company name is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!agreed) newErrors.terms = "You must agree to the terms and conditions";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await register({
          name: formData.fullName,
          email: formData.email,
          company: formData.company,
          jobTitle: formData.jobTitle || undefined,
          phoneNumber: formData.phoneNumber || undefined,
          teamSize: formData.teamSize || undefined,
          cloudProviders:
            formData.cloudProviders.length > 0
              ? formData.cloudProviders
              : undefined,
          password: formData.password,
          newsletter: formData.newsletter,
        });
        navigate("/login", {
          state: { message: "Registration successful! Please log in." },
        });
      } catch (error) {
        setApiError(
          error instanceof Error
            ? error.message
            : "Registration failed. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const toggleCloudProvider = (provider: string) => {
    setFormData((prev) => ({
      ...prev,
      cloudProviders: prev.cloudProviders.includes(provider)
        ? prev.cloudProviders.filter((p) => p !== provider)
        : [...prev.cloudProviders, provider],
    }));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: theme.colors.black,
        color: theme.colors.white,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(0, 1fr))",
          minHeight: "100vh",
        }}
      >
        {/* Left Side - Branding */}
        <div
          style={{
            display: "none",
            flexDirection: "column",
            justifyContent: "center",
            padding: "3rem",
            backgroundColor: theme.colors.zinc[950],
            borderRight: `1px solid ${theme.colors.zinc[800]}`,
            overflowY: "auto",
          }}
          className="lg:flex"
        >
          <div style={{ maxWidth: "32rem" }}>
            <Logo
              icon={
                <Cloud
                  style={{
                    width: "1.75rem",
                    height: "1.75rem",
                    color: "black",
                  }}
                />
              }
              title="CloudAudit"
            />
            <Heading
              level={2}
              style={{
                marginBottom: "1.5rem",
                lineHeight: 1.2,
                fontSize: "2.25rem",
              }}
            >
              Optimize Your Cloud Infrastructure
            </Heading>
            <Text
              style={{
                fontSize: "1.125rem",
                color: theme.colors.zinc[400],
                marginBottom: "3rem",
              }}
            >
              Monitor, visualize, and reduce cloud costs with intelligent
              recommendations powered by real-time analytics.
            </Text>
            <FeatureList>
              <FeatureItem
                icon={<Eye style={{ width: "1.25rem", height: "1.25rem" }} />}
                title="Real-time Monitoring"
                description="Track your cloud resources and spending across all providers"
              />
              <FeatureItem
                icon={
                  <BarChart3 style={{ width: "1.25rem", height: "1.25rem" }} />
                }
                title="Advanced Visualization"
                description="Beautiful dashboards with interactive charts"
              />
              <FeatureItem
                icon={
                  <TrendingDown
                    style={{ width: "1.25rem", height: "1.25rem" }}
                  />
                }
                title="Cost Optimization"
                description="AI-powered recommendations to reduce spending by up to 40%"
              />
              <FeatureItem
                icon={
                  <Shield style={{ width: "1.25rem", height: "1.25rem" }} />
                }
                title="Security & Compliance"
                description="Enterprise-grade security with SOC 2 compliance"
              />
              <FeatureItem
                icon={<Bell style={{ width: "1.25rem", height: "1.25rem" }} />}
                title="Smart Alerts"
                description="Custom notifications for budget overruns and anomalies"
              />
              <FeatureItem
                icon={
                  <Database style={{ width: "1.25rem", height: "1.25rem" }} />
                }
                title="Multi-Cloud Support"
                description="Unified view across AWS, Azure, GCP, and more"
              />
            </FeatureList>
          </div>
        </div>

        {/* Right Side - Form */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "3rem",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "28rem",
              paddingTop: "2rem",
              paddingBottom: "2rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.md,
                marginBottom: "2rem",
              }}
              className="lg:hidden"
            >
              <div
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  backgroundColor: theme.colors.white,
                  borderRadius: theme.borderRadius.lg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Cloud
                  style={{ width: "1.5rem", height: "1.5rem", color: "black" }}
                />
              </div>
              <h1
                style={{
                  fontSize: theme.fontSize["2xl"],
                  fontWeight: theme.fontWeight.bold,
                }}
              >
                CloudAudit
              </h1>
            </div>

            <Heading level={2} style={{ fontSize: "1.875rem" }}>
              Create your account
            </Heading>
            <Text variant="small" style={{ marginBottom: "2rem" }}>
              Start optimizing your cloud costs today
            </Text>

            {apiError && (
              <div
                style={{
                  marginBottom: "1.5rem",
                  padding: theme.spacing.lg,
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: `1px solid ${theme.colors.error.default}`,
                  borderRadius: theme.borderRadius.lg,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: theme.spacing.md,
                }}
              >
                <AlertCircle
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                    color: theme.colors.error.default,
                    flexShrink: 0,
                    marginTop: "0.125rem",
                  }}
                />
                <p
                  style={{
                    color: theme.colors.error.default,
                    fontSize: theme.fontSize.sm,
                  }}
                >
                  {apiError}
                </p>
              </div>
            )}

            <Form onSubmit={handleSubmit}>
              <FieldGroup>
                <Label required>Full Name</Label>
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  icon={<User />}
                  error={!!errors.fullName}
                />
                {errors.fullName && (
                  <ErrorText
                    icon={
                      <AlertCircle
                        style={{ width: "0.75rem", height: "0.75rem" }}
                      />
                    }
                  >
                    {errors.fullName}
                  </ErrorText>
                )}
              </FieldGroup>

              <FieldGroup>
                <Label required>Work Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@company.com"
                  icon={<Mail />}
                  error={!!errors.email}
                />
                {errors.email && (
                  <ErrorText
                    icon={
                      <AlertCircle
                        style={{ width: "0.75rem", height: "0.75rem" }}
                      />
                    }
                  >
                    {errors.email}
                  </ErrorText>
                )}
              </FieldGroup>

              <FieldGroup>
                <Label required>Company Name</Label>
                <Input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Your Company Inc."
                  icon={<Building />}
                  error={!!errors.company}
                />
                {errors.company && (
                  <ErrorText
                    icon={
                      <AlertCircle
                        style={{ width: "0.75rem", height: "0.75rem" }}
                      />
                    }
                  >
                    {errors.company}
                  </ErrorText>
                )}
              </FieldGroup>

              <FieldGroup>
                <Label>
                  Job Title{" "}
                  <span
                    style={{
                      color: theme.colors.zinc[500],
                      fontSize: theme.fontSize.xs,
                    }}
                  >
                    (Optional)
                  </span>
                </Label>
                <Input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  placeholder="DevOps Engineer"
                />
              </FieldGroup>

              <FieldGroup>
                <Label>
                  Team Size{" "}
                  <span
                    style={{
                      color: theme.colors.zinc[500],
                      fontSize: theme.fontSize.xs,
                    }}
                  >
                    (Optional)
                  </span>
                </Label>
                <Select
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleChange}
                >
                  <option value="">Select team size</option>
                  {teamSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size} employees
                    </option>
                  ))}
                </Select>
              </FieldGroup>

              <FieldGroup>
                <Label>
                  Cloud Providers{" "}
                  <span
                    style={{
                      color: theme.colors.zinc[500],
                      fontSize: theme.fontSize.xs,
                    }}
                  >
                    (Optional)
                  </span>
                </Label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: theme.spacing.sm,
                  }}
                >
                  {cloudProviderOptions.map((provider) => (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => toggleCloudProvider(provider)}
                      style={{
                        padding: theme.spacing.sm,
                        borderRadius: theme.borderRadius.lg,
                        border: "1px solid",
                        backgroundColor: formData.cloudProviders.includes(
                          provider
                        )
                          ? theme.colors.white
                          : theme.colors.zinc[900],
                        color: formData.cloudProviders.includes(provider)
                          ? theme.colors.black
                          : theme.colors.white,
                        borderColor: formData.cloudProviders.includes(provider)
                          ? theme.colors.white
                          : theme.colors.zinc[800],
                        transition: `all ${theme.transitions.normal}`,
                        cursor: "pointer",
                      }}
                    >
                      {provider}
                    </button>
                  ))}
                </div>
              </FieldGroup>

              <FieldGroup>
                <Label required>Password</Label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  icon={<Key />}
                  error={!!errors.password}
                />
                <PasswordStrength password={formData.password} />
                {errors.password && (
                  <ErrorText
                    icon={
                      <AlertCircle
                        style={{ width: "0.75rem", height: "0.75rem" }}
                      />
                    }
                  >
                    {errors.password}
                  </ErrorText>
                )}
              </FieldGroup>

              <FieldGroup>
                <Label required>Confirm Password</Label>
                <div style={{ position: "relative" }}>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    icon={<Key />}
                    error={!!errors.confirmPassword}
                  />
                  {formData.confirmPassword &&
                    formData.password === formData.confirmPassword && (
                      <CheckCircle2
                        style={{
                          position: "absolute",
                          right: theme.spacing.md,
                          top: theme.spacing.md,
                          width: "1.25rem",
                          height: "1.25rem",
                          color: theme.colors.success.default,
                        }}
                      />
                    )}
                </div>
                {errors.confirmPassword && (
                  <ErrorText
                    icon={
                      <AlertCircle
                        style={{ width: "0.75rem", height: "0.75rem" }}
                      />
                    }
                  >
                    {errors.confirmPassword}
                  </ErrorText>
                )}
              </FieldGroup>

              <div>
                <Checkbox
                  id="terms"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  label={
                    <>
                      I agree to the{" "}
                      <Link to="#" style={{ color: theme.colors.white }}>
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link to="#" style={{ color: theme.colors.white }}>
                        Privacy Policy
                      </Link>
                    </>
                  }
                />
                {errors.terms && (
                  <ErrorText
                    icon={
                      <AlertCircle
                        style={{ width: "0.75rem", height: "0.75rem" }}
                      />
                    }
                  >
                    {errors.terms}
                  </ErrorText>
                )}
              </div>

              <Checkbox
                id="newsletter"
                checked={formData.newsletter}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    newsletter: e.target.checked,
                  }))
                }
                label="Send me tips, best practices, and product updates"
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>
            </Form>

            <Text
              variant="small"
              style={{ textAlign: "center", marginTop: "1.5rem" }}
            >
              Already have an account?{" "}
              <Link to="/login" style={{ fontWeight: theme.fontWeight.medium }}>
                Sign in
              </Link>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
