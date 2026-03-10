import type { DisplayItem } from "../../../types/lists.view";
import MobileListRowItem from "./MobileListRowItem";
import SwipeableRow from "./SwipeableRow";

type MobileListRowViewProps = {
  items: DisplayItem[];
  onContextMenu?: (item: DisplayItem) => void;
  onSwipeRight?: (item: DisplayItem) => void;
  onSwipeLeft?: (item: DisplayItem) => void;
};

export default function MobileListRowView({
  items,
  onContextMenu,
  onSwipeRight,
  onSwipeLeft,
}: MobileListRowViewProps) {
  return (
    <div className="space-y-1">
      {items.map((item) =>
        onSwipeRight || onSwipeLeft ? (
          <SwipeableRow
            key={`${item.source}-${item.id}`}
            onSwipeRight={onSwipeRight ? () => onSwipeRight(item) : undefined}
            onSwipeLeft={onSwipeLeft ? () => onSwipeLeft(item) : undefined}
          >
            <MobileListRowItem item={item} onContextMenu={onContextMenu} />
          </SwipeableRow>
        ) : (
          <MobileListRowItem
            key={`${item.source}-${item.id}`}
            item={item}
            onContextMenu={onContextMenu}
          />
        ),
      )}
    </div>
  );
}
