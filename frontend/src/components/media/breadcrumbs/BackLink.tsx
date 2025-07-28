import React from "react";
import { Link } from "react-router-dom";

type Props = {
  media_type?: string;
  id?: string;
  title?: string;
};

const BackLink = ({ media_type, id, title }: Props) => {
  // If we have media context, show full breadcrumb
  if (media_type && id && title) {
    return (
      <div className="text-sm text-gray-400 space-x-2 mb-6">
        <Link to="/" className="hover:text-blue-300">Home</Link>
        <span>/</span>
        <Link to={`/media/${media_type}/${id}`} className="hover:text-blue-300">
          ← Back to {title}
        </Link>
      </div>
    );
  }

  // Fallback to home if no media context
  return (
    <div className="text-sm text-gray-400 space-x-2 mb-6">
      <Link to="/" className="hover:text-blue-300">← Back to Home</Link>
    </div>
  );
};

export default BackLink;
