import type { Route } from "./+types/verify";
import VerifyPage from "../../pages/VerifyPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Verify() {
  return <VerifyPage />;
}
