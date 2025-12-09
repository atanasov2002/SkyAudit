import client from "./api";

export const register = (data) => client.post("/auth/register", data);
export const login = (payload: any) => client.post("/auth/login", payload);
export const logout = () => client.post("/auth/logout");
export const refresh = () => client.post("/auth/refresh");
export const profile = () => client.get("/auth/profile");
