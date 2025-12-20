import type { Route } from "./+types/$serviceId";
import { requireAuth } from "@/features/auth/routeProtection";
import ServiceDetailsPageWrapper from "@/components/ServiceDetailsPageWrapper";

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireAuth(request);
  return {};
};

export default function ServiceDetails() {
  return <ServiceDetailsPageWrapper />;
}
