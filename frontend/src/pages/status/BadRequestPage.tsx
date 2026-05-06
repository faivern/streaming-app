import StatusPage, { getStatusConfig } from "../../components/feedback/StatusPage";

const config = getStatusConfig(400)!;

export default function BadRequestPage() {
  return <StatusPage {...config} />;
}
