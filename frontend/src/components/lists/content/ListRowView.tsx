import type { DisplayItem } from "../../../types/lists.view";
import ListRowItem from "./ListRowItem";

type ListRowViewProps = {
  items: DisplayItem[];
  onEditItem?: (item: DisplayItem) => void;
  onRemoveItem?: (item: DisplayItem) => void;
  showStatus?: boolean;
};

export default function ListRowView({
  items,
  onEditItem,
  onRemoveItem,
  showStatus = true,
}: ListRowViewProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <ListRowItem
          key={`${item.source}-${item.id}`}
          item={item}
          onEdit={onEditItem ? () => onEditItem(item) : undefined}
          onRemove={onRemoveItem ? () => onRemoveItem(item) : undefined}
          showStatus={showStatus}
        />
      ))}
    </div>
  );
}
