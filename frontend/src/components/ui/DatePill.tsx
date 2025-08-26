// components/ui/DatePill.tsx
import Pill from "./Pill";
import { Calendar } from "lucide-react";
import { dateFormatYear } from "../../utils/dateFormatYear";

export default function DatePill({
  date,
  className = "",
}: { date?: string; className?: string }) {
  return (
    <Pill className={className} icon={<Calendar className="h-4 w-4" />} title="Release year">
      {date ? dateFormatYear(date) : "No date"}
    </Pill>
  );
}
