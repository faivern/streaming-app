import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const MediaDetailPage = () => {
  const { media_type, id } = useParams<{ media_type: string; id: string }>();
  const [mediaDetails, setMediaDetails] = useState<any>(null);

  useEffect(() => {
    const fetchMediaDetails = async () => {
      try {
        const endpoint = `/api/Movies/${media_type}/${id}`;
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}${endpoint}`);
        setMediaDetails(res.data);
      } catch (error) {
        console.error("Error fetching media details:", error);
      }
    };

    fetchMediaDetails();
  }, [media_type, id]);

  if (!mediaDetails) return <h1 className='flex justify-center text-9xl'>404</h1>;

  return (
    <div>
      <h1>{mediaDetails.title || mediaDetails.name || "Untitled"}</h1>
      <p>{mediaDetails.overview || "No overview available."}</p>
    </div>
  );
};

export default MediaDetailPage;
