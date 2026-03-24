import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PieDataItem {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: PieDataItem[];
  height?: number;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: PieDataItem }>;
}) {
  if (!active || !payload?.length) return null;

  const entry = payload[0];
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 shadow-lg">
      <p className="text-sm font-medium" style={{ color: entry.payload.color }}>
        {entry.name}
      </p>
      <p className="text-sm">{entry.value.toLocaleString()}</p>
    </div>
  );
}

export function DonutChart({ data, height = 250 }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
          stroke="none"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>

        <Tooltip content={<CustomTooltip />} />

        {/* Center label */}
        <text
          x="50%"
          y="48%"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-current text-2xl font-bold font-display"
          style={{ fill: "var(--foreground, #fff)" }}
        >
          {total.toLocaleString()}
        </text>
        <text
          x="50%"
          y="58%"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-current text-xs"
          style={{ fill: "var(--muted-foreground, #999)" }}
        >
          Total
        </text>
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
