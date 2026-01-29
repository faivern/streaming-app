import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

type Props = {
  value: number;
  onChange: (value: number) => void;
};

export default function RatingSlider({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">Min Rating</span>
        <span className="flex items-center gap-1 text-white font-medium">
          <FontAwesomeIcon icon={faStar} className="text-yellow-400 w-3 h-3" />
          {value > 0 ? `${value}+` : "Any"}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={9}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent-primary"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>Any</span>
        <span>9+</span>
      </div>
    </div>
  );
}
