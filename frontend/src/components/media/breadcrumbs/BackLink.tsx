import { Link, useNavigate } from "react-router-dom";
import { mediaUrl } from "../../../utils/urlBuilder";

type Props = {
  media_type?: string;
  id?: string | number;
  title?: string;
};

const BackLink = ({ media_type, id, title }: Props) => {
  const navigate = useNavigate();

  // If media context, show full breadcrumb
  const validMediaTypes = ["movie", "tv"];
  if (media_type && validMediaTypes.includes(media_type) && id && title) {
    const numId = typeof id === "string" ? parseInt(id, 10) : id;
    return (
      <div className="text-sm text-gray-400 space-x-2 mb-6">
        <Link to="/" className="hover:text-accent-primary">Home</Link>
        <span>/</span>
        <Link to={mediaUrl(media_type, numId, title)} className="hover:text-accent-primary">
          ← Back to {title}
        </Link>
      </div>
    );
  }

  // Use browser history to go back, fallback to home if no history
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="text-sm text-gray-400 space-x-2 mb-6">
      <button
        onClick={handleBack}
        className="hover:text-accent-primary cursor-pointer"
      >
        ← Back
      </button>
    </div>
  );
};

export default BackLink;
