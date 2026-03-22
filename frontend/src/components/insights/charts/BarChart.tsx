import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

type BarChartProps = {
  data: Array<{ label: string; value: number }>;
  height?: number;
  highlightIndex?: number;
};

export default function BarChart({
  data,
  height = 280,
  highlightIndex,
}: BarChartProps) {
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
      <RechartsBarChart data={data}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity={1} />
            <stop offset="100%" stopColor="var(--accent-secondary)" stopOpacity={0.6} />
          </linearGradient>
          <linearGradient id="barGradientHighlight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity={1} />
            <stop offset="100%" stopColor="var(--accent-secondary)" stopOpacity={0.9} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(240, 1%, 24%)"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          stroke="white"
          tick={{ fill: "white", fontSize: 12 }}
          tickLine={{ stroke: "white" }}
        />
        <YAxis
          stroke="white"
          tick={{ fill: "white", fontSize: 12 }}
          tickLine={{ stroke: "white" }}
          allowDecimals={false}
        />
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
          cursor={{ fill: "hsl(240, 1%, 20%)" }}
        />
        <Bar
          dataKey="value"
          radius={[4, 4, 0, 0]}
          animationDuration={1000}
          animationBegin={200}
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                highlightIndex !== undefined && index === highlightIndex
                  ? "url(#barGradientHighlight)"
                  : "url(#barGradient)"
              }
              opacity={
                highlightIndex !== undefined && index !== highlightIndex
                  ? 0.5
                  : 1
              }
            />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
