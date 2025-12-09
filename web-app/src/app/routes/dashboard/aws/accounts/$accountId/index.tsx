import AccountDetailsPage from "@/pages/AccountDetailsPage";
import type { Route } from "./+types/$accountId";
import { requireAuth } from "@/features/auth/routeProtection";

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireAuth(request);
  return {};
};

export default function AccountDetails() {
  return <AccountDetailsPage />;
}
