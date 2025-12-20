import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

export default function CpuChart({
  data,
}: {
  data: { timestamp: string; value: number }[];
}) {
  if (!data || data.length === 0) return null;

  // Sort by timestamp
  const sorted = [...data].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  // Format data for recharts
  const formatted = sorted.map((m) => ({
    time: format(new Date(m.timestamp), "HH:mm"),
    value: Number((m.value * 100).toFixed(2)), // to % if your CPU is 0.12 = 12%
  }));

  return (
    <div className="w-full h-64 bg-[#111] rounded-xl p-4 shadow-lg border border-white/5">
      <h2 className="text-white text-lg font-semibold mb-2">
        CPU Utilization (%)
      </h2>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted}>
          <defs>
            <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f9bff" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#4f9bff" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#333" />

          <XAxis
            dataKey="time"
            tick={{ fill: "#888", fontSize: 12 }}
            axisLine={{ stroke: "#444" }}
          />

          <YAxis
            tick={{ fill: "#888", fontSize: 12 }}
            axisLine={{ stroke: "#444" }}
            domain={[0, "auto"]}
          />

          <Tooltip
            contentStyle={{
              background: "#1c1c1c",
              border: "1px solid #333",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#fff" }}
            itemStyle={{ color: "#4f9bff" }}
          />

          <Line
            type="monotone"
            dataKey="value"
            stroke="url(#cpuGradient)"
            strokeWidth={3}
            dot={{ r: 4, stroke: "#4f9bff", strokeWidth: 2, fill: "#111" }}
            activeDot={{ r: 6 }}
            animationDuration={500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
