import { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";
import axios from 'axios'
import CreditsDetailHeader from '../../components/media/detail/CreditsDetailHeader';
import CreditsDetailGrid from '../../components/media/grid/CreditsDetailGrid';

const CreditsDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [person, setPerson] = useState<any>(null);
  const [error, setError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const personEndpoint = `/api/Movies/person/${id}`;

                const [personRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_BACKEND_API_URL}${personEndpoint}`),
                ]);

                setPerson(personRes.data);
                setLoading(false);

            } catch (err) {
                console.error("Error fetching person details:", err);
                setError(true);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error fetching person details.</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 border-1 border-green-500">
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
           <CreditsDetailGrid
           
           />
        </div>
    )
}

export default CreditsDetailPage