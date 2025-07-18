import { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";
import axios from "axios";
import MediaDetailHeader from '../../components/media/MediaDetailHeader';
import MediaDetailVideo from '../../components/media/MediaDetailVideo';
import useToWatch from '../../hooks/useToWatch';
import MediaCastCarousel from '../../components/media/MediaCastCarousel';

const MediaDetailPage = () => {
  const { media_type, id } = useParams<{ media_type: string; id: string }>();
  const [mediaDetails, setMediaDetails] = useState<any>(null);
  const [mediaKeywords, setMediaKeywords] = useState<string[]>([]);
  const [mediaCredits, setMediaCredits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Use the hook at the page level
  const { isPlaying, handleWatchNow } = useToWatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const detailsEndpoint =
          media_type === "movie"
            ? `/api/Movies/movie/${id}`
            : `/api/Movies/tv/${id}`;

        const keywordsEndoint =
          media_type === "movie"
            ? `/api/Movies/movie/${id}/keywords`
            : `/api/Movies/tv/${id}/keywords`;

        const creditsEndpoint =
          media_type === "movie"
            ? `/api/Movies/movie/${id}/credits`
            : `/api/Movies/tv/${id}/aggregate_credits`;

        const [detailRes, keywordsRes, creditRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_API_URL}${detailsEndpoint}`),
          axios.get(`${import.meta.env.VITE_BACKEND_API_URL}${keywordsEndoint}`),
          axios.get(`${import.meta.env.VITE_BACKEND_API_URL}${creditsEndpoint}`),
        ]);
        
        setMediaDetails(detailRes.data);
        
        const keywordsData = keywordsRes.data?.results || keywordsRes.data?.keywords || [];
        setMediaKeywords(keywordsData.map((kw: any) => kw.name));

        setMediaCredits(creditRes.data?.cast || []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [media_type, id]);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading media details.</div>;

  return (
    <main className="min-h-screen">
      <MediaDetailVideo 
        backdrop_path={mediaDetails?.backdrop_path}
        isPlaying={isPlaying}
      />

      <MediaDetailHeader
        title={mediaDetails?.title || mediaDetails?.name}
        overview={mediaDetails?.overview}
        poster_path={mediaDetails?.posterPath || mediaDetails?.poster_path || ''}
        backdrop_path={mediaDetails?.backdropPath || mediaDetails?.backdrop_path || ''}
        release_date={mediaDetails?.release_date || mediaDetails?.first_air_date || ''}
        runtime={mediaDetails?.runtime || mediaDetails?.episode_run_time?.[0] || 0}
        vote_average={mediaDetails?.vote_average || 0}
        genre_ids={mediaDetails?.genre_ids || mediaDetails?.genres?.map((g: any) => g.id) || []}
        country={mediaDetails?.production_countries?.[0]?.name || mediaDetails?.origin_country?.[0] || ''}
        original_language={mediaDetails?.original_language || ''}
        production_companies={mediaDetails?.production_companies || []}
        tagline={mediaDetails?.tagline || ''}
        vote_count={mediaDetails?.vote_count || 0}
        onWatchNow={handleWatchNow}
        number_of_episodes={mediaDetails?.number_of_episodes}
        media_type={media_type}
        number_of_seasons={mediaDetails?.number_of_seasons}
        keywords={mediaKeywords}
      />
      <MediaCastCarousel
        cast={mediaCredits}
      />

    </main>
  );
};

export default MediaDetailPage;
