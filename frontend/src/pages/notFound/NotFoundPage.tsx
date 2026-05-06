import StatusPage, { getStatusConfig } from "../../components/feedback/StatusPage";

const config = getStatusConfig(404)!;

export default function NotFoundPage() {
  return <StatusPage {...config} />;
}
