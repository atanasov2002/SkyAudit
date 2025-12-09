import type { Route } from "./+types/login";
import RegisterPage from "../../pages/RegisterPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <RegisterPage />;
}
