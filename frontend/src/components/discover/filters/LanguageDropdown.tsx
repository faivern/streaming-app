import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faCheck } from "@fortawesome/free-solid-svg-icons";

type Props = {
  value: string;
  onChange: (language: string) => void;
};

const LANG_TO_COUNTRY: Record<string, string> = {
  en: "us", es: "es", fr: "fr", de: "de", it: "it", pt: "pt",
  ja: "jp", ko: "kr", zh: "cn", hi: "in", ru: "ru", ar: "sa",
  sv: "se", da: "dk", no: "no", fi: "fi", nl: "nl", pl: "pl",
  tr: "tr", th: "th", cs: "cz", el: "gr", he: "il", hu: "hu",
  id: "id", ms: "my", ro: "ro", uk: "ua", vi: "vn", bn: "bd",
  ta: "lk", te: "in", ml: "in", fa: "ir", tl: "ph", hr: "hr",
  bg: "bg", sr: "rs", sk: "sk", sl: "si", et: "ee", lt: "lt",
  lv: "lv", is: "is", ka: "ge", sq: "al", mk: "mk", bs: "ba",
  sw: "ke", ur: "pk", pa: "in", gu: "in", mr: "in", kn: "in",
  my: "mm", km: "kh", lo: "la", mn: "mn", ne: "np", si: "lk",
};

const LANGUAGE_OPTIONS: { code: string; label: string }[] = [
  { code: "", label: "Any Language" },
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "pt", label: "Portuguese" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "zh", label: "Chinese" },
  { code: "hi", label: "Hindi" },
  { code: "ru", label: "Russian" },
  { code: "ar", label: "Arabic" },
  { code: "sv", label: "Swedish" },
  { code: "da", label: "Danish" },
  { code: "no", label: "Norwegian" },
  { code: "fi", label: "Finnish" },
  { code: "nl", label: "Dutch" },
  { code: "pl", label: "Polish" },
  { code: "tr", label: "Turkish" },
  { code: "th", label: "Thai" },
  { code: "cs", label: "Czech" },
  { code: "el", label: "Greek" },
  { code: "he", label: "Hebrew" },
  { code: "hu", label: "Hungarian" },
  { code: "id", label: "Indonesian" },
  { code: "ms", label: "Malay" },
  { code: "ro", label: "Romanian" },
  { code: "uk", label: "Ukrainian" },
  { code: "vi", label: "Vietnamese" },
  { code: "bn", label: "Bengali" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "ml", label: "Malayalam" },
  { code: "tl", label: "Tagalog" },
  { code: "fa", label: "Persian" },
  { code: "hr", label: "Croatian" },
  { code: "bg", label: "Bulgarian" },
  { code: "sr", label: "Serbian" },
  { code: "sk", label: "Slovak" },
  { code: "is", label: "Icelandic" },
  { code: "ka", label: "Georgian" },
];

export default function LanguageDropdown({ value, onChange }: Props) {
  const selectedOption =
    LANGUAGE_OPTIONS.find((opt) => opt.code === value) || LANGUAGE_OPTIONS[0];

  return (
    <Listbox value={selectedOption} onChange={(opt) => onChange(opt.code)}>
      <div className="relative">
        <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-gray-700/50 border border-gray-600 py-2 pl-3 pr-10 text-left text-white focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all text-sm">
          <span className="flex items-center gap-2 truncate">
            {selectedOption.code && LANG_TO_COUNTRY[selectedOption.code] && (
              <span className={`fi fi-${LANG_TO_COUNTRY[selectedOption.code]}`} />
            )}
            {selectedOption.label}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <FontAwesomeIcon
              icon={faChevronDown}
              className="h-3 w-3 text-gray-400"
            />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-gray-800 border border-gray-600 py-1 text-sm shadow-lg focus:outline-none">
            {LANGUAGE_OPTIONS.map((option) => (
              <Listbox.Option
                key={option.code || "any"}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-3 pl-10 pr-4 ${
                    active ? "bg-accent-primary/20 text-white" : "text-gray-300"
                  }`
                }
                value={option}
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`flex items-center gap-2 ${
                        selected ? "font-medium text-white" : "font-normal"
                      }`}
                    >
                      {option.code && LANG_TO_COUNTRY[option.code] && (
                        <span className={`fi fi-${LANG_TO_COUNTRY[option.code]}`} />
                      )}
                      {option.label}
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-accent-primary">
                        <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
