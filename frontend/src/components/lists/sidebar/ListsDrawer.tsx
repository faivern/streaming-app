import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FaTimes } from "react-icons/fa";
import type { List } from "../../../types/list";
import type { WatchStatus } from "../../../types/mediaEntry";
import type { ActiveView } from "../../../types/lists.view";
import ListsSidebar from "./ListsSidebar";

type ListsDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  lists: List[];
  activeView: ActiveView;
  selectedStatus: WatchStatus;
  selectedListId: number | null;
  statusCounts: {
    WantToWatch: number;
    Watching: number;
    Watched: number;
  };
  onStatusChange: (status: WatchStatus) => void; // Also switches to status view
  onListSelect: (listId: number) => void; // Also switches to list view
  onCreateList: () => void;
  onEditList: (list: List) => void;
  onDeleteList: (list: List) => void;
  isLoading?: boolean;
};

export default function ListsDrawer({
  isOpen,
  onClose,
  lists,
  activeView,
  selectedStatus,
  selectedListId,
  statusCounts,
  onStatusChange,
  onListSelect,
  onCreateList,
  onEditList,
  onDeleteList,
  isLoading,
}: ListsDrawerProps) {

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-(--z-drawer)" onClose={onClose}>
        {/* Backdrop */}
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

        {/* Drawer */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-xs">
                  <div className="flex h-full flex-col bg-[var(--background)] shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border)]">
                      <Dialog.Title className="text-lg font-semibold text-[var(--text-h1)]">
                        My Lists
                      </Dialog.Title>
                      <button
                        type="button"
                        className="p-2 min-w-11 min-h-11 flex items-center justify-center text-[var(--subtle)] hover:text-[var(--text-h1)] rounded-lg hover:bg-[var(--action-hover)] transition-colors"
                        onClick={onClose}
                      >
                        <span className="sr-only">Close panel</span>
                        <FaTimes className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto overscroll-contain">
                      <ListsSidebar
                        lists={lists}
                        activeView={activeView}
                        selectedStatus={selectedStatus}
                        selectedListId={selectedListId}
                        statusCounts={statusCounts}
                        onStatusChange={(status) => {
                          onStatusChange(status);
                          onClose();
                        }}
                        onListSelect={(id) => {
                          onListSelect(id);
                          onClose();
                        }}
                        onCreateList={() => {
                          onClose();
                          onCreateList();
                        }}
                        onEditList={(list) => {
                          onClose();
                          onEditList(list);
                        }}
                        onDeleteList={(list) => {
                          onClose();
                          onDeleteList(list);
                        }}
                        isLoading={isLoading}
                      />
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
