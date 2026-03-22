import { useState, Fragment } from "react";
import { NavLink } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faMasksTheater,
  faListUl,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useGenres } from "../../hooks/genres/useGenres";
import GenreList from "../filters/GenreList";

export default function BottomNav() {
  const { data: genres = [] } = useGenres();
  const [isGenresOpen, setIsGenresOpen] = useState(false);

  const tabClass = (isActive = false) =>
    `flex flex-col items-center gap-1 px-2 py-2 text-xs font-medium transition-colors ${
      isActive ? "text-accent-primary" : "text-gray-400 hover:text-white"
    }`;

  return (
    <>
      {/* ── Bottom tab bar ── */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-(--z-sticky) bg-primary/95 backdrop-blur-lg border-t border-outline pb-safe"
      >
        <div className="flex items-center justify-around h-16">
          {/* Home */}
          <NavLink
            to="/"
            end
            className={({ isActive }) => tabClass(isActive)}
          >
            <FontAwesomeIcon icon={faHouse} className="text-lg" />
            <span>Home</span>
          </NavLink>

          {/* Genres */}
          <button
            onClick={() => setIsGenresOpen(true)}
            className={tabClass(isGenresOpen)}
          >
            <FontAwesomeIcon icon={faMasksTheater} className="text-lg" />
            <span>Genres</span>
          </button>

          {/* My Lists */}
          <NavLink
            to="/lists"
            className={({ isActive }) => tabClass(isActive)}
          >
            <FontAwesomeIcon icon={faListUl} className="text-lg" />
            <span>My Lists</span>
          </NavLink>
        </div>
      </nav>

      {/* ── Genres bottom sheet ── */}
      <Transition.Root show={isGenresOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-(--z-dialog)"
          onClose={() => setIsGenresOpen(false)}
        >
          {/* Backdrop */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              aria-hidden="true"
            />
          </Transition.Child>

          {/* Sheet panel */}
          <div className="fixed inset-0 flex items-end">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-out duration-[250ms]"
              enterFrom="translate-y-full"
              enterTo="translate-y-0"
              leave="transform transition ease-in duration-200"
              leaveFrom="translate-y-0"
              leaveTo="translate-y-full"
            >
              <Dialog.Panel className="w-full max-h-[70vh] bg-component-primary/95 backdrop-blur-lg border-t border-outline rounded-t-2xl shadow-2xl flex flex-col pb-safe-or-4">
                {/* Drag handle + header */}
                <div className="flex flex-col items-center pt-3 pb-2 border-b border-border/25">
                  <div className="w-10 h-1 rounded-full bg-gray-500 mb-3" />
                  <div className="flex items-center justify-between w-full px-5">
                    <Dialog.Title className="text-lg font-semibold text-text-h1">
                      Genres
                    </Dialog.Title>
                    <button
                      onClick={() => setIsGenresOpen(false)}
                      className="p-2 text-subtle hover:text-text-h1 transition"
                      aria-label="Close genres"
                    >
                      <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Genre grid */}
                <div
                  className="flex-1 overflow-y-auto px-5 py-4 overscroll-contain"
                  onClick={() => setIsGenresOpen(false)}
                >
                  <GenreList genres={genres} />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
