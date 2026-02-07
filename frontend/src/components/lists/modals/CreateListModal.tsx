import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition, Switch } from "@headlessui/react";
import { FaTimes } from "react-icons/fa";

type CreateListModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; description: string; isPublic: boolean }) => void;
  isLoading?: boolean;
};

export default function CreateListModal({
  isOpen,
  onClose,
  onCreate,
  isLoading,
}: CreateListModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  // Reset form when modal closes (covers programmatic close, not just user-initiated)
  useEffect(() => {
    if (!isOpen) {
      setName("");
      setDescription("");
      setIsPublic(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ name: name.trim(), description: description.trim(), isPublic });
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setIsPublic(false);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-t-2xl sm:rounded-2xl bg-gray-900 border border-gray-700 p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-lg font-semibold text-white">
                    Create New List
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="p-2 min-w-11 min-h-11 flex items-center justify-center text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="list-name"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="list-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="My Favorite Movies"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
                      required
                      autoFocus
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="list-description"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Description
                    </label>
                    <textarea
                      id="list-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="A collection of my all-time favorite films..."
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 resize-none"
                    />
                  </div>

                  {/* Public toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-300">
                        Make list public
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Others can view this list
                      </p>
                    </div>
                    <Switch
                      checked={isPublic}
                      onChange={setIsPublic}
                      className={`${
                        isPublic ? "bg-accent-primary" : "bg-gray-700"
                      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary/50`}
                    >
                      <span
                        className={`${
                          isPublic ? "translate-x-6" : "translate-x-1"
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </Switch>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!name.trim() || isLoading}
                      className="px-4 py-2 bg-accent-primary hover:bg-accent-primary/80 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      {isLoading ? "Creating..." : "Create List"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
