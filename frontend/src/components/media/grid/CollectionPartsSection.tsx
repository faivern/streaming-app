import CollectionGrid from "./CollectionGrid";

type Props = {
  parts: Array<any>;
};

const CollectionPartsSection = ({ parts }: Props) => (
  <div className="max-w-7xl mx-auto px-4 py-8 mt-6">
    <div className="flex justify-between">
      <h2 className="mb-4 text-2xl font-semibold border-l-4 border-sky-500 pl-2">
        Movies in this collection
      </h2>
      <div className="border-1 border-red-500">DropDown</div>
    </div>

    <CollectionGrid parts={parts || []} />
  </div>
);

export default CollectionPartsSection;
