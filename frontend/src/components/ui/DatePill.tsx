// components/ui/DatePill.tsx
import Pill from "./Pill";
import { Calendar } from "lucide-react";
import { dateFormatYear } from "../../utils/dateFormatYear";
import { dateFormatLong } from "../../utils/dateFormatLong";

export default function DatePill({
  date,
  className = "",
  longDate = true,
}: { date?: string; className?: string; longDate?: boolean }) {
  return (
    <Pill className={className} icon={<Calendar className="h-4 w-4" />} title="Release year">
      <span className="text-white/90">
        {date ? (longDate ? dateFormatLong(date) : dateFormatYear(date)) : "No date"}
      </span>
    </Pill>
  );
}
