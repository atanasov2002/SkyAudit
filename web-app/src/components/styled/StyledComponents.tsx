import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { components, theme } from "@/styles/theme";
import styledImport from "styled-components";
const styled = (styledImport as any).default || styledImport;

// Page Container
interface PageContainerProps {
  children: React.ReactNode;
  style?: CSSProperties;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  style,
}) => <div style={{ ...components.page.base, ...style }}>{children}</div>;

// Card
interface CardProps {
  children: React.ReactNode;
  style?: CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, style }) => (
  <div style={{ ...components.card.base, ...style }}>{children}</div>
);

// Logo
interface LogoProps {
  icon: React.ReactNode;
  title: string;
  style?: CSSProperties;
}

export const Logo: React.FC<LogoProps> = ({ icon, title, style }) => (
  <div style={{ ...components.logo.container, ...style }}>
    <div style={components.logo.icon}>{icon}</div>
    <h1 style={components.logo.title}>{title}</h1>
  </div>
);

// Form Container
interface FormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  style?: CSSProperties;
}

export const Form: React.FC<FormProps> = ({ children, onSubmit, style }) => (
  <form onSubmit={onSubmit} style={{ ...components.form.container, ...style }}>
    {children}
  </form>
);

// Field Group
interface FieldGroupProps {
  children: React.ReactNode;
  style?: CSSProperties;
}

export const FieldGroup: React.FC<FieldGroupProps> = ({ children, style }) => (
  <div style={{ ...components.form.fieldGroup, ...style }}>{children}</div>
);

// Label
interface LabelProps {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
  style?: CSSProperties;
}

export const Label: React.FC<LabelProps> = ({
  children,
  required,
  htmlFor,
  style,
}) => (
  <label htmlFor={htmlFor} style={{ ...components.form.label, ...style }}>
    {children}{" "}
    {required && <span style={{ color: theme.colors.error.default }}>*</span>}
  </label>
);

// Input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: boolean;
  containerStyle?: CSSProperties;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ icon, error, containerStyle, style, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    const inputStyle: CSSProperties = {
      ...components.form.input.base,
      ...(icon ? { paddingLeft: "2.5rem" } : { paddingLeft: theme.spacing.lg }),
      ...(isFocused && components.form.input.focus),
      ...(error && components.form.input.error),
      ...style,
    };

    return (
      <div style={{ ...components.form.inputWrapper, ...containerStyle }}>
        {icon && <div style={components.form.icon}>{icon}</div>}
        <input
          ref={ref}
          style={inputStyle}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";

// Select
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  containerStyle?: CSSProperties;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, containerStyle, style, children, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    const selectStyle: CSSProperties = {
      ...components.form.select.base,
      ...(isFocused && components.form.select.focus),
      ...(error && components.form.input.error),
      ...style,
    };

    return (
      <div style={{ ...components.form.inputWrapper, ...containerStyle }}>
        <select
          ref={ref}
          style={selectStyle}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        >
          {children}
        </select>
      </div>
    );
  }
);

Select.displayName = "Select";

// Checkbox
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  containerStyle?: CSSProperties;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  containerStyle,
  style,
  ...props
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: theme.spacing.md,
      ...containerStyle,
    }}
  >
    <input
      type="checkbox"
      style={{
        ...components.form.checkbox.base,
        marginTop: theme.spacing.xs,
        ...style,
      }}
      {...props}
    />
    {label && (
      <label
        htmlFor={props.id}
        style={{
          fontSize: theme.fontSize.sm,
          color: theme.colors.zinc[400],
          cursor: "pointer",
        }}
      >
        {label}
      </label>
    )}
  </div>
);

// Error Text
interface ErrorTextProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  style?: CSSProperties;
}

export const ErrorText: React.FC<ErrorTextProps> = ({
  children,
  icon,
  style,
}) => (
  <p style={{ ...components.form.errorText, ...style }}>
    {icon}
    {children}
  </p>
);

// Helper Text
interface HelperTextProps {
  children: React.ReactNode;
  style?: CSSProperties;
}

export const HelperText: React.FC<HelperTextProps> = ({ children, style }) => (
  <p style={{ ...components.form.helperText, ...style }}>{children}</p>
);

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", loading, icon, children, style, ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);

    const buttonStyle: CSSProperties = {
      ...components.button.base,
      ...(variant === "primary"
        ? components.button.primary
        : components.button.secondary),
      ...(isHovered && variant === "primary" && components.button.primaryHover),
      ...(isHovered &&
        variant === "secondary" &&
        components.button.secondaryHover),
      ...(props.disabled && components.button.disabled),
      ...style,
    };

    return (
      <button
        ref={ref}
        style={buttonStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {loading ? (
          <>
            <Spinner variant={variant === "primary" ? "dark" : "light"} />
            {children}
          </>
        ) : (
          <>
            {icon}
            {children}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

// Spinner
interface SpinnerProps {
  variant?: "light" | "dark";
  style?: CSSProperties;
}

export const Spinner: React.FC<SpinnerProps> = ({
  variant = "light",
  style,
}) => {
  const spinnerStyle: CSSProperties = {
    ...components.spinner.base,
    ...(variant === "light"
      ? components.spinner.light
      : components.spinner.dark),
    ...style,
  };

  return <div style={spinnerStyle} />;
};

// Modal
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  icon?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  icon,
}) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // Mark as client-mounted
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Give React time to render the DOM
      setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  if (!isMounted || !isOpen) return null;

  return (
    <div style={components.modal.overlay} onClick={onClose}>
      <div
        style={components.modal.content}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={components.modal.title}>
          {icon}
          {title}
        </h2>
        <p style={components.modal.message}>{message}</p>
        <Button ref={closeBtnRef} onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};

// Typography Components
interface HeadingProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3;
  style?: CSSProperties;
}

export const Heading: React.FC<HeadingProps> = ({
  children,
  level = 1,
  style,
}) => {
  const headingStyle =
    level === 1
      ? { ...components.typography.h1, color: undefined } // ignore color
      : level === 2
      ? { ...components.typography.h2, color: undefined }
      : { ...components.typography.h3, color: undefined };

  const combinedStyle = { ...headingStyle, ...style };

  return React.createElement(`h${level}`, { style: combinedStyle, children });
};

export const StyledHeading = styled.h1<{ level?: number }>`
  ${({ level }) =>
    level === 1
      ? "font-size: 2rem;"
      : level === 2
      ? "font-size: 1.5rem;"
      : "font-size: 1.2rem;"}

  color: var(--text-color); // dynamically changes with theme
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

interface TextProps {
  children: React.ReactNode;
  variant?: "body" | "small";
  style?: CSSProperties;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = "body",
  style,
}) => (
  <p
    style={{
      ...(variant === "body"
        ? components.typography.body
        : components.typography.small),
      ...style,
    }}
  >
    {children}
  </p>
);

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to?: string;
}

export const Link: React.FC<LinkProps> = ({
  children,
  to,
  href,
  style,
  ...props
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const linkStyle: CSSProperties = {
    ...components.typography.link,
    ...(isHovered && components.typography.linkHover),
    ...style,
  };

  return (
    <a
      href={to || href}
      style={linkStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </a>
  );
};

// Feature List (for register page branding section)
interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const FeatureItem: React.FC<FeatureItemProps> = ({
  icon,
  title,
  description,
}) => (
  <div style={components.featureList.item}>
    <div style={components.featureList.icon}>{icon}</div>
    <div>
      <h3 style={components.featureList.title}>{title}</h3>
      <p style={components.featureList.description}>{description}</p>
    </div>
  </div>
);

interface FeatureListProps {
  children: React.ReactNode;
  style?: CSSProperties;
}

export const FeatureList: React.FC<FeatureListProps> = ({
  children,
  style,
}) => (
  <div style={{ ...components.featureList.container, ...style }}>
    {children}
  </div>
);

// Password Strength Indicator
interface PasswordStrengthProps {
  password: string;
  style?: CSSProperties;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
  style,
}) => {
  const calculateStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z\d]/.test(pwd)) strength++;
    return strength;
  };

  const strength = calculateStrength(password);

  const getColor = () => {
    if (strength <= 1) return theme.colors.error.default;
    if (strength <= 3) return theme.colors.warning.default;
    return theme.colors.success.default;
  };

  const getText = () => {
    if (strength <= 1) return "Weak";
    if (strength <= 3) return "Medium";
    return "Strong";
  };

  if (!password) return null;

  return (
    <div style={{ ...components.passwordStrength.container, ...style }}>
      <div style={components.passwordStrength.header}>
        <span style={components.passwordStrength.label}>
          Password strength:
        </span>
        <span
          style={{
            ...components.passwordStrength.label,
            color: getColor(),
            fontWeight: theme.fontWeight.medium,
          }}
        >
          {getText()}
        </span>
      </div>
      <div style={components.passwordStrength.bar}>
        <div
          style={{
            ...components.passwordStrength.fill,
            width: `${(strength / 5) * 100}%`,
            backgroundColor: getColor(),
          }}
        />
      </div>
    </div>
  );
};

export const SnakeButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.black};
  border: 1px solid ${({ theme }) => theme.colors.zinc[900]};
  cursor: pointer;
  /* border-radius: ${({ theme }) => theme.borderRadius.lg}; */
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  overflow: hidden;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.zinc[200]};
  }

  /* Left + Right borders (vertical) */
  &::before,
  &::after {
    content: "";
    position: absolute;
    width: 2px;
    height: 0;
    background: ${({ theme }) => theme.colors.zinc[900]};
    top: 0;
    transition: height 0.4s ease;
  }

  &::before {
    left: 0;
  }

  &::after {
    right: 0;
    transition-delay: 0.1s;
  }

  /* Top + bottom borders (horizontal) */
  .top-border,
  .bottom-border {
    position: absolute;
    left: 0;
    width: 0;
    height: 2px;
    background: ${({ theme }) => theme.colors.zinc[900]};
    transition: width 0.4s ease;
  }

  .top-border {
    top: 0;
  }

  .bottom-border {
    bottom: 0;
    transition-delay: 0.2s;
  }

  &:hover::before,
  &:hover::after {
    height: 100%;
  }

  &:hover .top-border,
  &:hover .bottom-border {
    width: 100%;
  }
`;
