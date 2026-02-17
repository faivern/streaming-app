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
      <div className="w-12 h-12 rounded-full overflow-hidden bg-component-secondary flex items-center justify-center flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={person.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-6 h-6 text-subtle" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-text-h1 truncate">{person.name}</div>
        <div className="text-sm text-subtle">{person.count} titles</div>
      </div>
    </div>
  );
}

export default function TopPeopleCard({ actors, directors }: TopPeopleCardProps) {
  const hasData = actors.length > 0 || directors.length > 0;

  if (!hasData) {
    return (
      <BaseInsightCard title="Top Actors & Directors" span="md:col-span-2 md:row-span-2">
        <div className="flex items-center justify-center h-full text-subtle">
          No people data available
        </div>
      </BaseInsightCard>
    );
  }

  return (
    <BaseInsightCard title="Top Actors & Directors" span="md:col-span-2 md:row-span-2">
      <div className="space-y-6">
        {actors.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-accent-primary uppercase tracking-wider mb-3">
              Actors
            </h4>
            <div className="space-y-1">
              {actors.map((actor) => (
                <PersonItem key={actor.id} person={actor} />
              ))}
            </div>
          </div>
        )}

        {directors.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-accent-primary uppercase tracking-wider mb-3">
              Directors
            </h4>
            <div className="space-y-1">
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
