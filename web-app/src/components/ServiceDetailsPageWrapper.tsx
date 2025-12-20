import { useService } from "@/hooks/useAwsData";
import ServiceDetailsPage from "@/pages/ServiceDetailsPage";
import { useNavigate, useParams } from "react-router";

export default function ServiceDetailsPageWrapper() {
  const navigate = useNavigate();
  const { accountId, serviceId } = useParams();
  const { data, isLoading, isError, error } = useService(
    accountId!,
    serviceId!
  );

  return (
    <ServiceDetailsPage
      navigate={navigate}
      accountId={accountId}
      serviceId={serviceId}
      data={data}
      isLoading={isLoading}
      isError={isError}
      error={error}
    />
  );
}
