// src/features/auth/authService.ts
import api from "../../lib/api";
import { setAccessToken, clearAccessToken } from "../../utils/storage";

export type User = {
  id: string;
  email: string;
  roles?: string[];
  name?: string;
};

export async function login(email: string, password: string) {
  const res = await api.post(
    "/auth/login",
    { email, password },
    { withCredentials: true }
  );
  const { accessToken, user } = res.data;
  setAccessToken(accessToken);
  return user as User;
}

export async function register(payload: {
  email: string;
  password: string;
  name?: string;
}) {
  const res = await api.post("/auth/register", payload);
  return res.data;
}

export async function logout() {
  await api.post("/auth/logout", {}, { withCredentials: true });
  clearAccessToken();
}

export async function fetchMe(): Promise<User | null> {
  try {
    const r = await api.get("/auth/profile", { withCredentials: true });
    return r.data.user as User;
  } catch {
    return null;
  }
}
