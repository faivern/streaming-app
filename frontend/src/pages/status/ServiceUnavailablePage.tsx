import StatusPage, { getStatusConfig } from "../../components/feedback/StatusPage";

const config = getStatusConfig(503)!;

export default function ServiceUnavailablePage() {
  return <StatusPage {...config} />;
}
