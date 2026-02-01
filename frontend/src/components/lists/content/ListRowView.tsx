import type { DisplayItem } from "../../../types/lists.view";
import ListRowItem from "./ListRowItem";

type ListRowViewProps = {
  items: DisplayItem[];
  isEditMode?: boolean;
  onEditItem?: (item: DisplayItem) => void;
  onRemoveItem?: (item: DisplayItem) => void;
  showStatus?: boolean;
};

export default function ListRowView({
  items,
  isEditMode = false,
  onRemoveItem,
  onEditItem,
  showStatus = true,
}: ListRowViewProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <ListRowItem
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
