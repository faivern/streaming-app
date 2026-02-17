import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

type DonutChartProps = {
  data: Array<{ name: string; value: number }>;
  colors?: string[];
  height?: number;
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
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
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
        <Legend
          wrapperStyle={{
            color: "white",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
