// src/styles/theme.ts

export const theme = {
  colors: {
    // Base colors
    black: "#000000",
    white: "#FFFFFF",

    // Zinc scale
    zinc: {
      50: "#fafafa",
      100: "#f4f4f5",
      200: "#e4e4e7",
      300: "#d4d4d8",
      400: "#a1a1aa",
      500: "#71717a",
      600: "#52525b",
      700: "#3f3f46",
      800: "#27272a",
      900: "#18181b",
      950: "#09090b",
    },

    // Status colors
    error: {
      light: "#fca5a5",
      default: "#ef4444",
      dark: "#dc2626",
    },
    success: {
      light: "#86efac",
      default: "#22c55e",
      dark: "#16a34a",
    },
    warning: {
      light: "#fde047",
      default: "#eab308",
      dark: "#ca8a04",
    },
  },

  spacing: {
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    md: "0.75rem", // 12px
    lg: "1rem", // 16px
    xl: "1.5rem", // 24px
    "2xl": "2rem", // 32px
    "3xl": "3rem", // 48px
    "4xl": "4rem", // 64px
  },

  borderRadius: {
    sm: "0.375rem", // 6px
    md: "0.5rem", // 8px
    lg: "0.75rem", // 12px
    xl: "1rem", // 16px
  },

  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
  },

  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },

  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
  },

  transitions: {
    fast: "150ms",
    normal: "300ms",
    slow: "500ms",
  },
} as const;

// Component-specific styles
export const components = {
  // Page containers
  page: {
    base: {
      minHeight: "100vh",
      backgroundColor: theme.colors.black,
      color: theme.colors.white,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing["2xl"],
    },
  },

  // Card/Panel
  card: {
    base: {
      width: "100%",
      maxWidth: "28rem", // 448px
      backgroundColor: theme.colors.zinc[900],
      border: `1px solid ${theme.colors.zinc[800]}`,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing["3xl"],
      boxShadow: theme.shadows.xl,
    },
  },

  // Logo container
  logo: {
    container: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing.md,
      marginBottom: theme.spacing["3xl"],
    },
    icon: {
      width: "3rem",
      height: "3rem",
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.lg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: theme.fontSize["3xl"],
      fontWeight: theme.fontWeight.bold,
    },
  },

  // Form elements
  form: {
    container: {
      display: "flex",
      flexDirection: "column" as const,
      gap: theme.spacing["2xl"],
    },

    fieldGroup: {
      display: "flex",
      flexDirection: "column" as const,
      gap: theme.spacing.sm,
    },

    label: {
      display: "block",
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.medium,
      marginBottom: theme.spacing.sm,
    },

    inputWrapper: {
      position: "relative" as const,
    },

    icon: {
      position: "absolute" as const,
      left: theme.spacing.md,
      top: theme.spacing.md,
      width: "1.25rem",
      height: "1.25rem",
      color: theme.colors.zinc[500],
    },

    input: {
      base: {
        width: "100%",
        paddingLeft: "2.5rem",
        paddingRight: theme.spacing.lg,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.md,
        backgroundColor: theme.colors.zinc[900],
        border: `1px solid ${theme.colors.zinc[800]}`,
        borderRadius: theme.borderRadius.lg,
        color: theme.colors.white,
        fontSize: theme.fontSize.base,
        outline: "none",
        transition: `all ${theme.transitions.normal}`,
      },
      focus: {
        boxShadow: `0 0 0 2px ${theme.colors.white}`,
        borderColor: "transparent",
      },
      error: {
        borderColor: theme.colors.error.default,
      },
    },

    select: {
      base: {
        width: "100%",
        padding: theme.spacing.md,
        backgroundColor: theme.colors.zinc[900],
        border: `1px solid ${theme.colors.zinc[800]}`,
        borderRadius: theme.borderRadius.lg,
        color: theme.colors.white,
        fontSize: theme.fontSize.base,
        outline: "none",
        transition: `all ${theme.transitions.normal}`,
      },
      focus: {
        boxShadow: `0 0 0 2px ${theme.colors.white}`,
        borderColor: "transparent",
      },
    },

    checkbox: {
      base: {
        width: "1rem",
        height: "1rem",
        borderRadius: theme.borderRadius.sm,
        border: `1px solid ${theme.colors.zinc[700]}`,
        backgroundColor: theme.colors.zinc[900],
        cursor: "pointer",
      },
    },

    errorText: {
      color: theme.colors.error.default,
      fontSize: theme.fontSize.sm,
      marginTop: theme.spacing.xs,
      display: "flex",
      alignItems: "center",
      gap: theme.spacing.xs,
    },

    helperText: {
      color: theme.colors.zinc[400],
      fontSize: theme.fontSize.sm,
    },
  },

  // Buttons
  button: {
    base: {
      width: "100%",
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      fontWeight: theme.fontWeight.medium,
      fontSize: theme.fontSize.base,
      transition: `all ${theme.transitions.normal}`,
      cursor: "pointer",
      border: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.md,
    },

    primary: {
      backgroundColor: theme.colors.white,
      color: theme.colors.black,
    },

    primaryHover: {
      backgroundColor: theme.colors.zinc[200],
    },

    secondary: {
      backgroundColor: theme.colors.zinc[900],
      color: theme.colors.white,
      border: `1px solid ${theme.colors.zinc[800]}`,
    },

    secondaryHover: {
      borderColor: theme.colors.zinc[600],
    },

    disabled: {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  },

  // Modal
  modal: {
    overlay: {
      position: "fixed" as const,
      inset: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
    },

    content: {
      backgroundColor: theme.colors.zinc[900],
      padding: theme.spacing["2xl"],
      borderRadius: theme.borderRadius.lg,
      maxWidth: "24rem",
      width: "100%",
      color: theme.colors.white,
    },

    title: {
      fontSize: theme.fontSize.xl,
      fontWeight: theme.fontWeight.bold,
      marginBottom: theme.spacing.md,
      display: "flex",
      alignItems: "center",
      gap: theme.spacing.sm,
    },

    message: {
      marginBottom: theme.spacing["2xl"],
      color: theme.colors.zinc[300],
    },
  },

  // Loading spinner
  spinner: {
    base: {
      width: "1.25rem",
      height: "1.25rem",
      border: "2px solid",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },

    light: {
      borderColor: theme.colors.zinc[700],
      borderTopColor: theme.colors.white,
    },

    dark: {
      borderColor: theme.colors.zinc[700],
      borderTopColor: theme.colors.black,
    },
  },

  // Typography
  typography: {
    h1: {
      fontSize: theme.fontSize["4xl"],
      fontWeight: theme.fontWeight.bold,
      lineHeight: 1.2,
    },

    h2: {
      fontSize: theme.fontSize["3xl"],
      fontWeight: theme.fontWeight.bold,
      marginBottom: theme.spacing.sm,
    },

    h3: {
      fontSize: theme.fontSize["2xl"],
      fontWeight: theme.fontWeight.bold,
    },

    body: {
      fontSize: theme.fontSize.base,
      lineHeight: 1.5,
    },

    small: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.zinc[400],
    },

    link: {
      color: theme.colors.white,
      textDecoration: "none",
      transition: `all ${theme.transitions.fast}`,
    },

    linkHover: {
      textDecoration: "underline",
    },
  },

  // Feature list (for register page)
  featureList: {
    container: {
      display: "flex",
      flexDirection: "column" as const,
      gap: theme.spacing["2xl"],
    },

    item: {
      display: "flex",
      alignItems: "flex-start",
      gap: theme.spacing.lg,
    },

    icon: {
      width: "2.5rem",
      height: "2.5rem",
      backgroundColor: theme.colors.zinc[900],
      borderRadius: theme.borderRadius.lg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },

    title: {
      fontWeight: theme.fontWeight.semibold,
      marginBottom: theme.spacing.xs,
    },

    description: {
      color: theme.colors.zinc[500],
      fontSize: theme.fontSize.sm,
    },
  },

  // Password strength indicator
  passwordStrength: {
    container: {
      marginTop: theme.spacing.sm,
    },

    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.xs,
    },

    label: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.zinc[500],
    },

    bar: {
      width: "100%",
      height: "0.25rem",
      backgroundColor: theme.colors.zinc[800],
      borderRadius: theme.borderRadius.md,
      overflow: "hidden",
    },

    fill: {
      height: "100%",
      transition: `all ${theme.transitions.normal}`,
    },
  },
} as const;

export type Theme = typeof theme;
export type Components = typeof components;
