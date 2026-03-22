import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Check, Copy } from "lucide-react";
import {
  FaXTwitter,
  FaFacebookF,
  FaRedditAlien,
  FaWhatsapp,
  FaTelegram,
  FaInstagram,
  FaDiscord,
} from "react-icons/fa6";
import { HiOutlineMail } from "react-icons/hi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShare } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

type ShareModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
};

const SOCIAL_PLATFORMS = [
  {
    name: "X",
    icon: FaXTwitter,
    bg: "bg-black",
    getUrl: (url: string, title: string) =>
      `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  {
    name: "Facebook",
    icon: FaFacebookF,
    bg: "bg-[#1877F2]",
    getUrl: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: "Reddit",
    icon: FaRedditAlien,
    bg: "bg-[#FF4500]",
    getUrl: (url: string, title: string) =>
      `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
  {
    name: "WhatsApp",
    icon: FaWhatsapp,
    bg: "bg-[#25D366]",
    getUrl: (url: string, title: string) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
  {
    name: "Telegram",
    icon: FaTelegram,
    bg: "bg-[#26A5E4]",
    getUrl: (url: string, title: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    name: "Instagram",
    icon: FaInstagram,
    bg: "bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]",
    getUrl: (url: string, title: string) =>
      `https://www.instagram.com/direct/new/?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
  {
    name: "Discord",
    icon: FaDiscord,
    bg: "bg-[#5865F2]",
    getUrl: (url: string, title: string) =>
      `https://discord.com/channels/@me?message=${encodeURIComponent(`${title} ${url}`)}`,
  },
  {
    name: "Email",
    icon: HiOutlineMail,
    bg: "bg-accent-primary",
    getUrl: (url: string, title: string) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check this out: ${url}`)}`,
  },
];

const gridContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const gridItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" as const } },
};

export default function ShareModal({
  isOpen,
  onClose,
  title,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;

  const handleShare = (getUrl: (url: string, title: string) => string) => {
    const shareUrl = getUrl(url, title);
    if (shareUrl.startsWith("mailto:")) {
      window.location.href = shareUrl;
    } else {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

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
          <div className="flex min-h-full items-end sm:items-center justify-center sm:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform rounded-t-2xl sm:rounded-2xl bg-component-primary border border-outline p-6 shadow-xl transition-all">
                {/* Mobile drag handle */}
                <div className="flex justify-center pt-2 pb-1 sm:hidden">
                  <div className="w-10 h-1 bg-[var(--border)] rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <Dialog.Title className="flex items-center gap-2 text-lg font-semibold text-[var(--text-h1)]">
                    <FontAwesomeIcon icon={faShare} className="text-base" />
                    Share
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-2 min-w-9 min-h-9 flex items-center justify-center text-subtle hover:text-[var(--text-h1)] rounded-lg hover:bg-action-hover transition-colors"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {/* Social grid */}
                <motion.div
                  className="grid grid-cols-4 gap-3"
                  variants={gridContainer}
                  initial="hidden"
                  animate={isOpen ? "show" : "hidden"}
                >
                  {SOCIAL_PLATFORMS.map((platform) => (
                    <motion.button
                      key={platform.name}
                      variants={gridItem}
                      onClick={() => handleShare(platform.getUrl)}
                      className="flex flex-col items-center gap-2 py-2 cursor-pointer group"
                    >
                      <div
                        className={`w-14 h-14 rounded-full ${platform.bg} flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:brightness-110`}
                      >
                        <platform.icon className="text-xl text-white" />
                      </div>
                      <span className="text-xs text-[var(--subtle)] group-hover:text-white transition-colors">
                        {platform.name}
                      </span>
                    </motion.button>
                  ))}
                </motion.div>

                {/* Divider */}
                <div className="border-t border-outline my-5" />

                {/* Copy URL */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0 px-3 py-2.5 bg-input border border-outline rounded-lg text-sm text-[var(--subtle)] truncate select-all">
                    {url}
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      copied
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-accent-primary hover:bg-accent-primary/80 text-white"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="size-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="size-4" />
                        Copy
                      </>
                    )}
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
