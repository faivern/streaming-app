type YearRange = { min?: number; max?: number };

type Props = {
  value: YearRange;
  onChange: (range: YearRange) => void;
};

const YEAR_PRESETS: { label: string; range: YearRange }[] = [
  { label: "All Years", range: {} },
  { label: "2020+", range: { min: 2020 } },
  { label: "2010-2019", range: { min: 2010, max: 2019 } },
  { label: "2000-2009", range: { min: 2000, max: 2009 } },
  { label: "1990-1999", range: { min: 1990, max: 1999 } },
  { label: "Before 1990", range: { max: 1989 } },
];

function rangesMatch(a: YearRange, b: YearRange): boolean {
  return a.min === b.min && a.max === b.max;
}

export default function YearRangeSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {YEAR_PRESETS.map((preset) => {
        const isSelected = rangesMatch(value, preset.range);
        return (
          <button
            key={preset.label}
            onClick={() => onChange(preset.range)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              isSelected
                ? "bg-accent-primary text-white"
                : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
            }`}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}
