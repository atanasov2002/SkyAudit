import type { Route } from "../+types/dashboard";
import { requireAuth } from "@/features/auth/routeProtection";
import DashboardProfilePage from "@/pages/DashboardProfilePage";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const user = await requireAuth(request);

  return {
    user,
  };
};

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  return (
    <div className="min-h-screen mx-[10vw]">
      <DashboardProfilePage />
    </div>
  );
}
