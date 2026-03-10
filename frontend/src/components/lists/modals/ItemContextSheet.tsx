import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Clock,
  CheckCircle2,
  Pencil,
  ListPlus,
  Trash2,
  ExternalLink,
  Share2,
  X,
} from "lucide-react";
import Poster from "../../media/shared/Poster";
import type { DisplayItem } from "../../../types/lists.view";
import type { WatchStatus } from "../../../types/mediaEntry";
import toast from "react-hot-toast";

type ItemContextSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  item: DisplayItem | null;
  onMarkStatus?: (item: DisplayItem, status: WatchStatus) => void;
  onEditEntry?: (item: DisplayItem) => void;
  onAddToList?: (item: DisplayItem) => void;
  onRemove?: (item: DisplayItem) => void;
};

type ActionRow = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
};

export default function ItemContextSheet({
  isOpen,
  onClose,
  item,
  onMarkStatus,
  onEditEntry,
  onAddToList,
  onRemove,
}: ItemContextSheetProps) {
  const navigate = useNavigate();

  if (!item) return null;

  const mediaTypeLabel = item.mediaType === "movie" ? "Movie" : "TV Show";

  // Determine next logical status action
  const getStatusAction = (): ActionRow | null => {
    if (!onMarkStatus) return null;

    if (item.status === "Watched") {
      return {
        icon: <Clock className="w-5 h-5" />,
        label: "Move to Want to Watch",
        onClick: () => {
          onMarkStatus(item, "WantToWatch");
          onClose();
        },
      };
    }
    if (item.status === "Watching") {
      return {
        icon: <CheckCircle2 className="w-5 h-5" />,
        label: "Mark as Watched",
        onClick: () => {
          onMarkStatus(item, "Watched");
          onClose();
        },
      };
    }
    // WantToWatch or no status
    return {
      icon: <CheckCircle2 className="w-5 h-5" />,
      label: "Mark as Watched",
      onClick: () => {
        onMarkStatus(item, "Watched");
        onClose();
      },
    };
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/media/${item.mediaType}/${item.tmdbId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: item.title, url });
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    }
    onClose();
  };

  const statusAction = getStatusAction();

  const actions: ActionRow[] = [
    ...(statusAction ? [statusAction] : []),
    ...(onEditEntry
      ? [
          {
            icon: <Pencil className="w-5 h-5" />,
            label: "Edit Entry",
            onClick: () => {
              onEditEntry(item);
              onClose();
            },
          },
        ]
      : []),
    ...(onAddToList
      ? [
          {
            icon: <ListPlus className="w-5 h-5" />,
            label: "Add to Another List",
            onClick: () => {
              onAddToList(item);
              onClose();
            },
          },
        ]
      : []),
    {
      icon: <ExternalLink className="w-5 h-5" />,
      label: "View Details",
      onClick: () => {
        navigate(`/media/${item.mediaType}/${item.tmdbId}`);
        onClose();
      },
    },
    {
      icon: <Share2 className="w-5 h-5" />,
      label: "Share",
      onClick: handleShare,
    },
    ...(onRemove
      ? [
          {
            icon: <Trash2 className="w-5 h-5" />,
            label: "Remove",
            onClick: () => {
              onRemove(item);
              onClose();
            },
            destructive: true,
          },
        ]
      : []),
  ];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-(--z-modal)" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-full"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-full"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-t-2xl bg-component-primary border-t border-x border-outline shadow-xl transition-all">
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-[var(--subtle)]/30" />
                </div>

                {/* Header with media info */}
                <div className="flex items-center gap-3 px-4 pb-3 border-b border-[var(--border)]">
                  <Poster
                    path={item.posterPath || undefined}
                    alt={item.title}
                    className="w-10 h-[60px] rounded-md flex-shrink-0"
                    useCustomSize
                  />
                  <div className="flex-1 min-w-0">
                    <Dialog.Title className="text-sm font-semibold text-[var(--text-h1)] line-clamp-1">
                      {item.title}
                    </Dialog.Title>
                    <p className="text-xs text-[var(--subtle)]">
                      {mediaTypeLabel}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 min-w-11 min-h-11 flex items-center justify-center text-[var(--subtle)] hover:text-[var(--text-h1)] rounded-lg transition-colors flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Action rows */}
                <div className="py-2 pb-safe-bottom">
                  {actions.map((action, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={action.onClick}
                      className={`w-full flex items-center gap-4 px-5 py-3 min-h-[48px] transition-colors ${
                        action.destructive
                          ? "text-red-400 active:bg-red-500/10"
                          : "text-[var(--text-h1)] active:bg-[var(--action-primary)]"
                      }`}
                    >
                      {action.icon}
                      <span className="text-sm font-medium">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
