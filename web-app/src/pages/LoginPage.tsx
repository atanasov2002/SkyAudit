import { useState, FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router";
import { Cloud, Mail, Key, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  PageContainer,
  Card,
  Logo,
  Form,
  FieldGroup,
  Label,
  Input,
  Button,
  Modal,
  Heading,
  Text,
  Link,
} from "@/components/styled/StyledComponents";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    if (showErrorModal) return;

    setLoading(true);
    setErr(null);

    try {
      /**
       * login() already:
       * - calls backend
       * - receives tempToken OR redirect
       * - backend sets cookies automatically
       */
      const result = await login(email, password);

      if (result?.requiresTwoFactor) {
        navigate("/2fa", {
          state: {
            tempToken: result.tempToken,
            email,
          },
        });
        return;
      }

      // normal login
      if (result?.redirect) {
        navigate(result.redirect);
        return;
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Login failed. Try again.";
      setErr(message);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Login Error"
        message={err || ""}
        icon={<AlertCircle />}
      />

      <Card>
        <Logo
          icon={
            <Cloud
              style={{ width: "1.75rem", height: "1.75rem", color: "black" }}
            />
          }
          title="CloudAudit"
        />

        <Heading level={2}>Sign in to your account</Heading>
        <Text variant="small" style={{ marginBottom: "2rem" }}>
          Continue where you left off
        </Text>

        <Form onSubmit={submit}>
          <FieldGroup>
            <Label required>Work Email</Label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              placeholder="you@company.com"
              icon={<Mail />}
            />
          </FieldGroup>

          <FieldGroup>
            <Label required>Password</Label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              placeholder="••••••••"
              icon={<Key />}
            />
          </FieldGroup>

          <Button type="submit" disabled={loading} loading={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </Form>

        <Text
          variant="small"
          style={{ textAlign: "center", marginTop: "1.5rem" }}
        >
          Don't have an account? <Link to="/register">Create one</Link>
        </Text>
      </Card>
    </PageContainer>
  );
}
