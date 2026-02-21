import { Fragment, type ReactNode } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FaTimes } from "react-icons/fa";

type MobileFilterDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  children,
}: MobileFilterDrawerProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60" />
        </Transition.Child>

        <div className="fixed inset-0">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-out duration-300"
            enterFrom="translate-y-full"
            enterTo="translate-y-0"
            leave="transform transition ease-in duration-200"
            leaveFrom="translate-y-0"
            leaveTo="translate-y-full"
          >
            <Dialog.Panel className="fixed inset-x-0 bottom-0 max-h-[85dvh] bg-gray-900 border-t border-gray-700 rounded-t-2xl flex flex-col pb-safe">
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1 bg-gray-600 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-700">
                <Dialog.Title className="text-lg font-semibold text-white">
                  Filters
                </Dialog.Title>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 min-w-11 min-h-11 flex items-center justify-center text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Filter Content */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-4">{children}</div>

              {/* Apply Button */}
              <div className="p-4 border-t border-gray-700">
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-accent-primary hover:bg-accent-primary/80 text-white font-medium rounded-lg transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
