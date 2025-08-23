  import CollectionGrid from "./CollectionGrid";
  import TitleMid from "../title/titleMid";
  type Props = {
    parts: Array<any>;
  };

  const CollectionPartsSection = ({ parts }: Props) => (
    <div className="max-w-7xl mx-auto px-4 py-8 mt-6">
      <div className="flex justify-between">
        <TitleMid>Movies in this collection</TitleMid>
        <div className="border-1 border-red-500">DropDown</div>
      </div>

      <CollectionGrid parts={parts || []} />
    </div>
  );

  export default CollectionPartsSection;
