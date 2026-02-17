import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";

type BarChartProps = {
  data: Array<{ label: string; value: number }>;
  color?: string;
  height?: number;
};

const DEFAULT_COLOR = "hsl(197, 100%, 50%)"; // accent-primary

export default function BarChart({
  data,
  color = DEFAULT_COLOR,
  height = 280,
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
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(240, 1%, 24%)"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          stroke="white"
          tick={{ fill: "white" }}
          tickLine={{ stroke: "white" }}
        />
        <YAxis
          stroke="white"
          tick={{ fill: "white" }}
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
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
