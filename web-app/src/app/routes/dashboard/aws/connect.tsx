import ConnectAwsPage from "@/pages/ConnectAwsPage";
import type { Route } from "./+types/connect";
import { requireAuth } from "@/features/auth/routeProtection";

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireAuth(request);
  return {};
};

export default function ConnectAws() {
  return <ConnectAwsPage />;
}
