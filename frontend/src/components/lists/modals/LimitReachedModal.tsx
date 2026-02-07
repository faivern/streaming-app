import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FaExclamationTriangle } from "react-icons/fa";

type LimitReachedModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  currentCount: number;
  maxCount: number;
};

export default function LimitReachedModal({
  isOpen,
  onClose,
  title,
  message,
  currentCount,
  maxCount,
}: LimitReachedModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
          <div className="flex min-h-full items-end sm:items-center justify-center sm:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-t-2xl sm:rounded-2xl bg-gray-900 border border-gray-700 p-6 shadow-xl transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <FaExclamationTriangle className="text-amber-400 text-xl" />
                  </div>
                  <div>
                    <Dialog.Title className="text-lg font-semibold text-white">
                      {title}
                    </Dialog.Title>
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium">
                      {currentCount} / {maxCount}
                    </span>
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-6">{message}</p>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Got it
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
