import ListMediaCard from "./ListMediaCard";
import type { DisplayItem } from "../../../types/lists.view";

type ListGridViewProps = {
  items: DisplayItem[];
  isEditMode?: boolean; // When true, show delete buttons on cards
  onRemoveItem?: (item: DisplayItem) => void;
  onEditItem?: (item: DisplayItem) => void; // For editing media entries (status/rating)
  showStatus?: boolean; // Show status badge on hover (custom lists only)
};

export default function ListGridView({
  items,
  isEditMode = false,
  onRemoveItem,
  onEditItem,
  showStatus = false,
}: ListGridViewProps) {
  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {items.map((item) => (
        <ListMediaCard
          key={`${item.source}-${item.id}`}
          item={item}
          isEditMode={isEditMode}
          onRemove={onRemoveItem ? () => onRemoveItem(item) : undefined}
          onEdit={onEditItem ? () => onEditItem(item) : undefined}
          showStatus={showStatus}
        />
      ))}
    </div>
  );
}
