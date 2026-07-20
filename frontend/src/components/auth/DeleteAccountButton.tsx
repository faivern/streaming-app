import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { AlertTriangle } from "lucide-react";
import { useDeleteAccount } from "../../hooks/user/useDeleteAccount";

interface DeleteAccountButtonProps {
  className?: string;
  children: React.ReactNode;
  onDeleted?: () => void;
}

export default function DeleteAccountButton({
  className,
  children,
  onDeleted,
}: DeleteAccountButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: deleteAccount, isPending } = useDeleteAccount();

  const handleConfirm = () => {
    deleteAccount(undefined, {
      onSuccess: () => {
        setIsOpen(false);
        onDeleted?.();
      },
    });
  };

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className={className}>
        {children}
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-(--z-modal)"
          onClose={() => !isPending && setIsOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-end sm:items-center justify-center sm:p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="w-full max-w-sm rounded-t-2xl sm:rounded-2xl bg-component-primary border border-outline shadow-xl p-5 pb-safe-or-4 sm:pb-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-red-400">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-text-h1">
                        Delete your account?
                      </Dialog.Title>
                      <Dialog.Description className="mt-2 text-sm text-subtle leading-relaxed">
                        This permanently removes your profile, saved lists,
                        ratings, reviews and search history. This action cannot
                        be undone.
                      </Dialog.Description>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      disabled={isPending}
                      className="px-4 py-2 min-h-[44px] rounded-full font-semibold text-text-h1 border border-outline hover:bg-[var(--action-hover)] transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirm}
                      disabled={isPending}
                      className="px-4 py-2 min-h-[44px] rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {isPending ? "Deleting…" : "Delete account"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
