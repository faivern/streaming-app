import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { AlertTriangle } from "lucide-react";
import { useDeleteAccount } from "../../hooks/user/useDeleteAccount";

interface DeleteAccountButtonProps {
  className?: string;
  children: React.ReactNode;
  onDeleted?: () => void;
}

const CONFIRM_PHRASE = "DELETE";

export default function DeleteAccountButton({
  className,
  children,
  onDeleted,
}: DeleteAccountButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const { mutate: deleteAccount, isPending } = useDeleteAccount();

  const canDelete = confirmText === CONFIRM_PHRASE;

  const close = () => {
    if (isPending) return;
    setIsOpen(false);
    setConfirmText("");
  };

  const handleConfirm = () => {
    if (!canDelete) return;
    deleteAccount(undefined, {
      onSuccess: () => {
        setIsOpen(false);
        setConfirmText("");
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
          onClose={close}
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

                  <label className="block mt-5 text-sm text-text-h1">
                    Type <span className="font-semibold">{CONFIRM_PHRASE}</span> to confirm
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      disabled={isPending}
                      autoComplete="off"
                      autoCapitalize="characters"
                      spellCheck={false}
                      placeholder={CONFIRM_PHRASE}
                      className="mt-2 w-full rounded-lg bg-input border border-outline px-3 py-2 text-text-h1 placeholder:text-subtle focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all disabled:opacity-50"
                    />
                  </label>

                  <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <button
                      type="button"
                      onClick={close}
                      disabled={isPending}
                      className="px-4 py-2 min-h-[44px] rounded-full font-semibold text-text-h1 border border-outline hover:bg-[var(--action-hover)] transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirm}
                      disabled={isPending || !canDelete}
                      className="px-4 py-2 min-h-[44px] rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
