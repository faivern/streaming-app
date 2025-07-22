import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import MediaCastCard from '../../components/media/cards/MediaCastCard';

type CastMember = {
  id: number;
  name: string;
  character?: string;
  profile_path?: string;
  order?: number;
};

type CrewMember = {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path?: string;
};

const CreditsPage = () => {
  const { media_type, id } = useParams<{ media_type: string; id: string }>();
  const [cast, setCast] = useState<CastMember[]>([]);
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [mediaTitle, setMediaTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<'cast' | 'crew'>('cast');

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        setLoading(true);

        const creditsEndpoint = media_type === "movie"
          ? `/api/Movies/movie/${id}/credits`
          : `/api/Movies/tv/${id}/aggregate_credits`;

        const detailsEndpoint = media_type === "movie"
          ? `/api/Movies/movie/${id}`
          : `/api/Movies/tv/${id}`;

        const [creditsRes, detailsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_API_URL}${creditsEndpoint}`),
          axios.get(`${import.meta.env.VITE_BACKEND_API_URL}${detailsEndpoint}`)
        ]);

        setCast(creditsRes.data?.cast || []);
        setCrew(creditsRes.data?.crew || []);
        setMediaTitle(detailsRes.data?.title || detailsRes.data?.name || 'Unknown Title');
      } catch (err) {
        console.error("Failed to fetch credits:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (media_type && id) {
      fetchCredits();
    }
  }, [media_type, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading credits...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400 text-xl">Error loading credits.</div>
      </div>
    );
  }

  const organizedCrew = crew.reduce((acc, member) => {
    if (!acc[member.department]) {
      acc[member.department] = [];
    }
    acc[member.department].push(member);
    return acc;
  }, {} as Record<string, CrewMember[]>);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to={`/media/${media_type}/${id}`}
            className="text-blue-400 hover:text-blue-300 mb-4 inline-block"
          >
            ← Back to {mediaTitle}
          </Link>
          <h1 className="text-4xl font-bold mb-2">{mediaTitle}</h1>
          <p className="text-gray-400 text-lg">Full Cast & Crew</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-8">
          <button
            onClick={() => setActiveTab('cast')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'cast'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Cast ({cast.length})
          </button>
          <button
            onClick={() => setActiveTab('crew')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'crew'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Crew ({crew.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'cast' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {cast
              .sort((a, b) => (a.order || 999) - (b.order || 999))
              .map((person) => (
                <MediaCastCard
                  key={person.id}
                  name={person.name}
                  profile_path={person.profile_path}
                  character={person.character}
                />
              ))
            }
          </div>
        )}

        {activeTab === 'crew' && (
          <div className="space-y-8">
            {Object.entries(organizedCrew)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([department, members]) => (
                <div key={department}>
                  <h2 className="text-2xl font-bold mb-4 text-blue-400">
                    {department}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {members.map((person) => (
                      <MediaCastCard
                        key={`${person.id}-${person.job}`}
                        name={person.name}
                        profile_path={person.profile_path}
                        character={person.job}
                      />
                    ))}
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* Empty states */}
        {activeTab === 'cast' && cast.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No cast information available.</p>
          </div>
        )}

        {activeTab === 'crew' && crew.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No crew information available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditsPage;