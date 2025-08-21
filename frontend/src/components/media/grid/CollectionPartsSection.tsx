import CollectionGrid from "./CollectionGrid";

type Props = {
  parts: Array<any>;
};

const CollectionPartsSection = ({ parts }: Props) => (
  <>
    <h2 className="mb-4 text-2xl font-semibold border-l-4 border-sky-500 pl-2">
        Movies in this collection
    </h2>
    <CollectionGrid parts={parts || []} />
  </>
);

export default CollectionPartsSection;
