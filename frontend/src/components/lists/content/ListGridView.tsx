import ListGridCard from "./ListGridCard";
import type { DisplayItem } from "../../../types/lists.view";

type ListGridViewProps = {
  items: DisplayItem[];
  onEditItem?: (item: DisplayItem) => void;
  onRemoveItem?: (item: DisplayItem) => void;
  showStatus?: boolean; // Show status badge on hover (custom lists only)
  forceShowStatus?: boolean; // Mobile toggle - always show status
};

export default function ListGridView({
  items,
  onEditItem,
  onRemoveItem,
  showStatus = false,
  forceShowStatus = false,
}: ListGridViewProps) {
  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {items.map((item) => (
        <ListGridCard
          key={`${item.source}-${item.id}`}
          item={item}
          onEdit={onEditItem ? () => onEditItem(item) : undefined}
          onRemove={onRemoveItem ? () => onRemoveItem(item) : undefined}
          showStatus={showStatus}
          forceShowStatus={forceShowStatus}
        />
      ))}
    </div>
  );
}
