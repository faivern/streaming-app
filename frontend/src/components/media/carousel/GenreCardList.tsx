import GenreCard from "../cards/GenreCard.tsx";
import "../../../style/TitleHover.css";

type Props = {
  genres: {
    id: number;
    name: string;
  }[];
};

const GenreCardList = ({ genres }: Props) => {
  if (!genres.length) return null;

  return (
    <section className="md:mx-8 px-4 sm:px-6 lg:px-8">
      <h2 className="inline-block my-4 text-gray-100">
        <span className="underline-hover">
          Suggested genres
          <span className="underline-bar"></span>
        </span>
      </h2>
      <div className="grid grid-cols-5 gap-4">
        {genres
          .sort(() => Math.random() - 0.5)
          .slice(0, 5)
          .map((genre) => (
            <GenreCard key={genre.id} id={genre.id} name={genre.name} />
          ))}
      </div>
    </section>
  );
};

export default GenreCardList;
