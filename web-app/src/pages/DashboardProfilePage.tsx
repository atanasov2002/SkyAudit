import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  Shield,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Camera,
  Save,
  RefreshCw,
  Smartphone,
  Key,
  Clock,
  MapPin,
  Calendar,
  Copy,
  CheckCircle2,
} from "lucide-react";

// Mock theme (replace with your actual theme import)
const theme = {
  colors: {
    black: "#000000",
    white: "#ffffff",
    zinc: {
      400: "#a1a1aa",
      500: "#71717a",
      600: "#52525b",
      700: "#3f3f46",
      800: "#27272a",
      900: "#18181b",
    },
    success: { default: "#22c55e" },
    error: { default: "#ef4444" },
    warning: { default: "#f59e0b" },
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "2.5rem",
    "3xl": "3rem",
    "4xl": "4rem",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
  },
  fontWeight: {
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  borderRadius: {
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    full: "9999px",
  },
  transitions: {
    normal: "150ms",
  },
};

// Mock API client (replace with your actual API client)
const apiClient = {
  getProfile: async () => ({
    user: {
      id: "3e377c33-6eb5-4d5f-80fc-cb647301ff74",
      email: "atanasovatanas2002@gmail.com",
      name: "Atanas Atanasov",
      isEmailVerified: false,
      twoFactorEnabled: false,
      lastLoginAt: "2025-12-08T21:31:04.645Z",
      lastLoginIp: "::1",
      createdAt: "2025-12-07T21:55:05.738Z",
    },
  }),
  updateProfile: async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: true };
  },
  changePassword: async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (data.currentPassword !== "correct") {
      throw new Error("Current password is incorrect");
    }
    return { success: true };
  },
  requestEmailVerification: async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: true };
  },
  enable2FA: async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      secret: "JBSWY3DPEHPK3PXP",
      qrCode:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      backupCodes: [
        "1234-5678",
        "2345-6789",
        "3456-7890",
        "4567-8901",
        "5678-9012",
      ],
    };
  },
  verify2FA: async (code) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (code !== "123456") {
      throw new Error("Invalid code");
    }
    return { success: true };
  },
  disable2FA: async (code) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: true };
  },
};

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");

  // General settings
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 2FA
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [is2FAVerifying, setIs2FAVerifying] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProfile();
      setUser(response.user);
      setName(response.user.name || "");
      setEmail(response.user.email || "");
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveMessage("");
    try {
      await apiClient.updateProfile({ name, email });
      setSaveMessage("Profile updated successfully!");
      await loadProfile();
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      setSaveMessage("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      await apiClient.changePassword({ currentPassword, newPassword });
      setPasswordSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRequestEmailVerification = async () => {
    try {
      await apiClient.requestEmailVerification();
      setSaveMessage("Verification email sent!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      setSaveMessage("Failed to send verification email");
    }
  };

  const handleEnable2FA = async () => {
    try {
      const response = await apiClient.enable2FA();
      setQrCode(response.qrCode);
      setSecret(response.secret);
      setBackupCodes(response.backupCodes);
      setShow2FASetup(true);
    } catch (err) {
      setTwoFactorError("Failed to enable 2FA");
    }
  };

  const handleVerify2FA = async () => {
    setIs2FAVerifying(true);
    setTwoFactorError("");
    try {
      await apiClient.verify2FA(verificationCode);
      setShow2FASetup(false);
      await loadProfile();
      setSaveMessage("2FA enabled successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      setTwoFactorError(err.message);
    } finally {
      setIs2FAVerifying(false);
    }
  };

  const handleDisable2FA = async () => {
    if (window.confirm("Are you sure you want to disable 2FA?")) {
      try {
        await apiClient.disable2FA();
        await loadProfile();
        setSaveMessage("2FA disabled successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
      } catch (err) {
        setTwoFactorError("Failed to disable 2FA");
      }
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, label: "" };
    if (password.length < 8) return { strength: 1, label: "Weak" };
    if (password.length < 12) return { strength: 2, label: "Medium" };
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password))
      return { strength: 4, label: "Very Strong" };
    return { strength: 3, label: "Strong" };
  };

  const passwordStrength = getPasswordStrength(newPassword);

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
        <RefreshCw
          style={{
            width: "3rem",
            height: "3rem",
            animation: "spin 1s linear infinite",
            color: theme.colors.white,
          }}
        />
      </div>
    );
  }

  const tabs = [
    { id: "general", label: "General", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "2fa", label: "Two-Factor Auth", icon: Shield },
  ];

  return (
    <div
      style={{
        padding: "0 1rem",
        minHeight: "100vh",
      }}
    >
      <style>{`
        @media (min-width: 768px) {
          .profile-container {
            padding: 0 2rem !important;
          }
        }
        @media (min-width: 1024px) {
          .profile-container {
            padding: 0 100px !important;
          }
        }
      `}</style>
      <div className="profile-container" style={{ padding: "0 1rem" }}>
        {/* Header */}
        <div style={{ marginBottom: theme.spacing["3xl"] }}>
          <h1
            style={{
              fontSize: theme.fontSize["2xl"],
              fontWeight: theme.fontWeight.bold,
              marginBottom: theme.spacing.sm,
            }}
            className="profile-title"
          >
            Profile Settings
          </h1>
          <p
            style={{
              fontSize: theme.fontSize.sm,
              color: theme.colors.zinc[400],
            }}
          >
            Manage your account settings and security preferences
          </p>
        </div>

        {/* Success Message */}
        {saveMessage && (
          <div
            style={{
              padding: theme.spacing.lg,
              backgroundColor:
                saveMessage.includes("Failed") || saveMessage.includes("error")
                  ? "rgba(239, 68, 68, 0.1)"
                  : "rgba(34, 197, 94, 0.1)",
              border: `1px solid ${
                saveMessage.includes("Failed") || saveMessage.includes("error")
                  ? theme.colors.error.default
                  : theme.colors.success.default
              }`,
              borderRadius: theme.borderRadius.lg,
              marginBottom: theme.spacing.xl,
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.md,
            }}
          >
            {saveMessage.includes("Failed") || saveMessage.includes("error") ? (
              <AlertCircle
                style={{
                  width: "1.25rem",
                  height: "1.25rem",
                  color: theme.colors.error.default,
                }}
              />
            ) : (
              <CheckCircle2
                style={{
                  width: "1.25rem",
                  height: "1.25rem",
                  color: theme.colors.success.default,
                }}
              />
            )}
            <span
              style={{
                color:
                  saveMessage.includes("Failed") ||
                  saveMessage.includes("error")
                    ? theme.colors.error.default
                    : theme.colors.success.default,
              }}
            >
              {saveMessage}
            </span>
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing["2xl"],
          }}
          className="profile-layout"
        >
          {/* Sidebar */}
          <div
            style={{
              width: "100%",
            }}
            className="profile-sidebar"
          >
            <div
              style={{
                position: "relative",
              }}
              className="sidebar-sticky"
            >
              <div
                style={{
                  display: "flex",
                  gap: theme.spacing.sm,
                  overflowX: "auto",
                  WebkitOverflowScrolling: "touch",
                }}
                className="tabs-container"
              >
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: theme.spacing.sm,
                        padding: theme.spacing.md,
                        backgroundColor:
                          activeTab === tab.id
                            ? theme.colors.zinc[800]
                            : "transparent",
                        color:
                          activeTab === tab.id
                            ? theme.colors.white
                            : theme.colors.zinc[400],
                        border: "none",
                        borderRadius: theme.borderRadius.lg,
                        fontSize: theme.fontSize.sm,
                        fontWeight: theme.fontWeight.medium,
                        cursor: "pointer",
                        transition: `all ${theme.transitions.normal}`,
                        textAlign: "left",
                        whiteSpace: "nowrap",
                        flex: "0 0 auto",
                      }}
                      className="tab-button"
                    >
                      <Icon style={{ width: "1.25rem", height: "1.25rem" }} />
                      <span className="tab-label">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ flex: 1 }}>
            {/* General Tab */}
            {activeTab === "general" && (
              <div
                style={{
                  padding: theme.spacing["2xl"],
                  border: `1px solid ${theme.colors.zinc[800]}`,
                  borderRadius: theme.borderRadius.xl,
                }}
              >
                <h2
                  style={{
                    fontSize: theme.fontSize["2xl"],
                    fontWeight: theme.fontWeight.bold,
                    marginBottom: theme.spacing.xl,
                  }}
                >
                  General Information
                </h2>

                {/* Profile Picture */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: theme.spacing.lg,
                    border: `1px solid ${theme.colors.zinc[800]}`,
                    marginBottom: theme.spacing["2xl"],
                    padding: theme.spacing.xl,
                    borderRadius: theme.borderRadius.lg,
                  }}
                  className="profile-picture-section"
                >
                  <div
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: theme.borderRadius.full,
                      backgroundColor: theme.colors.zinc[800],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2.5rem",
                      fontWeight: theme.fontWeight.bold,
                      color: theme.colors.white,
                    }}
                  >
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: theme.fontSize.lg,
                        fontWeight: theme.fontWeight.semibold,
                        marginBottom: theme.spacing.xs,
                        textAlign: "center",
                      }}
                      className="profile-picture-title"
                    >
                      Profile Picture
                    </h3>
                    <p
                      style={{
                        fontSize: theme.fontSize.sm,
                        color: theme.colors.zinc[400],
                        marginBottom: theme.spacing.md,
                        textAlign: "center",
                      }}
                      className="profile-picture-desc"
                    >
                      Upload a new profile picture
                    </p>
                    <button
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: theme.spacing.sm,
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
                      <Camera style={{ width: "1rem", height: "1rem" }} />
                      Upload Photo
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div style={{ marginBottom: theme.spacing.xl }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: theme.fontSize.sm,
                      fontWeight: theme.fontWeight.medium,
                      marginBottom: theme.spacing.sm,
                      color: theme.colors.zinc[400],
                    }}
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: theme.spacing.lg,
                      border: `1px solid ${theme.colors.zinc[700]}`,
                      borderRadius: theme.borderRadius.lg,
                      fontSize: theme.fontSize.base,
                      outline: "none",
                    }}
                  />
                </div>

                <div style={{ marginBottom: theme.spacing.xl }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: theme.fontSize.sm,
                      fontWeight: theme.fontWeight.medium,
                      marginBottom: theme.spacing.sm,
                      color: theme.colors.zinc[400],
                    }}
                  >
                    Email Address
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: "100%",
                        padding: theme.spacing.lg,
                        border: `1px solid ${theme.colors.zinc[700]}`,
                        borderRadius: theme.borderRadius.lg,
                        fontSize: theme.fontSize.base,
                        outline: "none",
                      }}
                    />
                    {!user?.isEmailVerified && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: theme.spacing.md,
                          marginTop: theme.spacing.md,
                          padding: theme.spacing.md,
                          backgroundColor: "rgba(245, 158, 11, 0.1)",
                          border: `1px solid ${theme.colors.warning.default}`,
                          borderRadius: theme.borderRadius.lg,
                        }}
                      >
                        <AlertCircle
                          style={{
                            width: "1.25rem",
                            height: "1.25rem",
                            color: theme.colors.warning.default,
                          }}
                        />
                        <span
                          style={{
                            fontSize: theme.fontSize.sm,
                            color: theme.colors.warning.default,
                            flex: 1,
                          }}
                        >
                          Email not verified
                        </span>
                        <button
                          onClick={handleRequestEmailVerification}
                          style={{
                            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                            backgroundColor: theme.colors.warning.default,
                            color: theme.colors.black,
                            border: "none",
                            borderRadius: theme.borderRadius.md,
                            fontSize: theme.fontSize.xs,
                            fontWeight: theme.fontWeight.medium,
                            cursor: "pointer",
                          }}
                        >
                          Verify Now
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Info */}
                <div
                  style={{
                    padding: theme.spacing.xl,
                    border: `1px solid ${theme.colors.zinc[800]}`,
                    borderRadius: theme.borderRadius.lg,
                    marginBottom: theme.spacing.xl,
                  }}
                >
                  <h3
                    style={{
                      fontSize: theme.fontSize.lg,
                      fontWeight: theme.fontWeight.semibold,
                      marginBottom: theme.spacing.lg,
                    }}
                  >
                    Account Information
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: theme.spacing.lg,
                    }}
                    className="account-info-grid"
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: theme.spacing.sm,
                          marginBottom: theme.spacing.xs,
                        }}
                      >
                        <Calendar
                          style={{
                            width: "1rem",
                            height: "1rem",
                            color: theme.colors.zinc[500],
                          }}
                        />
                        <span
                          style={{
                            fontSize: theme.fontSize.xs,
                            color: theme.colors.zinc[500],
                          }}
                        >
                          Member Since
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: theme.fontSize.sm,
                        }}
                      >
                        {new Date(user?.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: theme.spacing.sm,
                          marginBottom: theme.spacing.xs,
                        }}
                      >
                        <Clock
                          style={{
                            width: "1rem",
                            height: "1rem",
                            color: theme.colors.zinc[500],
                          }}
                        />
                        <span
                          style={{
                            fontSize: theme.fontSize.xs,
                            color: theme.colors.zinc[500],
                          }}
                        >
                          Last Login
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: theme.fontSize.sm,
                        }}
                      >
                        {new Date(user?.lastLoginAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: theme.spacing.sm,
                          marginBottom: theme.spacing.xs,
                        }}
                      >
                        <MapPin
                          style={{
                            width: "1rem",
                            height: "1rem",
                            color: theme.colors.zinc[500],
                          }}
                        />
                        <span
                          style={{
                            fontSize: theme.fontSize.xs,
                            color: theme.colors.zinc[500],
                          }}
                        >
                          Last IP
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: theme.fontSize.sm,
                        }}
                      >
                        {user?.lastLoginIp}
                      </p>
                    </div>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: theme.spacing.sm,
                          marginBottom: theme.spacing.xs,
                        }}
                      >
                        <Key
                          style={{
                            width: "1rem",
                            height: "1rem",
                            color: theme.colors.zinc[500],
                          }}
                        />
                        <span
                          style={{
                            fontSize: theme.fontSize.xs,
                            color: theme.colors.zinc[500],
                          }}
                        >
                          User ID
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: theme.fontSize.xs,
                          fontFamily: "monospace",
                        }}
                      >
                        {user?.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: theme.spacing.sm,
                    padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
                    border: `1px solid ${theme.colors.zinc[800]}`,
                    borderRadius: theme.borderRadius.lg,
                    fontSize: theme.fontSize.base,
                    fontWeight: theme.fontWeight.medium,
                    cursor: isSaving ? "not-allowed" : "pointer",
                    opacity: isSaving ? 0.6 : 1,
                  }}
                >
                  {isSaving ? (
                    <RefreshCw
                      style={{
                        width: "1rem",
                        height: "1rem",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                  ) : (
                    <Save style={{ width: "1rem", height: "1rem" }} />
                  )}
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div
                style={{
                  padding: theme.spacing["2xl"],
                  border: `1px solid ${theme.colors.zinc[800]}`,
                  borderRadius: theme.borderRadius.xl,
                }}
              >
                <h2
                  style={{
                    fontSize: theme.fontSize["2xl"],
                    fontWeight: theme.fontWeight.bold,
                    marginBottom: theme.spacing.xl,
                  }}
                >
                  Change Password
                </h2>

                {passwordError && (
                  <div
                    style={{
                      padding: theme.spacing.lg,
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      border: `1px solid ${theme.colors.error.default}`,
                      borderRadius: theme.borderRadius.lg,
                      marginBottom: theme.spacing.xl,
                      display: "flex",
                      alignItems: "center",
                      gap: theme.spacing.md,
                    }}
                  >
                    <AlertCircle
                      style={{
                        width: "1.25rem",
                        height: "1.25rem",
                        color: theme.colors.error.default,
                      }}
                    />
                    <span style={{ color: theme.colors.error.default }}>
                      {passwordError}
                    </span>
                  </div>
                )}

                {passwordSuccess && (
                  <div
                    style={{
                      padding: theme.spacing.lg,
                      backgroundColor: "rgba(34, 197, 94, 0.1)",
                      border: `1px solid ${theme.colors.success.default}`,
                      borderRadius: theme.borderRadius.lg,
                      marginBottom: theme.spacing.xl,
                      display: "flex",
                      alignItems: "center",
                      gap: theme.spacing.md,
                    }}
                  >
                    <CheckCircle2
                      style={{
                        width: "1.25rem",
                        height: "1.25rem",
                        color: theme.colors.success.default,
                      }}
                    />
                    <span style={{ color: theme.colors.success.default }}>
                      {passwordSuccess}
                    </span>
                  </div>
                )}

                <form onSubmit={handleChangePassword}>
                  <div style={{ marginBottom: theme.spacing.xl }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: theme.fontSize.sm,
                        fontWeight: theme.fontWeight.medium,
                        marginBottom: theme.spacing.sm,
                        color: theme.colors.zinc[400],
                      }}
                    >
                      Current Password
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        style={{
                          width: "100%",
                          padding: theme.spacing.lg,
                          paddingRight: "3rem",
                          border: `1px solid ${theme.colors.zinc[700]}`,
                          borderRadius: theme.borderRadius.lg,
                          fontSize: theme.fontSize.base,
                          outline: "none",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        style={{
                          position: "absolute",
                          right: theme.spacing.md,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          color: theme.colors.zinc[400],
                          cursor: "pointer",
                        }}
                      >
                        {showCurrentPassword ? (
                          <EyeOff
                            style={{ width: "1.25rem", height: "1.25rem" }}
                          />
                        ) : (
                          <Eye
                            style={{ width: "1.25rem", height: "1.25rem" }}
                          />
                        )}
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: theme.spacing.xl }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: theme.fontSize.sm,
                        fontWeight: theme.fontWeight.medium,
                        marginBottom: theme.spacing.sm,
                        color: theme.colors.zinc[400],
                      }}
                    >
                      New Password
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{
                          width: "100%",
                          padding: theme.spacing.lg,
                          paddingRight: "3rem",
                          border: `1px solid ${theme.colors.zinc[700]}`,
                          borderRadius: theme.borderRadius.lg,
                          fontSize: theme.fontSize.base,
                          outline: "none",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{
                          position: "absolute",
                          right: theme.spacing.md,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          color: theme.colors.zinc[400],
                          cursor: "pointer",
                        }}
                      >
                        {showNewPassword ? (
                          <EyeOff
                            style={{ width: "1.25rem", height: "1.25rem" }}
                          />
                        ) : (
                          <Eye
                            style={{ width: "1.25rem", height: "1.25rem" }}
                          />
                        )}
                      </button>
                    </div>
                    {newPassword && (
                      <div style={{ marginTop: theme.spacing.md }}>
                        <div
                          style={{
                            display: "flex",
                            gap: theme.spacing.xs,
                            marginBottom: theme.spacing.sm,
                          }}
                        >
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              style={{
                                flex: 1,
                                height: "4px",
                                backgroundColor:
                                  passwordStrength.strength >= level
                                    ? passwordStrength.strength === 1
                                      ? theme.colors.error.default
                                      : passwordStrength.strength === 2
                                      ? theme.colors.warning.default
                                      : theme.colors.success.default
                                    : theme.colors.zinc[800],
                                borderRadius: theme.borderRadius.md,
                                transition: `all ${theme.transitions.normal}`,
                              }}
                            />
                          ))}
                        </div>
                        <p
                          style={{
                            fontSize: theme.fontSize.xs,
                            color:
                              passwordStrength.strength === 1
                                ? theme.colors.error.default
                                : passwordStrength.strength === 2
                                ? theme.colors.warning.default
                                : theme.colors.success.default,
                          }}
                        >
                          {passwordStrength.label}
                        </p>
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: theme.spacing.xl }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: theme.fontSize.sm,
                        fontWeight: theme.fontWeight.medium,
                        marginBottom: theme.spacing.sm,
                        color: theme.colors.zinc[400],
                      }}
                    >
                      Confirm New Password
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{
                          width: "100%",
                          padding: theme.spacing.lg,
                          paddingRight: "3rem",
                          border: `1px solid ${theme.colors.zinc[700]}`,
                          borderRadius: theme.borderRadius.lg,
                          fontSize: theme.fontSize.base,
                          outline: "none",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        style={{
                          position: "absolute",
                          right: theme.spacing.md,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          color: theme.colors.zinc[400],
                          cursor: "pointer",
                        }}
                      >
                        {showConfirmPassword ? (
                          <EyeOff
                            style={{ width: "1.25rem", height: "1.25rem" }}
                          />
                        ) : (
                          <Eye
                            style={{ width: "1.25rem", height: "1.25rem" }}
                          />
                        )}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p
                        style={{
                          fontSize: theme.fontSize.xs,
                          color: theme.colors.error.default,
                          marginTop: theme.spacing.sm,
                        }}
                      >
                        Passwords don't match
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={
                      isChangingPassword ||
                      !currentPassword ||
                      !newPassword ||
                      !confirmPassword
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: theme.spacing.sm,
                      padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
                      border: `1px solid ${theme.colors.zinc[800]}`,
                      borderRadius: theme.borderRadius.lg,
                      fontSize: theme.fontSize.base,
                      fontWeight: theme.fontWeight.medium,
                      cursor:
                        isChangingPassword ||
                        !currentPassword ||
                        !newPassword ||
                        !confirmPassword
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        isChangingPassword ||
                        !currentPassword ||
                        !newPassword ||
                        !confirmPassword
                          ? 0.6
                          : 1,
                    }}
                  >
                    {isChangingPassword ? (
                      <RefreshCw
                        style={{
                          width: "1rem",
                          height: "1rem",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                    ) : (
                      <Lock style={{ width: "1rem", height: "1rem" }} />
                    )}
                    {isChangingPassword ? "Changing..." : "Change Password"}
                  </button>
                </form>
              </div>
            )}

            {/* 2FA Tab */}
            {activeTab === "2fa" && (
              <div
                style={{
                  padding: theme.spacing["2xl"],
                  border: `1px solid ${theme.colors.zinc[800]}`,
                  borderRadius: theme.borderRadius.xl,
                }}
              >
                <h2
                  style={{
                    fontSize: theme.fontSize["2xl"],
                    fontWeight: theme.fontWeight.bold,
                    marginBottom: theme.spacing.xl,
                  }}
                >
                  Two-Factor Authentication
                </h2>

                {!user?.twoFactorEnabled && !show2FASetup && (
                  <div>
                    <div
                      style={{
                        padding: theme.spacing.xl,
                        border: `1px solid ${theme.colors.zinc[800]}`,
                        borderRadius: theme.borderRadius.lg,
                        marginBottom: theme.spacing.xl,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "start",
                          gap: theme.spacing.lg,
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
                            flexShrink: 0,
                          }}
                        >
                          <Smartphone
                            style={{
                              width: "1.5rem",
                              height: "1.5rem",
                              color: theme.colors.white,
                            }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3
                            style={{
                              fontSize: theme.fontSize.lg,
                              fontWeight: theme.fontWeight.semibold,
                              marginBottom: theme.spacing.sm,
                            }}
                          >
                            Secure Your Account
                          </h3>
                          <p
                            style={{
                              fontSize: theme.fontSize.sm,
                              color: theme.colors.zinc[400],
                              marginBottom: theme.spacing.md,
                            }}
                          >
                            Two-factor authentication adds an extra layer of
                            security to your account. You'll need to enter a
                            code from your authenticator app each time you sign
                            in.
                          </p>
                          <ul
                            style={{
                              fontSize: theme.fontSize.sm,
                              color: theme.colors.zinc[400],
                              paddingLeft: theme.spacing.lg,
                            }}
                          >
                            <li style={{ marginBottom: theme.spacing.xs }}>
                              Protect against unauthorized access
                            </li>
                            <li style={{ marginBottom: theme.spacing.xs }}>
                              Receive backup codes for emergencies
                            </li>
                            <li>
                              Compatible with Google Authenticator, Authy, and
                              more
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleEnable2FA}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: theme.spacing.sm,
                        padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
                        border: `1px solid ${theme.colors.zinc[800]}`,
                        borderRadius: theme.borderRadius.lg,
                        fontSize: theme.fontSize.base,
                        fontWeight: theme.fontWeight.medium,
                        cursor: "pointer",
                      }}
                    >
                      <Shield style={{ width: "1rem", height: "1rem" }} />
                      Enable Two-Factor Authentication
                    </button>
                  </div>
                )}

                {show2FASetup && (
                  <div>
                    {twoFactorError && (
                      <div
                        style={{
                          padding: theme.spacing.lg,
                          backgroundColor: "rgba(239, 68, 68, 0.1)",
                          border: `1px solid ${theme.colors.error.default}`,
                          borderRadius: theme.borderRadius.lg,
                          marginBottom: theme.spacing.xl,
                          display: "flex",
                          alignItems: "center",
                          gap: theme.spacing.md,
                        }}
                      >
                        <AlertCircle
                          style={{
                            width: "1.25rem",
                            height: "1.25rem",
                            color: theme.colors.error.default,
                          }}
                        />
                        <span style={{ color: theme.colors.error.default }}>
                          {twoFactorError}
                        </span>
                      </div>
                    )}

                    <div
                      style={{
                        padding: theme.spacing.xl,
                        backgroundColor: theme.colors.zinc[900],
                        borderRadius: theme.borderRadius.lg,
                        marginBottom: theme.spacing.xl,
                      }}
                    >
                      <h3
                        style={{
                          fontSize: theme.fontSize.lg,
                          fontWeight: theme.fontWeight.semibold,
                          marginBottom: theme.spacing.lg,
                        }}
                      >
                        Step 1: Scan QR Code
                      </h3>
                      <p
                        style={{
                          fontSize: theme.fontSize.sm,
                          color: theme.colors.zinc[400],
                          marginBottom: theme.spacing.lg,
                        }}
                      >
                        Scan this QR code with your authenticator app (Google
                        Authenticator, Authy, etc.)
                      </p>
                      <div
                        style={{
                          width: "200px",
                          height: "200px",
                          backgroundColor: theme.colors.white,
                          borderRadius: theme.borderRadius.lg,
                          margin: "0 auto",
                          marginBottom: theme.spacing.lg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src={qrCode}
                          alt="QR Code"
                          style={{
                            width: "180px",
                            height: "180px",
                          }}
                        />
                      </div>
                      <p
                        style={{
                          fontSize: theme.fontSize.xs,
                          color: theme.colors.zinc[500],
                          textAlign: "center",
                          marginBottom: theme.spacing.sm,
                        }}
                      >
                        Or enter this code manually:
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: theme.spacing.md,
                        }}
                      >
                        <code
                          style={{
                            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                            backgroundColor: theme.colors.zinc[800],
                            borderRadius: theme.borderRadius.md,
                            fontFamily: "monospace",
                            fontSize: theme.fontSize.sm,
                          }}
                        >
                          {secret}
                        </code>
                        <button
                          onClick={() => copyToClipboard(secret, "secret")}
                          style={{
                            padding: theme.spacing.sm,
                            backgroundColor: theme.colors.zinc[800],
                            color: theme.colors.white,
                            border: "none",
                            borderRadius: theme.borderRadius.md,
                            cursor: "pointer",
                          }}
                        >
                          {copiedCode === "secret" ? (
                            <Check
                              style={{
                                width: "1rem",
                                height: "1rem",
                                color: theme.colors.success.default,
                              }}
                            />
                          ) : (
                            <Copy style={{ width: "1rem", height: "1rem" }} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: theme.spacing.xl,
                        backgroundColor: theme.colors.zinc[900],
                        borderRadius: theme.borderRadius.lg,
                        marginBottom: theme.spacing.xl,
                      }}
                    >
                      <h3
                        style={{
                          fontSize: theme.fontSize.lg,
                          fontWeight: theme.fontWeight.semibold,
                          marginBottom: theme.spacing.lg,
                        }}
                      >
                        Step 2: Save Backup Codes
                      </h3>
                      <p
                        style={{
                          fontSize: theme.fontSize.sm,
                          color: theme.colors.zinc[400],
                          marginBottom: theme.spacing.lg,
                        }}
                      >
                        Save these backup codes in a secure location. Each code
                        can be used once if you lose access to your
                        authenticator app.
                      </p>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(150px, 1fr))",
                          gap: theme.spacing.md,
                          marginBottom: theme.spacing.lg,
                        }}
                        className="backup-codes-grid"
                      >
                        {backupCodes.map((code, index) => (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: theme.spacing.md,
                              backgroundColor: theme.colors.zinc[800],
                              borderRadius: theme.borderRadius.md,
                            }}
                          >
                            <code
                              style={{
                                fontFamily: "monospace",
                                fontSize: theme.fontSize.sm,
                              }}
                            >
                              {code}
                            </code>
                            <button
                              onClick={() => copyToClipboard(code, code)}
                              style={{
                                padding: theme.spacing.xs,
                                backgroundColor: "transparent",
                                color: theme.colors.zinc[400],
                                border: "none",
                                cursor: "pointer",
                              }}
                            >
                              {copiedCode === code ? (
                                <Check
                                  style={{
                                    width: "0.875rem",
                                    height: "0.875rem",
                                    color: theme.colors.success.default,
                                  }}
                                />
                              ) : (
                                <Copy
                                  style={{
                                    width: "0.875rem",
                                    height: "0.875rem",
                                  }}
                                />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: theme.spacing.xl,
                        backgroundColor: theme.colors.zinc[900],
                        borderRadius: theme.borderRadius.lg,
                        marginBottom: theme.spacing.xl,
                      }}
                    >
                      <h3
                        style={{
                          fontSize: theme.fontSize.lg,
                          fontWeight: theme.fontWeight.semibold,
                          marginBottom: theme.spacing.lg,
                        }}
                      >
                        Step 3: Verify Setup
                      </h3>
                      <p
                        style={{
                          fontSize: theme.fontSize.sm,
                          color: theme.colors.zinc[400],
                          marginBottom: theme.spacing.lg,
                        }}
                      >
                        Enter the 6-digit code from your authenticator app to
                        complete setup.
                      </p>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) =>
                          setVerificationCode(
                            e.target.value.replace(/\D/g, "").slice(0, 6)
                          )
                        }
                        placeholder="000000"
                        style={{
                          width: "100%",
                          padding: theme.spacing.lg,
                          backgroundColor: theme.colors.zinc[800],
                          color: theme.colors.white,
                          border: `1px solid ${theme.colors.zinc[700]}`,
                          borderRadius: theme.borderRadius.lg,
                          fontSize: theme.fontSize.xl,
                          textAlign: "center",
                          letterSpacing: "0.5em",
                          fontFamily: "monospace",
                          outline: "none",
                          marginBottom: theme.spacing.lg,
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: theme.spacing.md,
                        }}
                        className="verify-actions"
                      >
                        <button
                          onClick={handleVerify2FA}
                          disabled={
                            is2FAVerifying || verificationCode.length !== 6
                          }
                          style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: theme.spacing.sm,
                            padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
                            backgroundColor: theme.colors.white,
                            color: theme.colors.black,
                            border: "none",
                            borderRadius: theme.borderRadius.lg,
                            fontSize: theme.fontSize.base,
                            fontWeight: theme.fontWeight.medium,
                            cursor:
                              is2FAVerifying || verificationCode.length !== 6
                                ? "not-allowed"
                                : "pointer",
                            opacity:
                              is2FAVerifying || verificationCode.length !== 6
                                ? 0.6
                                : 1,
                          }}
                        >
                          {is2FAVerifying ? (
                            <RefreshCw
                              style={{
                                width: "1rem",
                                height: "1rem",
                                animation: "spin 1s linear infinite",
                              }}
                            />
                          ) : (
                            <Check style={{ width: "1rem", height: "1rem" }} />
                          )}
                          {is2FAVerifying ? "Verifying..." : "Verify & Enable"}
                        </button>
                        <button
                          onClick={() => setShow2FASetup(false)}
                          style={{
                            padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
                            backgroundColor: theme.colors.zinc[800],
                            color: theme.colors.white,
                            border: `1px solid ${theme.colors.zinc[700]}`,
                            borderRadius: theme.borderRadius.lg,
                            fontSize: theme.fontSize.base,
                            fontWeight: theme.fontWeight.medium,
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {user?.twoFactorEnabled && !show2FASetup && (
                  <div>
                    <div
                      style={{
                        padding: theme.spacing.xl,
                        backgroundColor: "rgba(34, 197, 94, 0.1)",
                        border: `1px solid ${theme.colors.success.default}`,
                        borderRadius: theme.borderRadius.lg,
                        marginBottom: theme.spacing.xl,
                        display: "flex",
                        alignItems: "center",
                        gap: theme.spacing.lg,
                      }}
                    >
                      <div
                        style={{
                          width: "3rem",
                          height: "3rem",
                          backgroundColor: theme.colors.success.default,
                          borderRadius: theme.borderRadius.full,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <CheckCircle2
                          style={{
                            width: "1.5rem",
                            height: "1.5rem",
                            color: theme.colors.black,
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3
                          style={{
                            fontSize: theme.fontSize.lg,
                            fontWeight: theme.fontWeight.semibold,
                            marginBottom: theme.spacing.xs,
                            color: theme.colors.success.default,
                          }}
                        >
                          Two-Factor Authentication Enabled
                        </h3>
                        <p
                          style={{
                            fontSize: theme.fontSize.sm,
                            color: theme.colors.zinc[400],
                          }}
                        >
                          Your account is protected with 2FA. You'll need to
                          enter a code from your authenticator app when you sign
                          in.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleDisable2FA}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: theme.spacing.sm,
                        padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
                        backgroundColor: theme.colors.zinc[800],
                        color: theme.colors.white,
                        border: `1px solid ${theme.colors.zinc[700]}`,
                        borderRadius: theme.borderRadius.lg,
                        fontSize: theme.fontSize.base,
                        fontWeight: theme.fontWeight.medium,
                        cursor: "pointer",
                      }}
                    >
                      <X style={{ width: "1rem", height: "1rem" }} />
                      Disable Two-Factor Authentication
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CSS for animations */}
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

          /* Mobile Responsive Styles */
          @media (min-width: 768px) {
            .profile-title {
              font-size: ${theme.fontSize["3xl"]} !important;
            }
            .profile-layout {
              flex-direction: row !important;
            }
            .profile-sidebar {
              width: 250px !important;
              flex-shrink: 0 !important;
            }
            .sidebar-sticky {
              position: sticky !important;
              top: 2rem !important;
            }
            .tabs-container {
              flex-direction: column !important;
              overflow-x: visible !important;
            }
            .tab-button {
              width: 100% !important;
              padding: ${theme.spacing.lg} !important;
              margin-bottom: ${theme.spacing.sm} !important;
              font-size: ${theme.fontSize.base} !important;
            }
            .profile-picture-section {
              flex-direction: row !important;
              align-items: center !important;
            }
            .profile-picture-title,
            .profile-picture-desc {
              text-align: left !important;
            }
            .verify-actions {
              flex-direction: row !important;
            }
          }

          /* Hide scrollbar for tabs on mobile */
          .tabs-container::-webkit-scrollbar {
            display: none;
          }
          .tabs-container {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          /* Ensure buttons stack properly on mobile */
          @media (max-width: 767px) {
            .verify-actions button {
              width: 100%;
            }
            .tab-label {
              display: inline;
            }
          }
        `}
        </style>
      </div>
    </div>
  );
}
