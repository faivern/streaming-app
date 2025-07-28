import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from "react-router-dom";
import axios from 'axios'
import CreditsDetailHeader from '../../components/media/detail/CreditsDetailHeader';
import CreditsDetailGrid from '../../components/media/grid/CreditsDetailGrid';
import BackLink from '../../components/media/breadcrumbs/BackLink';

const CreditsDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const fromMediaType = searchParams.get('from');
  const mediaId = searchParams.get('mediaId');
  
  const [loading, setLoading] = useState(true);
  const [person, setPerson] = useState<any>(null);
  const [error, setError] = useState(false);
  const [combinedCredits, setCombinedCredits] = useState<any>([]);
  const [mediaDetails, setMediaDetails] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const personEndpoint = `/api/Movies/person/${id}`;
        const combinedCreditsEndpoint = `/api/Movies/person/${id}/combined_credits`;

        // Fetch media details if we have the context
        const requests = [
          axios.get(`${import.meta.env.VITE_BACKEND_API_URL}${personEndpoint}`),
          axios.get(`${import.meta.env.VITE_BACKEND_API_URL}${combinedCreditsEndpoint}`)
        ];

        if (fromMediaType && mediaId) {
          const mediaEndpoint = fromMediaType === "movie"
            ? `/api/Movies/movie/${mediaId}`
            : `/api/Movies/tv/${mediaId}`;
          requests.push(axios.get(`${import.meta.env.VITE_BACKEND_API_URL}${mediaEndpoint}`));
        }

        const responses = await Promise.all(requests);
        const [personRes, combinedCreditsRes, mediaRes] = responses;

        setPerson(personRes.data);
        if (mediaRes) {
          setMediaDetails(mediaRes.data);
        }

        const credits = (combinedCreditsRes.data.cast || []).slice(0, 10);

        const enrichedCredits = await Promise.all(
          credits.map(async (credit: any) => {
            const detailsEndpoint = credit.media_type === "movie"
              ? `/api/Movies/movie/${credit.id}`
              : `/api/Movies/tv/${credit.id}`;

            try {
              const detailRes = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}${detailsEndpoint}`);
              const detail = detailRes.data;

              return {
                ...credit,
                runtime: detail.runtime,
                number_of_seasons: detail.number_of_seasons,
                number_of_episodes: detail.number_of_episodes,
                title: detail.title || detail.name,
                id: detail.id,
                media_type: credit.media_type,
              };
            } catch (error) {
              console.warn(`Failed to enrich credit id ${credit.id}:`, error);
              return credit;
            }
          })
        );

        setCombinedCredits({ cast: enrichedCredits });
        setLoading(false);

      } catch (err) {
        console.error("Error fetching person details:", err);
        setError(true);
      }
    };

    fetchData();
  }, [id, fromMediaType, mediaId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error fetching person details.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <BackLink
        media_type={fromMediaType || undefined}
        id={mediaId || undefined}
        title={mediaDetails?.title || mediaDetails?.name || 'Media'}
      />

      <CreditsDetailHeader
        id={person.id}
        name={person.name}
        biography={person.biography}
        known_for_department={person.known_for_department}
        place_of_birth={person.place_of_birth}
        profile_path={person.profile_path}
        birthday={person.birthday}
        gender={person.gender}
        deathday={person.deathday}
      />
      <div className="mt-4">
      <CreditsDetailGrid
        credits={combinedCredits.cast || []}
        />
        </div>
    </div>
  )
}

export default CreditsDetailPage