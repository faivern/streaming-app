import StatusPage, { getStatusConfig } from "../../components/feedback/StatusPage";

const config = getStatusConfig(403)!;

export default function ForbiddenPage() {
  return <StatusPage {...config} />;
}
