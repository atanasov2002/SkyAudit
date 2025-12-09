// src/pages/HomePage.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  Cloud,
  TrendingDown,
  Shield,
  Zap,
  BarChart3,
  Eye,
  Bell,
  CheckCircle,
  ArrowRight,
  Server,
  Database,
  Network,
  Cpu,
  HardDrive,
  Globe,
  ChevronDown,
  Menu,
  X,
  Play,
} from "lucide-react";
import {
  Button,
  Heading,
  Text,
  Link,
} from "@/components/styled/StyledComponents";
import { theme } from "@/styles/theme";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { useAuth } from "@/contexts/AuthContext";
import AuthButtonSkeleton from "@/components/AuthButtonSkeleton";

export default function HomePage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoading, isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Eye style={{ width: "1.5rem", height: "1.5rem" }} />,
      title: "Real-time Monitoring",
      description:
        "Track all your AWS resources in real-time with comprehensive dashboards and instant alerts.",
    },
    {
      icon: <TrendingDown style={{ width: "1.5rem", height: "1.5rem" }} />,
      title: "Cost Optimization",
      description:
        "AI-powered recommendations to reduce your AWS spending by up to 40% without compromising performance.",
    },
    {
      icon: <Zap style={{ width: "1.5rem", height: "1.5rem" }} />,
      title: "Performance Insights",
      description:
        "Identify bottlenecks and optimize resource allocation for maximum efficiency.",
    },
    {
      icon: <Shield style={{ width: "1.5rem", height: "1.5rem" }} />,
      title: "Security Compliance",
      description:
        "Automated security audits and compliance checks to keep your infrastructure safe.",
    },
    {
      icon: <BarChart3 style={{ width: "1.5rem", height: "1.5rem" }} />,
      title: "Advanced Analytics",
      description:
        "Deep insights into usage patterns, trends, and anomalies across all services.",
    },
    {
      icon: <Bell style={{ width: "1.5rem", height: "1.5rem" }} />,
      title: "Smart Alerts",
      description:
        "Customizable notifications for budget overruns, performance issues, and security threats.",
    },
  ];

  const services = [
    {
      icon: <Server />,
      name: "EC2 Instances",
      description: "Optimize compute resources and rightsizing",
    },
    {
      icon: <Database />,
      name: "RDS & DynamoDB",
      description: "Database performance and cost analysis",
    },
    {
      icon: <HardDrive />,
      name: "S3 & Storage",
      description: "Storage optimization and lifecycle policies",
    },
    {
      icon: <Network />,
      name: "VPC & Networking",
      description: "Network architecture and security groups",
    },
    {
      icon: <Cpu />,
      name: "Lambda Functions",
      description: "Serverless monitoring and optimization",
    },
    {
      icon: <Globe />,
      name: "CloudFront & Route53",
      description: "CDN and DNS performance tracking",
    },
  ];

  const stats = [
    { value: "40%", label: "Average Cost Reduction" },
    { value: "10K+", label: "Resources Monitored" },
    { value: "99.9%", label: "Uptime SLA" },
    { value: "24/7", label: "Support Available" },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$99",
      period: "/month",
      description: "Perfect for small teams and startups",
      features: [
        "Up to 100 resources",
        "Basic monitoring",
        "Cost recommendations",
        "Email support",
        "7-day data retention",
      ],
    },
    {
      name: "Professional",
      price: "$299",
      period: "/month",
      description: "For growing businesses",
      features: [
        "Up to 1,000 resources",
        "Advanced monitoring",
        "AI-powered insights",
        "Priority support",
        "30-day data retention",
        "Custom alerts",
        "API access",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations",
      features: [
        "Unlimited resources",
        "Enterprise monitoring",
        "Dedicated account manager",
        "24/7 phone support",
        "Unlimited data retention",
        "Advanced security",
        "SLA guarantees",
        "On-premise option",
      ],
    },
  ];

  return (
    <div
      style={{
        backgroundColor: theme.colors.black,
        color: theme.colors.white,
        minHeight: "100vh",
      }}
    >
      {/* Navigation */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${theme.colors.zinc[800]}`,
        }}
      >
        <div
          style={{
            maxWidth: "80rem",
            margin: "0 auto",
            padding: `${theme.spacing.lg} ${theme.spacing["2xl"]}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
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

          {/* Desktop Menu */}
          <div
            style={{
              display: "none",
              gap: theme.spacing["2xl"],
              alignItems: "center",
            }}
            className="md:flex"
          >
            <a
              href="#features"
              style={{
                color: theme.colors.zinc[400],
                textDecoration: "none",
                transition: `color ${theme.transitions.fast}`,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = theme.colors.white)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = theme.colors.zinc[400])
              }
            >
              Features
            </a>
            <a
              href="#services"
              style={{
                color: theme.colors.zinc[400],
                textDecoration: "none",
                transition: `color ${theme.transitions.fast}`,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = theme.colors.white)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = theme.colors.zinc[400])
              }
            >
              Services
            </a>
            <a
              href="#pricing"
              style={{
                color: theme.colors.zinc[400],
                textDecoration: "none",
                transition: `color ${theme.transitions.fast}`,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = theme.colors.white)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = theme.colors.zinc[400])
              }
            >
              Pricing
            </a>
            {isLoading ? (
              <AuthButtonSkeleton />
            ) : isAuthenticated ? (
              <Button
                onClick={() => navigate("/dashboard")}
                style={{
                  width: "auto",
                  padding: `${theme.spacing.sm} ${theme.spacing.xl}`,
                }}
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => navigate("/login")}
                  variant="secondary"
                  style={{
                    width: "auto",
                    padding: `${theme.spacing.sm} ${theme.spacing.xl}`,
                  }}
                >
                  Sign In
                </Button>

                <Button
                  onClick={() => navigate("/register")}
                  style={{
                    width: "auto",
                    padding: `${theme.spacing.sm} ${theme.spacing.xl}`,
                  }}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: "flex",
              padding: theme.spacing.sm,
              backgroundColor: "transparent",
              border: "none",
              color: theme.colors.white,
              cursor: "pointer",
            }}
            className="md:hidden"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            style={{
              padding: theme.spacing["2xl"],
              borderTop: `1px solid ${theme.colors.zinc[800]}`,
              backgroundColor: theme.colors.black,
            }}
            className="md:hidden"
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: theme.spacing.lg,
              }}
            >
              <a
                href="#features"
                style={{ color: theme.colors.white, textDecoration: "none" }}
              >
                Features
              </a>
              <a
                href="#services"
                style={{ color: theme.colors.white, textDecoration: "none" }}
              >
                Services
              </a>
              <a
                href="#pricing"
                style={{ color: theme.colors.white, textDecoration: "none" }}
              >
                Pricing
              </a>
              {!isLoading &&
                (isAuthenticated ? (
                  <Button onClick={() => navigate("/dashboard")}>
                    Dashboard
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => navigate("/login")}
                      variant="secondary"
                    >
                      Sign In
                    </Button>

                    <Button onClick={() => navigate("/register")}>
                      Get Started
                    </Button>
                  </>
                ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        style={{
          padding: `${theme.spacing["4xl"]} ${theme.spacing["2xl"]}`,
          textAlign: "center",
          background: `linear-gradient(to bottom, ${theme.colors.black}, ${theme.colors.zinc[950]})`,
        }}
      >
        <div style={{ maxWidth: "56rem", margin: "0 auto" }}>
          <div
            style={{
              display: "inline-block",
              padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
              backgroundColor: theme.colors.zinc[900],
              borderRadius: theme.borderRadius.xl,
              border: `1px solid ${theme.colors.zinc[800]}`,
              marginBottom: theme.spacing.xl,
            }}
          >
            <Text variant="small" style={{ color: theme.colors.zinc[400] }}>
              🚀 Trusted by 500+ companies worldwide
            </Text>
          </div>

          <h1
            style={{
              fontSize: "3.5rem",
              fontWeight: theme.fontWeight.bold,
              lineHeight: 1.1,
              marginBottom: theme.spacing.xl,
              background: "linear-gradient(to right, #ffffff, #a1a1aa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Optimize Your AWS Infrastructure with AI-Powered Insights
          </h1>

          <Text
            style={{
              fontSize: theme.fontSize.xl,
              color: theme.colors.zinc[400],
              marginBottom: theme.spacing["3xl"],
              lineHeight: 1.6,
            }}
          >
            Monitor, analyze, and optimize your entire AWS ecosystem. Reduce
            costs by up to 40% while improving performance and security.
          </Text>

          <div
            style={{
              display: "flex",
              gap: theme.spacing.lg,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              onClick={() => navigate("/register")}
              style={{
                padding: `${theme.spacing.lg} ${theme.spacing["2xl"]}`,
                fontSize: theme.fontSize.lg,
              }}
            >
              Start Free Trial{" "}
              <ArrowRight style={{ width: "1.25rem", height: "1.25rem" }} />
            </Button>
            <Button
              variant="secondary"
              style={{
                padding: `${theme.spacing.lg} ${theme.spacing["2xl"]}`,
                fontSize: theme.fontSize.lg,
              }}
            >
              <Play style={{ width: "1.25rem", height: "1.25rem" }} /> Watch
              Demo
            </Button>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: theme.spacing["2xl"],
              marginTop: theme.spacing["4xl"],
              padding: theme.spacing["3xl"],
              backgroundColor: theme.colors.zinc[900],
              borderRadius: theme.borderRadius.xl,
              border: `1px solid ${theme.colors.zinc[800]}`,
            }}
          >
            {stats.map((stat, index) => (
              <div key={index} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: theme.fontWeight.bold,
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    color: theme.colors.zinc[400],
                    fontSize: theme.fontSize.sm,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        style={{ padding: `${theme.spacing["4xl"]} ${theme.spacing["2xl"]}` }}
      >
        <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
          <div
            style={{ textAlign: "center", marginBottom: theme.spacing["4xl"] }}
          >
            <Heading
              level={2}
              style={{ fontSize: "2.5rem", marginBottom: theme.spacing.lg }}
            >
              Everything You Need to Optimize AWS
            </Heading>
            <Text
              style={{
                fontSize: theme.fontSize.xl,
                color: theme.colors.zinc[400],
                maxWidth: "48rem",
                margin: "0 auto",
              }}
            >
              Comprehensive monitoring and optimization tools for every AWS
              service you use
            </Text>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: theme.spacing["2xl"],
            }}
          >
            {features.map((feature, index) => (
              <div
                key={index}
                style={{
                  padding: theme.spacing["2xl"],
                  backgroundColor: theme.colors.zinc[900],
                  borderRadius: theme.borderRadius.xl,
                  border: `1px solid ${theme.colors.zinc[800]}`,
                  transition: `all ${theme.transitions.normal}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.zinc[600];
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.zinc[800];
                  e.currentTarget.style.transform = "translateY(0)";
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
                    marginBottom: theme.spacing.xl,
                    color: theme.colors.black,
                  }}
                >
                  {feature.icon}
                </div>
                <h3
                  style={{
                    fontSize: theme.fontSize.xl,
                    fontWeight: theme.fontWeight.bold,
                    marginBottom: theme.spacing.md,
                  }}
                >
                  {feature.title}
                </h3>
                <Text
                  variant="small"
                  style={{ color: theme.colors.zinc[400], lineHeight: 1.6 }}
                >
                  {feature.description}
                </Text>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        id="services"
        style={{
          padding: `${theme.spacing["4xl"]} ${theme.spacing["2xl"]}`,
          backgroundColor: theme.colors.zinc[950],
        }}
      >
        <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
          <div
            style={{ textAlign: "center", marginBottom: theme.spacing["4xl"] }}
          >
            <Heading
              level={2}
              style={{ fontSize: "2.5rem", marginBottom: theme.spacing.lg }}
            >
              Monitor All Your AWS Services
            </Heading>
            <Text
              style={{
                fontSize: theme.fontSize.xl,
                color: theme.colors.zinc[400],
              }}
            >
              Comprehensive coverage across your entire AWS infrastructure
            </Text>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: theme.spacing.xl,
            }}
          >
            {services.map((service, index) => (
              <div
                key={index}
                style={{
                  padding: theme.spacing.xl,
                  backgroundColor: theme.colors.zinc[900],
                  borderRadius: theme.borderRadius.lg,
                  border: `1px solid ${theme.colors.zinc[800]}`,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: theme.spacing.lg,
                  transition: `all ${theme.transitions.normal}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    theme.colors.zinc[800];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    theme.colors.zinc[900];
                }}
              >
                <div
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    backgroundColor: theme.colors.white,
                    borderRadius: theme.borderRadius.md,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: theme.colors.black,
                  }}
                >
                  {React.cloneElement(service.icon, {
                    style: { width: "1.25rem", height: "1.25rem" },
                  })}
                </div>
                <div>
                  <h3
                    style={{
                      fontWeight: theme.fontWeight.semibold,
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    {service.name}
                  </h3>
                  <Text
                    variant="small"
                    style={{ color: theme.colors.zinc[500] }}
                  >
                    {service.description}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        style={{ padding: `${theme.spacing["4xl"]} ${theme.spacing["2xl"]}` }}
      >
        <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
          <div
            style={{ textAlign: "center", marginBottom: theme.spacing["4xl"] }}
          >
            <Heading
              level={2}
              style={{ fontSize: "2.5rem", marginBottom: theme.spacing.lg }}
            >
              Simple, Transparent Pricing
            </Heading>
            <Text
              style={{
                fontSize: theme.fontSize.xl,
                color: theme.colors.zinc[400],
              }}
            >
              Choose the plan that fits your needs. No hidden fees.
            </Text>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: theme.spacing["2xl"],
              alignItems: "stretch",
            }}
          >
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                style={{
                  padding: theme.spacing["3xl"],
                  backgroundColor: plan.popular
                    ? theme.colors.white
                    : theme.colors.zinc[900],
                  color: plan.popular ? theme.colors.black : theme.colors.white,
                  borderRadius: theme.borderRadius.xl,
                  border: `2px solid ${
                    plan.popular ? theme.colors.white : theme.colors.zinc[800]
                  }`,
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {plan.popular && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-12px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      padding: `${theme.spacing.xs} ${theme.spacing.lg}`,
                      backgroundColor: theme.colors.black,
                      color: theme.colors.white,
                      borderRadius: theme.borderRadius.xl,
                      fontSize: theme.fontSize.sm,
                      fontWeight: theme.fontWeight.semibold,
                    }}
                  >
                    Most Popular
                  </div>
                )}

                <h3
                  style={{
                    fontSize: theme.fontSize["2xl"],
                    fontWeight: theme.fontWeight.bold,
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  {plan.name}
                </h3>
                <Text
                  variant="small"
                  style={{
                    color: plan.popular
                      ? theme.colors.zinc[600]
                      : theme.colors.zinc[400],
                    marginBottom: theme.spacing.xl,
                  }}
                >
                  {plan.description}
                </Text>

                <div style={{ marginBottom: theme.spacing["2xl"] }}>
                  <span
                    style={{
                      fontSize: "3rem",
                      fontWeight: theme.fontWeight.bold,
                    }}
                  >
                    {plan.price}
                  </span>
                  <span
                    style={{
                      fontSize: theme.fontSize.lg,
                      color: plan.popular
                        ? theme.colors.zinc[600]
                        : theme.colors.zinc[400],
                    }}
                  >
                    {plan.period}
                  </span>
                </div>

                <div
                  style={{ marginBottom: theme.spacing["2xl"], flexGrow: 1 }}
                >
                  {plan.features.map((feature, fIndex) => (
                    <div
                      key={fIndex}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: theme.spacing.md,
                        marginBottom: theme.spacing.md,
                      }}
                    >
                      <CheckCircle
                        style={{
                          width: "1.25rem",
                          height: "1.25rem",
                          color: plan.popular
                            ? theme.colors.black
                            : theme.colors.white,
                          flexShrink: 0,
                        }}
                      />
                      <Text
                        variant="small"
                        style={{
                          color: plan.popular
                            ? theme.colors.zinc[700]
                            : theme.colors.zinc[300],
                        }}
                      >
                        {feature}
                      </Text>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => navigate("/register")}
                  style={{
                    backgroundColor: plan.popular
                      ? theme.colors.black
                      : theme.colors.white,
                    color: plan.popular
                      ? theme.colors.white
                      : theme.colors.black,
                  }}
                >
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: `${theme.spacing["4xl"]} ${theme.spacing["2xl"]}`,
          backgroundColor: theme.colors.zinc[950],
        }}
      >
        <div
          style={{
            maxWidth: "56rem",
            margin: "0 auto",
            textAlign: "center",
            padding: theme.spacing["4xl"],
            backgroundColor: theme.colors.white,
            color: theme.colors.black,
            borderRadius: theme.borderRadius.xl,
          }}
        >
          <Heading
            level={2}
            style={{
              fontSize: "2.5rem",
              marginBottom: theme.spacing.lg,
              color: theme.colors.black,
            }}
          >
            Start Optimizing Your AWS Costs Today
          </Heading>
          <Text
            style={{
              fontSize: theme.fontSize.xl,
              color: theme.colors.zinc[700],
              marginBottom: theme.spacing["3xl"],
            }}
          >
            Join hundreds of companies saving thousands on their cloud
            infrastructure
          </Text>
          <Button
            onClick={() => navigate("/register")}
            style={{
              backgroundColor: theme.colors.black,
              color: theme.colors.white,
              padding: `${theme.spacing.lg} ${theme.spacing["3xl"]}`,
              fontSize: theme.fontSize.lg,
            }}
          >
            Start Free Trial{" "}
            <ArrowRight style={{ width: "1.25rem", height: "1.25rem" }} />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: `${theme.spacing["3xl"]} ${theme.spacing["2xl"]}`,
          borderTop: `1px solid ${theme.colors.zinc[800]}`,
        }}
      >
        <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: theme.spacing["3xl"],
              marginBottom: theme.spacing["3xl"],
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.md,
                  marginBottom: theme.spacing.lg,
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
                    style={{
                      width: "1.25rem",
                      height: "1.25rem",
                      color: "black",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontWeight: theme.fontWeight.bold,
                    fontSize: theme.fontSize.lg,
                  }}
                >
                  CloudAudit
                </span>
              </div>
              <Text variant="small" style={{ color: theme.colors.zinc[500] }}>
                Optimize your AWS infrastructure with AI-powered insights and
                recommendations.
              </Text>
            </div>

            <div>
              <h4
                style={{
                  fontWeight: theme.fontWeight.semibold,
                  marginBottom: theme.spacing.lg,
                }}
              >
                Product
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: theme.spacing.md,
                }}
              >
                <a
                  href="#features"
                  style={{
                    color: theme.colors.zinc[400],
                    textDecoration: "none",
                    fontSize: theme.fontSize.sm,
                  }}
                >
                  Features
                </a>
                <a
                  href="#services"
                  style={{
                    color: theme.colors.zinc[400],
                    textDecoration: "none",
                    fontSize: theme.fontSize.sm,
                  }}
                >
                  Services
                </a>
                <a
                  href="#pricing"
                  style={{
                    color: theme.colors.zinc[400],
                    textDecoration: "none",
                    fontSize: theme.fontSize.sm,
                  }}
                >
                  Pricing
                </a>
              </div>
            </div>

            <div>
              <h4
                style={{
                  fontWeight: theme.fontWeight.semibold,
                  marginBottom: theme.spacing.lg,
                }}
              >
                Company
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: theme.spacing.md,
                }}
              >
                <a
                  href="#"
                  style={{
                    color: theme.colors.zinc[400],
                    textDecoration: "none",
                    fontSize: theme.fontSize.sm,
                  }}
                >
                  About
                </a>
                <a
                  href="#"
                  style={{
                    color: theme.colors.zinc[400],
                    textDecoration: "none",
                    fontSize: theme.fontSize.sm,
                  }}
                >
                  Blog
                </a>
                <a
                  href="#"
                  style={{
                    color: theme.colors.zinc[400],
                    textDecoration: "none",
                    fontSize: theme.fontSize.sm,
                  }}
                >
                  Careers
                </a>
              </div>
            </div>

            <div>
              <h4
                style={{
                  fontWeight: theme.fontWeight.semibold,
                  marginBottom: theme.spacing.lg,
                }}
              >
                Legal
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: theme.spacing.md,
                }}
              >
                <a
                  href="#"
                  style={{
                    color: theme.colors.zinc[400],
                    textDecoration: "none",
                    fontSize: theme.fontSize.sm,
                  }}
                >
                  Privacy
                </a>
                <a
                  href="#"
                  style={{
                    color: theme.colors.zinc[400],
                    textDecoration: "none",
                    fontSize: theme.fontSize.sm,
                  }}
                >
                  Terms
                </a>
                <a
                  href="#"
                  style={{
                    color: theme.colors.zinc[400],
                    textDecoration: "none",
                    fontSize: theme.fontSize.sm,
                  }}
                >
                  Security
                </a>
              </div>
            </div>
          </div>

          <div
            style={{
              paddingTop: theme.spacing.xl,
              borderTop: `1px solid ${theme.colors.zinc[800]}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: theme.spacing.lg,
            }}
          >
            <Text variant="small" style={{ color: theme.colors.zinc[500] }}>
              © 2025 CloudAudit. All rights reserved.
            </Text>
            <div style={{ display: "flex", gap: theme.spacing.xl }}>
              <a
                href="#"
                style={{
                  color: theme.colors.zinc[500],
                  textDecoration: "none",
                }}
              >
                Twitter
              </a>
              <a
                href="#"
                style={{
                  color: theme.colors.zinc[500],
                  textDecoration: "none",
                }}
              >
                LinkedIn
              </a>
              <a
                href="#"
                style={{
                  color: theme.colors.zinc[500],
                  textDecoration: "none",
                }}
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
