import { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";
import axios from "axios";
import MediaDetailHeader from '../../components/media/detail/MediaDetailHeader';
import MediaDetailVideo from '../../components/media/detail/MediaDetailVideo';
import useToWatch from '../../hooks/useToWatch';
import MediaCastCarousel from '../../components/media/carousel/MediaCastCarousel';
import MediaGridSimilar from '../../components/media/grid/MediaGridSimilar';

const MediaDetailPage = () => {
  const { media_type, id } = useParams<{ media_type: string; id: string }>();
  const [mediaDetails, setMediaDetails] = useState<any>(null);
  const [mediaKeywords, setMediaKeywords] = useState<string[]>([]);
  const [mediaCredits, setMediaCredits] = useState<{cast: any[], crew: any[]}>({
    cast: [],
    crew: []
  });
  const [mediaSimilar, setMediaSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Use the hook at the page level
  const { isPlaying, handleWatchNow } = useToWatch();

  const logoPath =
  mediaDetails?.production_companies?.find((pc: any) => pc.logo_path)?.logo_path || '';


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

        const similarEndpoint =
          media_type === "movie"
            ? `/api/Movies/movie/${id}/similar`
            : `/api/Movies/tv/${id}/similar`;

        const [detailRes, keywordsRes, creditRes, similarRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_API_URL}${detailsEndpoint}`),
          axios.get(`${import.meta.env.VITE_BACKEND_API_URL}${keywordsEndoint}`),
          axios.get(`${import.meta.env.VITE_BACKEND_API_URL}${creditsEndpoint}`),
          axios.get(`${import.meta.env.VITE_BACKEND_API_URL}${similarEndpoint}`),
        ]);
        
        setMediaDetails(detailRes.data);
        
        const keywordsData = keywordsRes.data?.results || keywordsRes.data?.keywords || [];
        setMediaKeywords(keywordsData.map((kw: any) => kw.name));

        setMediaCredits({
          cast: creditRes.data?.cast || [],
          crew: creditRes.data?.crew || [],
        });

        const similarResults = similarRes.data?.results?.slice(0, 8) || [];

        const enrichedSimilar = await Promise.all(
          similarResults.map(async (item: any) => {
            const detailEndpoint = `/api/Movies/${media_type}/${item.id}`;

            try {
              const detailRes = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}${detailEndpoint}`);
              const detail = detailRes.data;

              return {
                ...item,
                media_type,
                runtime: detail.runtime || detail.episode_run_time?.[0] || 0,
                number_of_seasons: detail.number_of_seasons || 0,
                number_of_episodes: detail.number_of_episodes || 0,
                overview: detail.overview || '',
                vote_average: detail.vote_average || 0,
                vote_count: detail.vote_count || 0,
                genre_ids: detail.genre_ids || detail.genres?.map((g: any) => g.id) || [],
                original_language: detail.original_language || '',
                tagline: detail.tagline || '',
                backdrop_path: detail.backdrop_path || item.backdrop_path || '',
              };
            } catch (err) {
              console.error(`Failed to fetch detail for ${item.id}`, err);
              return { ...item, media_type };
            }
          })
        );

        setMediaSimilar(enrichedSimilar);

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
      
      <div className="px-4 mt-8 border-t border-gray-500/80">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: 3/4 width */}
          <div className="md:w-3/4 w-full">
            <MediaDetailHeader
              cast={mediaCredits.cast || []}
              crew={mediaCredits.crew || []}
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
              budget={mediaDetails?.budget}
              logo_path={logoPath}
            />
            
            {/* Full width below */}
            <div className="mt-8">
              <MediaCastCarousel cast={mediaCredits.cast || []} />
            </div>
          </div>

          {/* Right: 1/4 width */}
          <div className="md:w-1/4">
            <MediaGridSimilar similarMedia={mediaSimilar} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default MediaDetailPage;

