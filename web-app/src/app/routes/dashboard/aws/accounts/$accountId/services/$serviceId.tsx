import ServiceDetailsPage from "@/pages/ServiceDetailsPage";
import type { Route } from "./+types/$serviceId";
import { requireAuth } from "@/features/auth/routeProtection";

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireAuth(request);
  return {};
};

export default function ServiceDetails() {
  return <ServiceDetailsPage />;
}
