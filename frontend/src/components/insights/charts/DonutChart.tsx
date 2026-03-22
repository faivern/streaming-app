import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type DonutChartProps = {
  data: Array<{ name: string; value: number }>;
  colors?: string[];
  height?: number;
  centerLabel?: string;
  centerSubLabel?: string;
};

// Cinelas blizzard theme colors
const DEFAULT_COLORS = [
  "hsl(197, 100%, 50%)", // accent-primary
  "hsl(215, 99%, 58%)", // accent-secondary
  "hsl(228, 85%, 62%)", // accent-thirdary
  "hsl(207, 92%, 36%)", // secondary
  "hsl(199, 100%, 45%)", // primary
  "hsl(197, 80%, 40%)", // muted tone 1
  "hsl(215, 70%, 48%)", // muted tone 2
  "hsl(228, 65%, 52%)", // muted tone 3
  "hsl(207, 72%, 32%)", // muted tone 4
];

export default function DonutChart({
  data,
  colors = DEFAULT_COLORS,
  height = 280,
  centerLabel,
  centerSubLabel,
}: DonutChartProps) {
  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-gray-400"
        style={{ height: `${height}px` }}
      >
        No data available
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
            animationBegin={0}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          {/* Center label rendered via SVG */}
          {centerLabel && (
            <>
              <text
                x="50%"
                y="48%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="15"
                fontWeight="bold"
              >
                {centerLabel}
              </text>
              {centerSubLabel && (
                <text
                  x="50%"
                  y="58%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="hsl(0, 0%, 64%)"
                  fontSize="12"
                >
                  {centerSubLabel}
                </text>
              )}
            </>
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(222, 38%, 14%)",
              border: "1px solid hsl(240, 1%, 24%)",
              borderRadius: "8px",
              color: "white",
            }}
            itemStyle={{
              color: "white",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Custom legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-1 px-2">
        {data.slice(0, 8).map((item, index) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="text-xs text-subtle">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
