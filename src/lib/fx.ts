const HOST = "https://api.frankfurter.dev";

export const HOUR_MS = 60 * 60 * 1000;

export type Currency = {
  code: string;
  name: string;
  symbol: string;
  digits: number;
};

const ZERO_DIGITS = new Set(["JPY", "KRW", "HUF", "IDR", "ISK"]);

const RAW: { code: string; name: string; symbol: string }[] = [
  { code: "CNY", name: "人民币", symbol: "¥" },
  { code: "EUR", name: "欧元", symbol: "€" },
  { code: "USD", name: "美元", symbol: "$" },
  { code: "PLN", name: "兹罗提", symbol: "zł" },
  { code: "GBP", name: "英镑", symbol: "£" },
  { code: "JPY", name: "日元", symbol: "¥" },
  { code: "HKD", name: "港币", symbol: "HK$" },
  { code: "CHF", name: "瑞士法郎", symbol: "Fr" },
  { code: "SGD", name: "新加坡元", symbol: "S$" },
  { code: "AUD", name: "澳元", symbol: "A$" },
  { code: "CAD", name: "加元", symbol: "C$" },
  { code: "KRW", name: "韩元", symbol: "₩" },
  { code: "THB", name: "泰铢", symbol: "฿" },
  { code: "MYR", name: "林吉特", symbol: "RM" },
  { code: "INR", name: "印度卢比", symbol: "₹" },
  { code: "TRY", name: "土耳其里拉", symbol: "₺" },
  { code: "SEK", name: "瑞典克朗", symbol: "kr" },
  { code: "NOK", name: "挪威克朗", symbol: "kr" },
  { code: "DKK", name: "丹麦克朗", symbol: "kr" },
  { code: "CZK", name: "捷克克朗", symbol: "Kč" },
  { code: "HUF", name: "福林", symbol: "Ft" },
  { code: "RON", name: "罗马尼亚列伊", symbol: "lei" },
  { code: "NZD", name: "新西兰元", symbol: "NZ$" },
  { code: "ZAR", name: "南非兰特", symbol: "R" },
  { code: "BRL", name: "雷亚尔", symbol: "R$" },
  { code: "MXN", name: "墨西哥比索", symbol: "MX$" },
  { code: "PHP", name: "菲律宾比索", symbol: "₱" },
  { code: "IDR", name: "印尼盾", symbol: "Rp" },
  { code: "ILS", name: "新谢克尔", symbol: "₪" },
  { code: "ISK", name: "冰岛克朗", symbol: "kr" },
];

export const CURRENCIES: Currency[] = RAW.map((row) => ({
  ...row,
  digits: ZERO_DIGITS.has(row.code) ? 0 : 2,
}));

const CURRENCY_MAP = new Map(CURRENCIES.map((c) => [c.code, c]));

export function isCurrencyCode(code: string): boolean {
  return CURRENCY_MAP.has(code);
}

export function currencyOf(code: string): Currency {
  return CURRENCY_MAP.get(code) ?? { code, name: code, symbol: "", digits: 2 };
}

const VIA_FALLBACKS = ["EUR", "USD", "GBP", "CNY", "CHF", "JPY", "PLN"];

export function pickVia(from: string, to: string, current?: string): string {
  if (current && current !== from && current !== to && isCurrencyCode(current)) return current;
  for (const code of VIA_FALLBACKS) {
    if (code !== from && code !== to) return code;
  }
  return CURRENCIES.find((c) => c.code !== from && c.code !== to)?.code ?? "EUR";
}

export const PERIODS = [
  { id: "7d", label: "7 日", days: 7 },
  { id: "1m", label: "1 月", days: 31 },
  { id: "3m", label: "3 月", days: 93 },
  { id: "6m", label: "6 月", days: 183 },
  { id: "1y", label: "1 年", days: 366 },
  { id: "5y", label: "5 年", days: 1826 },
] as const;

export type PeriodId = (typeof PERIODS)[number]["id"];
export type SeriesMode = "leg1" | "leg2" | "cross" | "gap";

export function periodById(id: string): (typeof PERIODS)[number] {
  return PERIODS.find((p) => p.id === id) ?? PERIODS[1];
}

export type Quote = {
  amount: number;
  from: string;
  via: string | null;
  to: string;
  leg1Rate: number;
  leg2Rate: number;
  crossRate: number;
  midAmount: number;
  finalAmount: number;
};

export function unitRate(
  rates: Record<string, number>,
  base: string,
  code: string,
): number | null {
  if (code === base) return 1;
  const rate = rates[code];
  return typeof rate === "number" && Number.isFinite(rate) ? rate : null;
}

export function roundMoney(n: number, code: string): number {
  const digits = currencyOf(code).digits;
  const factor = 10 ** digits;
  return Math.round((n + Number.EPSILON) * factor) / factor;
}

export function buildQuote(args: {
  rates: Record<string, number>;
  viaRates?: Record<string, number> | null;
  base: string;
  amount: number;
  from: string;
  via: string | null;
  to: string;
}): Quote | null {
  if (args.base !== args.from) return null;
  const toRate = unitRate(args.rates, args.base, args.to);
  if (toRate == null) return null;
  if (!args.via) {
    return {
      amount: args.amount,
      from: args.from,
      via: null,
      to: args.to,
      leg1Rate: toRate,
      leg2Rate: 1,
      crossRate: toRate,
      midAmount: roundMoney(args.amount * toRate, args.to),
      finalAmount: roundMoney(args.amount * toRate, args.to),
    };
  }
  const viaRate = unitRate(args.rates, args.base, args.via);
  if (viaRate == null || viaRate === 0) return null;
  const published = args.viaRates ? unitRate(args.viaRates, args.via, args.to) : null;
  const leg2 = published != null ? published : toRate / viaRate;
  const mid = roundMoney(args.amount * viaRate, args.via);
  const chained = published != null ? mid * leg2 : args.amount * viaRate * leg2;
  return {
    amount: args.amount,
    from: args.from,
    via: args.via,
    to: args.to,
    leg1Rate: viaRate,
    leg2Rate: leg2,
    crossRate: toRate,
    midAmount: mid,
    finalAmount: roundMoney(chained, args.to),
  };
}

export type PathCompare = {
  directRate: number;
  chainRate: number;
  factor: number;
  bps: number;
  directAmount: number;
  chainAmount: number;
  cashGap: number;
};

export function comparePaths(
  directRate: number,
  leg1: number,
  leg2: number,
  amount: number,
  via: string,
  to: string,
): PathCompare | null {
  if (![directRate, leg1, leg2, amount].every((n) => Number.isFinite(n)) || directRate === 0) return null;
  const chainRate = leg1 * leg2;
  const mid = roundMoney(amount * leg1, via);
  const chainAmount = roundMoney(mid * leg2, to);
  const directAmount = roundMoney(amount * directRate, to);
  return {
    directRate,
    chainRate,
    factor: chainRate / directRate,
    bps: (chainRate / directRate - 1) * 10_000,
    directAmount,
    chainAmount,
    cashGap: roundMoney(chainAmount - directAmount, to),
  };
}

export function factorOnDate(
  fromPoint: RatePoint,
  viaPoint: RatePoint | undefined,
  from: string,
  via: string,
  to: string,
): number | null {
  if (!viaPoint) return null;
  const direct = unitRate(fromPoint.rates, from, to);
  const leg1 = unitRate(fromPoint.rates, from, via);
  const leg2 = unitRate(viaPoint.rates, via, to);
  if (direct == null || leg1 == null || leg2 == null || direct === 0) return null;
  return (leg1 * leg2) / direct;
}

export function formatRate(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  const max = abs >= 1000 ? 2 : abs >= 100 ? 3 : abs >= 1 ? 4 : abs >= 0.01 ? 5 : 6;
  return new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: max,
  }).format(n);
}

export function formatMoney(n: number, code: string): string {
  if (!Number.isFinite(n)) return "—";
  const digits = currencyOf(code).digits;
  return new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

export function formatFactor(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toLocaleString("zh-CN", {
    minimumFractionDigits: 6,
    maximumFractionDigits: 6,
  });
}

export function formatBps(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  const digits = abs !== 0 && abs < 0.05 ? 3 : 2;
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)} bp`;
}

export function formatPct(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  const digits = abs !== 0 && abs < 0.005 ? 4 : 2;
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}%`;
}

export function percentChange(prev: number, next: number): number | null {
  if (!Number.isFinite(prev) || !Number.isFinite(next) || prev === 0) return null;
  return ((next - prev) / prev) * 100;
}

export function rateMoved(a: number, b: number): boolean {
  const denom = Math.max(Math.abs(a), Math.abs(b), 1e-12);
  return Math.abs(a - b) / denom > 1e-8;
}

export function pathKey(from: string, via: string | null, to: string): string {
  return via ? `${from}>${via}>${to}` : `${from}>${to}`;
}

export function sanitizeAmount(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const dot = cleaned.indexOf(".");
  if (dot === -1) return cleaned.slice(0, 12);
  const whole = cleaned.slice(0, dot).slice(0, 12);
  const frac = cleaned.slice(dot + 1).replace(/\./g, "").slice(0, 4);
  return `${whole}.${frac}`;
}

export function parseAmount(text: string): number {
  if (!text || text === ".") return 0;
  const n = Number(text);
  return Number.isFinite(n) ? n : 0;
}

export type RatePoint = { date: string; rates: Record<string, number> };

export type LatestRates = {
  base: string;
  date: string;
  rates: Record<string, number>;
  fetchedAt: string;
};

export type HistoryRates = {
  base: string;
  points: RatePoint[];
  fetchedAt: string;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function assertCode(code: string): string {
  if (!/^[A-Z]{3}$/.test(code) || !isCurrencyCode(code)) {
    throw new Error("不支持的货币");
  }
  return code;
}

function berlinDate(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function rangeForDays(days: number): { start: string; end: string } {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 86_400_000);
  return { start: berlinDate(startDate), end: berlinDate(endDate) };
}

async function getJson(url: string): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(url, {
      cache: "no-store",
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    throw new Error("连不上汇率源，请检查网络后再查询");
  }
  if (!res.ok) throw new Error(`汇率源暂时不可用（${res.status}）`);
  return res.json();
}

function cleanQuotes(base: string, quotes: string[]): string[] {
  const next: string[] = [];
  for (const quote of quotes) {
    const code = assertCode(quote);
    if (code !== base && !next.includes(code)) next.push(code);
  }
  return next;
}

function pointsFromRows(body: unknown): { date: string; points: RatePoint[] } {
  if (!Array.isArray(body)) throw new Error("汇率源返回了无法识别的数据");
  const byDate = new Map<string, Record<string, number>>();
  let latestDate = "";
  for (const row of body) {
    if (!isRecord(row)) continue;
    if (typeof row.date !== "string" || typeof row.quote !== "string") continue;
    if (typeof row.rate !== "number" || !Number.isFinite(row.rate)) continue;
    const bucket = byDate.get(row.date) ?? {};
    bucket[row.quote] = row.rate;
    byDate.set(row.date, bucket);
    if (row.date > latestDate) latestDate = row.date;
  }
  const points = [...byDate.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, rates]) => ({ date, rates }));
  return { date: latestDate, points };
}

function latestFromRows(body: unknown): { date: string; rates: Record<string, number> } {
  if (!Array.isArray(body)) throw new Error("汇率源返回了无法识别的数据");
  const rates: Record<string, number> = {};
  const seen = new Map<string, string>();
  let latestDate = "";
  for (const row of body) {
    if (!isRecord(row)) continue;
    if (typeof row.date !== "string" || typeof row.quote !== "string") continue;
    if (typeof row.rate !== "number" || !Number.isFinite(row.rate)) continue;
    const prev = seen.get(row.quote);
    if (prev && prev > row.date) continue;
    seen.set(row.quote, row.date);
    rates[row.quote] = row.rate;
    if (row.date > latestDate) latestDate = row.date;
  }
  return { date: latestDate, rates };
}

export async function fetchLatest(base: string): Promise<LatestRates> {
  const code = assertCode(base);
  const quotes = CURRENCIES.map((item) => item.code).filter((item) => item !== code);
  const body = await getJson(`${HOST}/v2/rates?base=${code}&quotes=${quotes.join(",")}`);
  const parsed = latestFromRows(body);
  if (!parsed.date || Object.keys(parsed.rates).length === 0) {
    throw new Error("汇率源没有返回可用牌价");
  }
  return {
    base: code,
    date: parsed.date,
    rates: parsed.rates,
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchHistory(
  base: string,
  quotes: string[],
  days: number,
): Promise<HistoryRates> {
  const code = assertCode(base);
  if (!PERIODS.some((period) => period.days === days)) throw new Error("不支持的周期");
  const clean = cleanQuotes(code, quotes);
  if (clean.length === 0) {
    return { base: code, points: [], fetchedAt: new Date().toISOString() };
  }
  const { start, end } = rangeForDays(days);
  const body = await getJson(
    `${HOST}/v2/rates?base=${code}&quotes=${clean.join(",")}&from=${start}&to=${end}`,
  );
  return {
    base: code,
    points: pointsFromRows(body).points,
    fetchedAt: new Date().toISOString(),
  };
}

export function seriesRate(
  point: RatePoint,
  base: string,
  mode: SeriesMode,
  from: string,
  via: string | null,
  to: string,
): number | null {
  const rateOf = (code: string): number | null => {
    if (code === base) return 1;
    const value = point.rates[code];
    return typeof value === "number" ? value : null;
  };
  if (mode === "cross" || !via) {
    return rateOf(to);
  }
  if (mode === "leg1") return rateOf(via);
  const left = rateOf(via);
  const right = rateOf(to);
  if (left == null || right == null || left === 0) return null;
  return right / left;
}

export function formatShanghai(ts: number): string {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(ts));
}

export function formatRemain(ms: number): string {
  if (ms <= 0) return "即将核对";
  const totalMin = Math.floor(ms / 60_000);
  const sec = Math.floor((ms % 60_000) / 1000);
  if (totalMin >= 60) {
    const hours = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    return `${hours} 小时 ${mins} 分`;
  }
  if (totalMin > 0) return `${totalMin} 分 ${String(sec).padStart(2, "0")} 秒`;
  return `${sec} 秒`;
}
