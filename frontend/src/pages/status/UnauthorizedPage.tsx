import StatusPage, { getStatusConfig } from "../../components/feedback/StatusPage";

const config = getStatusConfig(401)!;

export default function UnauthorizedPage() {
  return <StatusPage {...config} />;
}
