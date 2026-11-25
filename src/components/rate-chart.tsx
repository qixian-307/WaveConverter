import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatRate, type PeriodId } from "@/lib/fx";

export type ChartPoint = { date: string; rate: number };

type TipPayload = { value?: number | string };

function axisLabel(iso: string, period: PeriodId): string {
  const parts = iso.split("-");
  const month = parts[1] ?? "";
  const day = parts[2] ?? "";
  if (period === "1y" || period === "5y") return `${iso.slice(2, 4)}-${month}`;
  return `${month}-${day}`;
}

function axisDigits(span: number): number {
  if (span >= 50) return 2;
  if (span >= 1) return 3;
  if (span >= 0.1) return 3;
  if (span >= 0.01) return 4;
  if (span >= 0.001) return 5;
  if (span >= 0.0001) return 6;
  if (span >= 0.00001) return 7;
  return 8;
}

function formatAxis(value: number, digits: number): string {
  return value.toLocaleString("zh-CN", {
    minimumFractionDigits: Math.min(2, digits),
    maximumFractionDigits: digits,
  });
}
function domainOf(values: number[]): [number, number] {
  let min = values[0] ?? 0;
  let max = values[0] ?? 0;
  for (const value of values) {
    if (value < min) min = value;
    if (value > max) max = value;
  }
  const span = max - min;
  const pad = span === 0 ? Math.abs(max) * 0.004 || 0.001 : span * 0.16;
  return [min - pad, max + pad];
}

function Tip({
  active,
  label,
  payload,
  digits,
}: {
  active?: boolean;
  label?: string | number;
  payload?: ReadonlyArray<TipPayload>;
  digits: number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const raw = payload[0]?.value;
  const rate = typeof raw === "number" ? raw : Number(raw);
  const text = digits >= 6 ? formatAxis(rate, digits) : formatRate(rate);
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2 shadow-sm">
      <p className="text-xs text-muted">{label}</p>
      <p className="font-display text-lg tabular-nums text-ink">{text}</p>
    </div>
  );
}

export function RateChart({
  points,
  period,
  tone,
}: {
  points: ChartPoint[];
  period: PeriodId;
  tone: "up" | "down" | "flat";
}) {
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReady(true);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
    const onChange = () => setReduced(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  if (!ready) return <div className="h-56 w-full sm:h-72" />;

  const stroke = tone === "down" ? "var(--color-down)" : "var(--color-accent)";
  const [low, high] = domainOf(points.map((p) => p.rate));
  const digits = axisDigits(high - low);

  return (
    <div className="h-56 w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 12, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--color-line)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => axisLabel(value, period)}
            minTickGap={28}
            tick={{ fill: "var(--color-muted)", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[low, high]}
            width={digits >= 7 ? 108 : digits >= 6 ? 96 : 84}
            tickFormatter={(value: number) => formatAxis(value, digits)}
            tick={{ fill: "var(--color-muted)", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<Tip digits={digits} />} />
          <Line
            type="monotone"
            dataKey="rate"
            stroke={stroke}
            strokeWidth={2}
            dot={points.length < 2}
            activeDot={{ r: 4 }}
            isAnimationActive={!reduced && points.length > 1 && points.length <= 40}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
