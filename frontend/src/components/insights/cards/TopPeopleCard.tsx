import { User } from "lucide-react";
import BaseInsightCard from "./BaseInsightCard";
import type { TopPerson } from "../../../types/insights";

type TopPeopleCardProps = {
  actors: TopPerson[];
  directors: TopPerson[];
};

function PersonItem({ person }: { person: TopPerson }) {
  const imageUrl = person.profilePath
    ? `https://image.tmdb.org/t/p/w185${person.profilePath}`
    : null;

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-10 h-10 rounded-full overflow-hidden bg-component-secondary flex items-center justify-center flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={person.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-5 h-5 text-subtle" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-text-h1 truncate">{person.name}</div>
        <div className="text-xs text-subtle">{person.count} titles together</div>
      </div>
    </div>
  );
}

export default function TopPeopleCard({ actors, directors }: TopPeopleCardProps) {
  const hasData = actors.length > 0 || directors.length > 0;

  if (!hasData) {
    return (
      <BaseInsightCard title="Your Regulars">
        <div className="flex items-center justify-center h-full text-subtle">
          No people data available
        </div>
      </BaseInsightCard>
    );
  }

  return (
    <BaseInsightCard title="Your Regulars">
      <p className="text-sm text-subtle mb-4">Faces you keep coming back to</p>
      <div className="space-y-5">
        {actors.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-accent-primary uppercase tracking-wider mb-2">
              Actors
            </h4>
            <div className="space-y-0.5">
              {actors.map((actor) => (
                <PersonItem key={actor.id} person={actor} />
              ))}
            </div>
          </div>
        )}

        {directors.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-accent-primary uppercase tracking-wider mb-2">
              Directors
            </h4>
            <div className="space-y-0.5">
              {directors.map((director) => (
                <PersonItem key={director.id} person={director} />
              ))}
            </div>
          </div>
        )}
      </div>
    </BaseInsightCard>
  );
}
