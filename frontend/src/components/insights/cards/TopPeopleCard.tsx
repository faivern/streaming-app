import { User, Crown } from "lucide-react";
import BaseInsightCard from "./BaseInsightCard";
import type { TopPerson } from "../../../types/insights";

type TopPeopleCardProps = {
  actors: TopPerson[];
  directors: TopPerson[];
};

const RANK_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];

function PersonItem({ person, rank }: { person: TopPerson; rank: number }) {
  const imageUrl = person.profilePath
    ? `https://image.tmdb.org/t/p/w185${person.profilePath}`
    : null;

  const rankColor = RANK_COLORS[rank];

  return (
    <div className="flex items-center gap-3 py-2 hover:scale-[1.02] transition-transform duration-200 cursor-default">
      {/* Avatar with rank badge */}
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-accent-primary/30 flex items-center justify-center bg-component-secondary">
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
        {/* Rank badge */}
        <div
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md"
          style={{ backgroundColor: rankColor, color: rank === 0 ? "#1a1a1a" : "#1a1a1a" }}
        >
          {rank === 0 ? (
            <Crown className="w-3 h-3" />
          ) : (
            rank + 1
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-text-h1 truncate">{person.name}</div>
        <div className="text-xs text-subtle flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full bg-accent-primary/60 flex-shrink-0"
          />
          {person.count} titles together
        </div>
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
              {actors.map((actor, index) => (
                <PersonItem key={actor.id} person={actor} rank={index} />
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
              {directors.map((director, index) => (
                <PersonItem key={director.id} person={director} rank={index} />
              ))}
            </div>
          </div>
        )}
      </div>
    </BaseInsightCard>
  );
}
