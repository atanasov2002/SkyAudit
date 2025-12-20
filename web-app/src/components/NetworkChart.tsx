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

export default function NetworkChart({ data, title }: any) {
  if (!data || data.length === 0) return null;

  const sorted = [...data].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  const formatted = sorted.map((m) => ({
    time: format(new Date(m.timestamp), "HH:mm"),
    value: m.value,
  }));

  const color = title === "networkIn" ? "#00ff88" : "#ff7b44"; // green vs orange

  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <LineChart data={formatted}>
          <defs>
            <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.9} />
              <stop offset="100%" stopColor={color} stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="time" tick={{ fill: "#aaa" }} />
          <YAxis tick={{ fill: "#aaa" }} />
          <Tooltip
            contentStyle={{
              background: "#1a1a1a",
              borderRadius: 8,
              border: "1px solid #333",
            }}
            labelStyle={{ color: "#fff" }}
            itemStyle={{ color }}
          />

          <Line
            type="monotone"
            dataKey="value"
            stroke={`url(#netGrad)`}
            strokeWidth={3}
            dot={{ r: 4, stroke: color, strokeWidth: 2, fill: "#111" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
