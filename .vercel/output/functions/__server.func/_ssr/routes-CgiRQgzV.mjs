import { i as __toESM } from "../_runtime.mjs";
import { i as require_react, r as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { a as Minus, c as ArrowLeftRight, i as RefreshCw, n as TrendingUp, o as Clock, r as TrendingDown, s as ChevronDown } from "../_libs/lucide-react.mjs";
import { a as CartesianGrid, i as Line, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as LineChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CgiRQgzV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var HOST = "https://api.frankfurter.dev";
var HOUR_MS = 36e5;
var ZERO_DIGITS = /* @__PURE__ */ new Set([
	"JPY",
	"KRW",
	"HUF",
	"IDR",
	"ISK"
]);
var CURRENCIES = [
	{
		code: "CNY",
		name: "人民币",
		symbol: "¥"
	},
	{
		code: "EUR",
		name: "欧元",
		symbol: "€"
	},
	{
		code: "USD",
		name: "美元",
		symbol: "$"
	},
	{
		code: "PLN",
		name: "兹罗提",
		symbol: "zł"
	},
	{
		code: "GBP",
		name: "英镑",
		symbol: "£"
	},
	{
		code: "JPY",
		name: "日元",
		symbol: "¥"
	},
	{
		code: "HKD",
		name: "港币",
		symbol: "HK$"
	},
	{
		code: "CHF",
		name: "瑞士法郎",
		symbol: "Fr"
	},
	{
		code: "SGD",
		name: "新加坡元",
		symbol: "S$"
	},
	{
		code: "AUD",
		name: "澳元",
		symbol: "A$"
	},
	{
		code: "CAD",
		name: "加元",
		symbol: "C$"
	},
	{
		code: "KRW",
		name: "韩元",
		symbol: "₩"
	},
	{
		code: "THB",
		name: "泰铢",
		symbol: "฿"
	},
	{
		code: "MYR",
		name: "林吉特",
		symbol: "RM"
	},
	{
		code: "INR",
		name: "印度卢比",
		symbol: "₹"
	},
	{
		code: "TRY",
		name: "土耳其里拉",
		symbol: "₺"
	},
	{
		code: "SEK",
		name: "瑞典克朗",
		symbol: "kr"
	},
	{
		code: "NOK",
		name: "挪威克朗",
		symbol: "kr"
	},
	{
		code: "DKK",
		name: "丹麦克朗",
		symbol: "kr"
	},
	{
		code: "CZK",
		name: "捷克克朗",
		symbol: "Kč"
	},
	{
		code: "HUF",
		name: "福林",
		symbol: "Ft"
	},
	{
		code: "RON",
		name: "罗马尼亚列伊",
		symbol: "lei"
	},
	{
		code: "NZD",
		name: "新西兰元",
		symbol: "NZ$"
	},
	{
		code: "ZAR",
		name: "南非兰特",
		symbol: "R"
	},
	{
		code: "BRL",
		name: "雷亚尔",
		symbol: "R$"
	},
	{
		code: "MXN",
		name: "墨西哥比索",
		symbol: "MX$"
	},
	{
		code: "PHP",
		name: "菲律宾比索",
		symbol: "₱"
	},
	{
		code: "IDR",
		name: "印尼盾",
		symbol: "Rp"
	},
	{
		code: "ILS",
		name: "新谢克尔",
		symbol: "₪"
	},
	{
		code: "ISK",
		name: "冰岛克朗",
		symbol: "kr"
	}
].map((row) => ({
	...row,
	digits: ZERO_DIGITS.has(row.code) ? 0 : 2
}));
var CURRENCY_MAP = new Map(CURRENCIES.map((c) => [c.code, c]));
function isCurrencyCode(code) {
	return CURRENCY_MAP.has(code);
}
function currencyOf(code) {
	return CURRENCY_MAP.get(code) ?? {
		code,
		name: code,
		symbol: "",
		digits: 2
	};
}
var VIA_FALLBACKS = [
	"EUR",
	"USD",
	"GBP",
	"CNY",
	"CHF",
	"JPY",
	"PLN"
];
function pickVia(from, to, current) {
	if (current && current !== from && current !== to && isCurrencyCode(current)) return current;
	for (const code of VIA_FALLBACKS) if (code !== from && code !== to) return code;
	return CURRENCIES.find((c) => c.code !== from && c.code !== to)?.code ?? "EUR";
}
var PERIODS = [
	{
		id: "7d",
		label: "7 日",
		days: 7
	},
	{
		id: "1m",
		label: "1 月",
		days: 31
	},
	{
		id: "3m",
		label: "3 月",
		days: 93
	},
	{
		id: "6m",
		label: "6 月",
		days: 183
	},
	{
		id: "1y",
		label: "1 年",
		days: 366
	},
	{
		id: "5y",
		label: "5 年",
		days: 1826
	}
];
function periodById(id) {
	return PERIODS.find((p) => p.id === id) ?? PERIODS[1];
}
function unitRate(rates, base, code) {
	if (code === base) return 1;
	const rate = rates[code];
	return typeof rate === "number" && Number.isFinite(rate) ? rate : null;
}
function roundMoney(n, code) {
	const factor = 10 ** currencyOf(code).digits;
	return Math.round((n + Number.EPSILON) * factor) / factor;
}
function buildQuote(args) {
	if (args.base !== args.from) return null;
	const toRate = unitRate(args.rates, args.base, args.to);
	if (toRate == null) return null;
	if (!args.via) return {
		amount: args.amount,
		from: args.from,
		via: null,
		to: args.to,
		leg1Rate: toRate,
		leg2Rate: 1,
		crossRate: toRate,
		midAmount: roundMoney(args.amount * toRate, args.to),
		finalAmount: roundMoney(args.amount * toRate, args.to)
	};
	const viaRate = unitRate(args.rates, args.base, args.via);
	if (viaRate == null || viaRate === 0) return null;
	const leg2 = toRate / viaRate;
	const mid = args.amount * viaRate;
	return {
		amount: args.amount,
		from: args.from,
		via: args.via,
		to: args.to,
		leg1Rate: viaRate,
		leg2Rate: leg2,
		crossRate: toRate,
		midAmount: roundMoney(mid, args.via),
		finalAmount: roundMoney(mid * leg2, args.to)
	};
}
function formatRate(n) {
	if (!Number.isFinite(n)) return "—";
	const abs = Math.abs(n);
	const max = abs >= 1e3 ? 2 : abs >= 100 ? 3 : abs >= 1 ? 4 : abs >= .01 ? 5 : 6;
	return new Intl.NumberFormat("zh-CN", {
		minimumFractionDigits: 2,
		maximumFractionDigits: max
	}).format(n);
}
function formatMoney(n, code) {
	if (!Number.isFinite(n)) return "—";
	const digits = currencyOf(code).digits;
	return new Intl.NumberFormat("zh-CN", {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits
	}).format(n);
}
function formatPct(n) {
	if (n == null || !Number.isFinite(n)) return "—";
	const abs = Math.abs(n);
	const digits = abs !== 0 && abs < .005 ? 4 : 2;
	return `${n > 0 ? "+" : ""}${n.toFixed(digits)}%`;
}
function percentChange(prev, next) {
	if (!Number.isFinite(prev) || !Number.isFinite(next) || prev === 0) return null;
	return (next - prev) / prev * 100;
}
function rateMoved(a, b) {
	const denom = Math.max(Math.abs(a), Math.abs(b), 1e-12);
	return Math.abs(a - b) / denom > 1e-8;
}
function pathKey(from, via, to) {
	return via ? `${from}>${via}>${to}` : `${from}>${to}`;
}
function sanitizeAmount(raw) {
	const cleaned = raw.replace(/[^\d.]/g, "");
	const dot = cleaned.indexOf(".");
	if (dot === -1) return cleaned.slice(0, 12);
	return `${cleaned.slice(0, dot).slice(0, 12)}.${cleaned.slice(dot + 1).replace(/\./g, "").slice(0, 4)}`;
}
function parseAmount(text) {
	if (!text || text === ".") return 0;
	const n = Number(text);
	return Number.isFinite(n) ? n : 0;
}
function isRecord$1(v) {
	return typeof v === "object" && v !== null;
}
function assertCode(code) {
	if (!/^[A-Z]{3}$/.test(code) || !isCurrencyCode(code)) throw new Error("不支持的货币");
	return code;
}
function berlinDate(d) {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: "Europe/Berlin",
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).format(d);
}
function rangeForDays(days) {
	const endDate = /* @__PURE__ */ new Date();
	return {
		start: berlinDate(/* @__PURE__ */ new Date(endDate.getTime() - days * 864e5)),
		end: berlinDate(endDate)
	};
}
async function getJson(url) {
	let res;
	try {
		res = await fetch(url, {
			cache: "no-store",
			headers: { accept: "application/json" },
			signal: AbortSignal.timeout(12e3)
		});
	} catch {
		throw new Error("连不上汇率源，请检查网络后再查询");
	}
	if (!res.ok) throw new Error(`汇率源暂时不可用（${res.status}）`);
	return res.json();
}
function cleanQuotes(base, quotes) {
	const next = [];
	for (const quote of quotes) {
		const code = assertCode(quote);
		if (code !== base && !next.includes(code)) next.push(code);
	}
	return next;
}
function pointsFromRows(body) {
	if (!Array.isArray(body)) throw new Error("汇率源返回了无法识别的数据");
	const byDate = /* @__PURE__ */ new Map();
	let latestDate = "";
	for (const row of body) {
		if (!isRecord$1(row)) continue;
		if (typeof row.date !== "string" || typeof row.quote !== "string") continue;
		if (typeof row.rate !== "number" || !Number.isFinite(row.rate)) continue;
		const bucket = byDate.get(row.date) ?? {};
		bucket[row.quote] = row.rate;
		byDate.set(row.date, bucket);
		if (row.date > latestDate) latestDate = row.date;
	}
	const points = [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([date, rates]) => ({
		date,
		rates
	}));
	return {
		date: latestDate,
		points
	};
}
function latestFromRows(body) {
	if (!Array.isArray(body)) throw new Error("汇率源返回了无法识别的数据");
	const rates = {};
	const seen = /* @__PURE__ */ new Map();
	let latestDate = "";
	for (const row of body) {
		if (!isRecord$1(row)) continue;
		if (typeof row.date !== "string" || typeof row.quote !== "string") continue;
		if (typeof row.rate !== "number" || !Number.isFinite(row.rate)) continue;
		const prev = seen.get(row.quote);
		if (prev && prev > row.date) continue;
		seen.set(row.quote, row.date);
		rates[row.quote] = row.rate;
		if (row.date > latestDate) latestDate = row.date;
	}
	return {
		date: latestDate,
		rates
	};
}
async function fetchLatest(base) {
	const code = assertCode(base);
	const parsed = latestFromRows(await getJson(`${HOST}/v2/rates?base=${code}&quotes=${CURRENCIES.map((item) => item.code).filter((item) => item !== code).join(",")}`));
	if (!parsed.date || Object.keys(parsed.rates).length === 0) throw new Error("汇率源没有返回可用牌价");
	return {
		base: code,
		date: parsed.date,
		rates: parsed.rates,
		fetchedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
}
async function fetchHistory(base, quotes, days) {
	const code = assertCode(base);
	if (!PERIODS.some((period) => period.days === days)) throw new Error("不支持的周期");
	const clean = cleanQuotes(code, quotes);
	if (clean.length === 0) return {
		base: code,
		points: [],
		fetchedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	const { start, end } = rangeForDays(days);
	return {
		base: code,
		points: pointsFromRows(await getJson(`${HOST}/v2/rates?base=${code}&quotes=${clean.join(",")}&from=${start}&to=${end}`)).points,
		fetchedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
}
function seriesRate(point, base, mode, from, via, to) {
	const rateOf = (code) => {
		if (code === base) return 1;
		const value = point.rates[code];
		return typeof value === "number" ? value : null;
	};
	if (mode === "cross" || !via) return rateOf(to);
	if (mode === "leg1") return rateOf(via);
	const left = rateOf(via);
	const right = rateOf(to);
	if (left == null || right == null || left === 0) return null;
	return right / left;
}
function formatShanghai(ts) {
	return new Intl.DateTimeFormat("zh-CN", {
		timeZone: "Asia/Shanghai",
		month: "numeric",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23"
	}).format(new Date(ts));
}
function formatRemain(ms) {
	if (ms <= 0) return "即将核对";
	const totalMin = Math.floor(ms / 6e4);
	const sec = Math.floor(ms % 6e4 / 1e3);
	if (totalMin >= 60) return `${Math.floor(totalMin / 60)} 小时 ${totalMin % 60} 分`;
	if (totalMin > 0) return `${totalMin} 分 ${String(sec).padStart(2, "0")} 秒`;
	return `${sec} 秒`;
}
function axisLabel(iso, period) {
	const parts = iso.split("-");
	const month = parts[1] ?? "";
	const day = parts[2] ?? "";
	if (period === "1y" || period === "5y") return `${iso.slice(2, 4)}-${month}`;
	return `${month}-${day}`;
}
function axisDigits(span) {
	if (span >= 50) return 2;
	if (span >= 1) return 3;
	if (span >= .1) return 3;
	if (span >= .01) return 4;
	if (span >= .001) return 5;
	return 6;
}
function formatAxis(value, digits) {
	return value.toLocaleString("zh-CN", {
		minimumFractionDigits: Math.min(2, digits),
		maximumFractionDigits: digits
	});
}
function domainOf(values) {
	let min = values[0] ?? 0;
	let max = values[0] ?? 0;
	for (const value of values) {
		if (value < min) min = value;
		if (value > max) max = value;
	}
	const span = max - min;
	const pad = span === 0 ? Math.abs(max) * .004 || .001 : span * .16;
	return [min - pad, max + pad];
}
function Tip({ active, label, payload }) {
	if (!active || !payload || payload.length === 0) return null;
	const raw = payload[0]?.value;
	const rate = typeof raw === "number" ? raw : Number(raw);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-line bg-surface px-3 py-2 shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-lg tabular-nums text-ink",
			children: formatRate(rate)
		})]
	});
}
function RateChart({ points, period, tone }) {
	const [ready, setReady] = (0, import_react.useState)(false);
	const [reduced, setReduced] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setReady(true);
		const media = window.matchMedia("(prefers-reduced-motion: reduce)");
		setReduced(media.matches);
		const onChange = () => setReduced(media.matches);
		media.addEventListener("change", onChange);
		return () => media.removeEventListener("change", onChange);
	}, []);
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-56 w-full sm:h-72" });
	const stroke = tone === "down" ? "var(--color-down)" : "var(--color-accent)";
	const [low, high] = domainOf(points.map((p) => p.rate));
	const digits = axisDigits(high - low);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-56 w-full sm:h-72",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
				data: points,
				margin: {
					top: 12,
					right: 8,
					bottom: 0,
					left: 0
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
						stroke: "var(--color-line)",
						vertical: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: "date",
						tickFormatter: (value) => axisLabel(value, period),
						minTickGap: 28,
						tick: {
							fill: "var(--color-muted)",
							fontSize: 12
						},
						tickLine: false,
						axisLine: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						domain: [low, high],
						width: 84,
						tickFormatter: (value) => formatAxis(value, digits),
						tick: {
							fill: "var(--color-muted)",
							fontSize: 12
						},
						tickLine: false,
						axisLine: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
						type: "monotone",
						dataKey: "rate",
						stroke,
						strokeWidth: 2,
						dot: points.length < 2,
						activeDot: { r: 4 },
						isAnimationActive: !reduced && points.length > 1 && points.length <= 40
					})
				]
			})
		})
	});
}
var WATCH_KEY = "bolv.watch.v1";
var PREF_KEY = "bolv.pref.v1";
var LEGACY_WATCH_KEY = "liangduanhui.watch.v1";
var LEGACY_PREF_KEY = "liangduanhui.pref.v1";
var EMPTY_WATCH = {
	lastCheckAt: 0,
	samples: []
};
function isRecord(v) {
	return typeof v === "object" && v !== null;
}
function asSample(row) {
	if (!isRecord(row)) return null;
	if (typeof row.at !== "number" || typeof row.quoteDate !== "string") return null;
	if (typeof row.path !== "string" || typeof row.from !== "string" || typeof row.to !== "string") return null;
	if (typeof row.leg1 !== "number" || typeof row.leg2 !== "number" || typeof row.cross !== "number") return null;
	const via = row.via === null ? null : typeof row.via === "string" ? row.via : null;
	if (row.via !== null && via === null) return null;
	const kind = row.kind === "base" || row.kind === "move" || row.kind === "flat" ? row.kind : "flat";
	const deltaPct = typeof row.deltaPct === "number" ? row.deltaPct : null;
	return {
		at: row.at,
		quoteDate: row.quoteDate,
		path: row.path,
		from: row.from,
		via,
		to: row.to,
		leg1: row.leg1,
		leg2: row.leg2,
		cross: row.cross,
		deltaPct,
		kind
	};
}
function loadWatch() {
	if (typeof localStorage === "undefined") return EMPTY_WATCH;
	try {
		const raw = localStorage.getItem("bolv.watch.v1") ?? localStorage.getItem(LEGACY_WATCH_KEY);
		if (!raw) return EMPTY_WATCH;
		const parsed = JSON.parse(raw);
		if (!isRecord(parsed) || !Array.isArray(parsed.samples)) return EMPTY_WATCH;
		const samples = [];
		for (const row of parsed.samples) {
			const sample = asSample(row);
			if (sample) samples.push(sample);
		}
		return {
			lastCheckAt: typeof parsed.lastCheckAt === "number" ? parsed.lastCheckAt : 0,
			samples: samples.slice(-168)
		};
	} catch {
		return EMPTY_WATCH;
	}
}
function saveWatch(state) {
	try {
		localStorage.setItem(WATCH_KEY, JSON.stringify(state));
	} catch {}
}
function observe(state, obs) {
	const same = state.samples.filter((s) => s.path === obs.path);
	const prev = same.length > 0 ? same[same.length - 1] : void 0;
	const moved = prev ? rateMoved(prev.cross, obs.cross) || rateMoved(prev.leg1, obs.leg1) || rateMoved(prev.leg2, obs.leg2) : false;
	const dateChanged = prev ? prev.quoteDate !== obs.quoteDate : false;
	if (Boolean(prev && !moved && !dateChanged && obs.at - prev.at < 12e4)) return {
		...state,
		lastCheckAt: obs.at
	};
	const hourAdvanced = prev ? Math.floor(obs.at / HOUR_MS) !== Math.floor(prev.at / HOUR_MS) : false;
	if (!(!prev || moved || dateChanged || hourAdvanced)) return {
		...state,
		lastCheckAt: obs.at
	};
	const deltaPct = prev && prev.cross !== 0 ? (obs.cross - prev.cross) / prev.cross * 100 : null;
	let kind = "flat";
	if (!prev) kind = "base";
	else if (moved) kind = "move";
	const sample = {
		...obs,
		deltaPct: prev ? deltaPct : null,
		kind
	};
	return {
		lastCheckAt: obs.at,
		samples: [...state.samples, sample].slice(-168)
	};
}
function loadPref() {
	if (typeof localStorage === "undefined") return null;
	try {
		const raw = localStorage.getItem("bolv.pref.v1") ?? localStorage.getItem(LEGACY_PREF_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (!isRecord(parsed)) return null;
		if (typeof parsed.from !== "string" || !isCurrencyCode(parsed.from)) return null;
		if (typeof parsed.to !== "string" || !isCurrencyCode(parsed.to)) return null;
		if (typeof parsed.via !== "string" || !isCurrencyCode(parsed.via)) return null;
		const period = PERIODS.find((p) => p.id === parsed.period);
		if (!period) return null;
		const series = parsed.series === "leg1" || parsed.series === "leg2" || parsed.series === "cross" ? parsed.series : "cross";
		return {
			amountText: (typeof parsed.amountText === "string" ? sanitizeAmount(parsed.amountText) : "1000") || "0",
			from: parsed.from,
			via: parsed.via,
			to: parsed.to,
			secondary: parsed.secondary !== false,
			period: period.id,
			series
		};
	} catch {
		return null;
	}
}
function savePref(pref) {
	try {
		localStorage.setItem(PREF_KEY, JSON.stringify(pref));
	} catch {}
}
var PRESETS = [
	{
		label: "人民币 → 欧元 → 兹罗提",
		from: "CNY",
		via: "EUR",
		to: "PLN",
		secondary: true
	},
	{
		label: "人民币 → 美元 → 欧元",
		from: "CNY",
		via: "USD",
		to: "EUR",
		secondary: true
	},
	{
		label: "美元 → 欧元 → 兹罗提",
		from: "USD",
		via: "EUR",
		to: "PLN",
		secondary: true
	},
	{
		label: "欧元 → 人民币",
		from: "EUR",
		via: "USD",
		to: "CNY",
		secondary: false
	}
];
var AMOUNTS = [
	"100",
	"1000",
	"10000",
	"50000"
];
var fieldClass = "w-full rounded-md border border-line bg-surface px-3 text-base text-ink";
var choiceClass = "inline-flex h-11 items-center justify-center rounded-md border border-line bg-surface px-3 text-sm text-ink";
var choiceOn = "inline-flex h-11 items-center justify-center rounded-md bg-accent px-3 text-sm text-on-accent";
function FxApp() {
	const [amountText, setAmountText] = (0, import_react.useState)("1000");
	const [from, setFrom] = (0, import_react.useState)("CNY");
	const [via, setVia] = (0, import_react.useState)("EUR");
	const [to, setTo] = (0, import_react.useState)("PLN");
	const [secondary, setSecondary] = (0, import_react.useState)(true);
	const [period, setPeriod] = (0, import_react.useState)("1m");
	const [series, setSeries] = (0, import_react.useState)("cross");
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	const [watch, setWatch] = (0, import_react.useState)(EMPTY_WATCH);
	const [now, setNow] = (0, import_react.useState)(null);
	const watchRef = (0, import_react.useRef)(EMPTY_WATCH);
	const amountId = (0, import_react.useId)();
	(0, import_react.useEffect)(() => {
		const pref = loadPref();
		if (pref) {
			setAmountText(pref.amountText);
			setFrom(pref.from);
			setVia(pref.via);
			setTo(pref.to);
			setSecondary(pref.secondary);
			setPeriod(pref.period);
			setSeries(pref.series);
		}
		const stored = loadWatch();
		watchRef.current = stored;
		setWatch(stored);
		setHydrated(true);
		setNow(Date.now());
	}, []);
	(0, import_react.useEffect)(() => {
		if (!hydrated) return;
		savePref({
			amountText,
			from,
			via,
			to,
			secondary,
			period,
			series
		});
	}, [
		hydrated,
		amountText,
		from,
		via,
		to,
		secondary,
		period,
		series
	]);
	(0, import_react.useEffect)(() => {
		if (!secondary) return;
		if (via === from || via === to) setVia(pickVia(from, to));
	}, [
		secondary,
		from,
		to,
		via
	]);
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => setNow(Date.now()), 3e4);
		return () => window.clearInterval(id);
	}, []);
	const amount = parseAmount(amountText);
	const activeVia = secondary ? via : null;
	const days = periodById(period).days;
	const quotes = (0, import_react.useMemo)(() => {
		return [...new Set((activeVia ? [activeVia, to] : [to]).filter((code) => code !== from))];
	}, [
		activeVia,
		to,
		from
	]);
	const latest = useQuery({
		queryKey: ["fx-latest", from],
		enabled: hydrated,
		staleTime: 0,
		refetchOnMount: "always",
		refetchOnWindowFocus: "always",
		refetchInterval: HOUR_MS,
		refetchIntervalInBackground: true,
		queryFn: () => fetchLatest(from)
	});
	const history = useQuery({
		queryKey: [
			"fx-history",
			from,
			quotes.join(","),
			days
		],
		enabled: hydrated && quotes.length > 0,
		staleTime: 0,
		refetchOnMount: "always",
		refetchOnWindowFocus: "always",
		refetchInterval: HOUR_MS,
		queryFn: () => fetchHistory(from, quotes, days)
	});
	const quote = (0, import_react.useMemo)(() => {
		if (!latest.data || latest.data.base !== from) return null;
		return buildQuote({
			rates: latest.data.rates,
			base: latest.data.base,
			amount,
			from,
			via: activeVia,
			to
		});
	}, [
		latest.data,
		amount,
		from,
		activeVia,
		to
	]);
	const signature = quote && latest.data ? [
		latest.dataUpdatedAt,
		latest.data.date,
		pathKey(quote.from, quote.via, quote.to),
		quote.leg1Rate.toFixed(8),
		quote.leg2Rate.toFixed(8),
		quote.crossRate.toFixed(8)
	].join("|") : "";
	(0, import_react.useEffect)(() => {
		if (!hydrated || !quote || !latest.data || !signature) return;
		const next = observe(watchRef.current, {
			at: latest.dataUpdatedAt || Date.now(),
			quoteDate: latest.data.date,
			path: pathKey(quote.from, quote.via, quote.to),
			from: quote.from,
			via: quote.via,
			to: quote.to,
			leg1: quote.leg1Rate,
			leg2: quote.leg2Rate,
			cross: quote.crossRate
		});
		watchRef.current = next;
		saveWatch(next);
		setWatch(next);
	}, [
		hydrated,
		signature,
		quote,
		latest.data,
		latest.dataUpdatedAt
	]);
	(0, import_react.useEffect)(() => {
		const tick = () => {
			const anchor = watchRef.current.lastCheckAt;
			if (anchor === 0 || Date.now() - anchor < 36e5) return;
			latest.refetch();
			history.refetch();
		};
		const id = window.setInterval(tick, 3e4);
		const onVis = () => {
			if (document.visibilityState === "visible") tick();
		};
		document.addEventListener("visibilitychange", onVis);
		return () => {
			window.clearInterval(id);
			document.removeEventListener("visibilitychange", onVis);
		};
	}, [latest.refetch, history.refetch]);
	const mode = !secondary && series !== "cross" ? "cross" : series;
	const points = (0, import_react.useMemo)(() => {
		const rows = history.data?.base === from ? history.data.points : [];
		const next = [];
		for (const row of rows) {
			const rate = seriesRate(row, from, mode, from, activeVia, to);
			if (rate != null) next.push({
				date: row.date,
				rate
			});
		}
		if (next.length === 0 && to === from && mode === "cross") {
			const end = /* @__PURE__ */ new Date();
			const start = /* @__PURE__ */ new Date(end.getTime() - days * 864e5);
			const iso = (date) => date.toISOString().slice(0, 10);
			return [{
				date: iso(start),
				rate: 1
			}, {
				date: iso(end),
				rate: 1
			}];
		}
		return next;
	}, [
		history.data,
		from,
		mode,
		activeVia,
		to,
		days
	]);
	const stats = (0, import_react.useMemo)(() => {
		if (points.length === 0) return null;
		let low = points[0]?.rate ?? 0;
		let high = low;
		for (const point of points) {
			if (point.rate < low) low = point.rate;
			if (point.rate > high) high = point.rate;
		}
		const first = points[0]?.rate ?? 0;
		const last = points[points.length - 1]?.rate ?? 0;
		return {
			first,
			last,
			low,
			high,
			change: percentChange(first, last)
		};
	}, [points]);
	const dayChange = (0, import_react.useMemo)(() => {
		const rows = history.data?.base === from ? history.data.points : [];
		if (rows.length < 2) return null;
		const prev = seriesRate(rows[rows.length - 2], from, "cross", from, activeVia, to);
		const last = seriesRate(rows[rows.length - 1], from, "cross", from, activeVia, to);
		if (prev == null || last == null) return null;
		return percentChange(prev, last);
	}, [
		history.data,
		from,
		activeVia,
		to
	]);
	const currentPath = pathKey(from, activeVia, to);
	const pathSamples = watch.samples.filter((sample) => sample.path === currentPath);
	const lastSample = pathSamples.length > 0 ? pathSamples[pathSamples.length - 1] : void 0;
	const status = statusOf(lastSample);
	const remain = watch.lastCheckAt > 0 && now != null ? watch.lastCheckAt + HOUR_MS - now : null;
	function checkNow() {
		latest.refetch();
		history.refetch();
	}
	function swapEnds() {
		const nextFrom = to;
		const nextTo = from;
		setFrom(nextFrom);
		setTo(nextTo);
		setVia((current) => pickVia(nextFrom, nextTo, current));
	}
	const pairLabel = seriesLabel(mode, secondary, from, activeVia, to);
	const heroSize = quote && formatMoney(quote.finalAmount, quote.to).length > 14 ? "text-4xl" : "text-5xl sm:text-6xl";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-screen bg-bg px-4 pt-8 pb-24 text-ink sm:px-6 sm:pt-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-6xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mb-8 h-1 w-16 bg-accent" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-widest text-accent",
						children: "二次换算 · 打开即查"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 text-5xl text-ink sm:text-6xl",
						children: "波律换算器"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-sm text-sm text-muted",
						children: "先换成中间货币，再换成目标货币。打开页面、切回页面或点立即查询，都会由网页直接向汇率源要最新牌价。"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "lg:col-span-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: PRESETS.map((preset) => {
								const on = preset.from === from && preset.to === to && preset.secondary === secondary && (!preset.secondary || preset.via === via);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: on ? choiceOn : choiceClass,
									onClick: () => {
										setFrom(preset.from);
										setVia(preset.via);
										setTo(preset.to);
										setSecondary(preset.secondary);
										setSeries("cross");
									},
									children: preset.label
								}, preset.label);
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 rounded-lg border border-line bg-surface p-4 sm:p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: amountId,
									className: "text-sm text-muted",
									children: "金额"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: amountId,
										inputMode: "decimal",
										autoComplete: "off",
										value: amountText,
										onChange: (event) => setAmountText(sanitizeAmount(event.target.value)),
										className: `${fieldClass} h-14 font-display text-2xl tabular-nums`
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-14 shrink-0 text-sm font-medium",
										children: from
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 flex flex-wrap gap-2",
									children: AMOUNTS.map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: amountText === value ? choiceOn : choiceClass,
										onClick: () => setAmountText(value),
										children: formatMoney(Number(value), from)
									}, value))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-5 grid gap-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CurrencySelect, {
											label: "从",
											value: from,
											onChange: setFrom
										}),
										secondary ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CurrencySelect, {
											label: "中间货币",
											value: via,
											onChange: setVia,
											disabledCodes: [from, to]
										}) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CurrencySelect, {
											label: "到",
											value: to,
											onChange: setTo
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-pressed": secondary,
										className: secondary ? choiceOn : choiceClass,
										onClick: () => setSecondary((on) => !on),
										children: secondary ? "二次换算已开启" : "开启二次换算"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: choiceClass,
										onClick: swapEnds,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeftRight, {
											className: "size-4",
											"aria-hidden": "true"
										}), "对调首尾"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-5 border-t border-dashed border-line pt-5",
									"aria-live": "polite",
									children: latest.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, {
										message: messageOf(latest.error),
										onRetry: checkNow
									}) : !quote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted",
										children: latest.isPending ? "正在核对牌价…" : "这一对货币暂时没有牌价。"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, {
										quote,
										heroSize,
										secondary
									})
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "min-w-0 lg:col-span-7",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-end justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-3xl text-ink",
									children: "走势"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted",
									children: pairLabel
								})] }), secondary ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeriesButton, {
											current: mode,
											id: "leg1",
											label: "第一段",
											onPick: setSeries
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeriesButton, {
											current: mode,
											id: "leg2",
											label: "第二段",
											onPick: setSeries
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeriesButton, {
											current: mode,
											id: "cross",
											label: "合成",
											onPick: setSeries
										})
									]
								}) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 flex flex-wrap gap-2",
								children: PERIODS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: item.id === period ? choiceOn : choiceClass,
									onClick: () => setPeriod(item.id),
									children: item.label
								}, item.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4",
								children: history.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, {
									message: messageOf(history.error),
									onRetry: () => void history.refetch()
								}) : points.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex h-56 items-center text-sm text-muted sm:h-72",
									children: history.isPending || !hydrated ? "正在读取走势…" : "这个周期没有交易日牌价。"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RateChart, {
									points,
									period,
									tone: stats && stats.change != null && stats.change < 0 ? "down" : stats?.change === 0 ? "flat" : "up"
								})
							}),
							stats ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
										label: "期初",
										value: formatRate(stats.first)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
										label: "期末",
										value: formatRate(stats.last)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
										label: "区间涨跌",
										value: formatPct(stats.change),
										tone: toneOf(stats.change)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
										label: "最高",
										value: formatRate(stats.high)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
										label: "最低",
										value: formatRate(stats.low)
									})
								]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-xs text-muted",
								children: "折线按汇率源返回的牌价日连接。每次打开都会重新请求，不使用本机缓存的旧牌价。"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-12 border-t border-line pt-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-end justify-between gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-3xl text-ink",
								children: "波动核对"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 max-w-xl text-sm text-muted",
								children: "打开、切回或点立即查询都会马上拉一次。页面一直开着时，仍按一小时再记一笔：没变是平稳，变了才是波动。记录只留在这台设备上。"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: choiceClass,
								onClick: checkNow,
								disabled: latest.isFetching,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
									className: `size-4 ${latest.isFetching ? "motion-safe:animate-spin" : ""}`,
									"aria-hidden": "true"
								}), "立即查询"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 grid gap-4 sm:grid-cols-3",
							role: "status",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusCard, {
									label: "当前状态",
									value: status.label,
									tone: status.tone,
									icon: status.icon,
									detail: !lastSample ? "尚未建立基线" : lastSample.kind === "base" ? "这是这一路径的第一笔" : `相对上一笔 ${formatPct(lastSample.deltaPct)}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusCard, {
									label: "下次整点记录",
									value: remain == null ? "等待首次查询" : formatRemain(remain),
									tone: "flat",
									icon: "clock",
									detail: watch.lastCheckAt > 0 && now != null ? `上次查询 ${formatShanghai(watch.lastCheckAt)} 北京时间` : "打开后会立即查询"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusCard, {
									label: "合成汇率较上一交易日",
									value: formatPct(dayChange),
									tone: toneOf(dayChange),
									icon: toneOf(dayChange) === "down" ? "down" : toneOf(dayChange) === "up" ? "up" : "flat",
									detail: latest.data ? `牌价日 ${latest.data.date}` : "牌价日尚未返回"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "mt-6 divide-y divide-line border-y border-line",
							children: pathSamples.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "py-4 text-sm text-muted",
								children: "这一路径还没有核对记录。"
							}) : [...pathSamples].reverse().slice(0, 8).map((sample) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex flex-wrap items-baseline justify-between gap-2 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-sm text-ink",
									children: [kindLabel(sample.kind), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "ml-3 text-muted",
										children: [formatShanghai(sample.at), " 北京时间"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: `font-display text-lg tabular-nums ${toneClass(toneOf(sample.deltaPct))}`,
									children: [sample.kind === "base" ? "基线" : formatPct(sample.deltaPct), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "ml-3 font-sans text-sm text-muted",
										children: ["牌价日 ", sample.quoteDate]
									})]
								})]
							}, `${sample.path}-${sample.at}`))
						})
					]
				})
			]
		})
	});
}
function Receipt({ quote, heroSize, secondary }) {
	const from = currencyOf(quote.from);
	const to = currencyOf(quote.to);
	const via = quote.via ? currencyOf(quote.via) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		secondary && via ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
			className: "grid gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leg, {
				index: "01",
				title: `第一段 · ${from.name} → ${via.name}`,
				amount: formatMoney(quote.midAmount, via.code),
				unit: via.name,
				rate: `1 ${from.code} = ${formatRate(quote.leg1Rate)} ${via.code}`
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leg, {
				index: "02",
				title: `第二段 · ${via.name} → ${to.name}`,
				amount: formatMoney(quote.finalAmount, to.code),
				unit: to.name,
				rate: `1 ${via.code} = ${formatRate(quote.leg2Rate)} ${to.code}`
			})]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-5 text-sm text-muted",
			children: "到手"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: `font-display tabular-nums text-ink ${heroSize}`,
			children: formatMoney(quote.finalAmount, to.code)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-1 text-sm text-muted",
			children: [
				to.name,
				" ",
				to.symbol
			]
		}),
		secondary ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-4 text-sm text-muted",
			children: [
				formatMoney(quote.amount, quote.from),
				" × ",
				formatRate(quote.leg1Rate),
				" × ",
				formatRate(quote.leg2Rate),
				"。 直接交叉同样是 1 ",
				from.code,
				" = ",
				formatRate(quote.crossRate),
				" ",
				to.code,
				"，中价没有点差，两段连乘与直接换算一致。"
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-4 text-sm text-muted",
			children: [
				"1 ",
				from.code,
				" = ",
				formatRate(quote.crossRate),
				" ",
				to.code,
				"。需要接力时再打开二次换算。"
			]
		})
	] });
}
function Leg({ index, title, amount, unit, rate }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "grid grid-cols-[2.5rem_1fr] gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-display text-lg text-muted",
			children: index
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-display text-3xl tabular-nums text-ink",
					children: [amount, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2 font-sans text-sm text-muted",
						children: unit
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm tabular-nums text-muted",
					children: rate
				})
			]
		})]
	});
}
function CurrencySelect({ label, value, onChange, disabledCodes = [] }) {
	const id = (0, import_react.useId)();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		htmlFor: id,
		className: "text-sm text-muted",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative mt-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
			id,
			value,
			onChange: (event) => onChange(event.target.value),
			className: `${fieldClass} h-12 appearance-none pr-10`,
			children: CURRENCIES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
				value: item.code,
				disabled: disabledCodes.includes(item.code),
				children: [
					item.name,
					" · ",
					item.code
				]
			}, item.code))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
			className: "pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted",
			"aria-hidden": "true"
		})]
	})] });
}
function SeriesButton({ current, id, label, onPick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: current === id ? choiceOn : choiceClass,
		onClick: () => onPick(id),
		children: label
	});
}
function Stat({ label, value, tone = "flat" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-xs text-muted",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: `mt-1 font-display text-xl tabular-nums ${toneClass(tone)}`,
		children: value
	})] });
}
function StatusCard({ label, value, detail, tone, icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `rounded-lg border border-line px-4 py-3 ${tone === "up" ? "bg-accent-soft text-accent" : tone === "down" ? "bg-down-soft text-down" : "bg-surface text-ink"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-2 text-xs text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(icon === "up" ? TrendingUp : icon === "down" ? TrendingDown : icon === "clock" ? Clock : Minus, {
					className: "size-4",
					"aria-hidden": "true"
				}), label]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-display text-2xl",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted",
				children: detail
			})
		]
	});
}
function ErrorNote({ message, onRetry }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-down",
			children: message
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: choiceClass,
			onClick: onRetry,
			children: "重试"
		})]
	});
}
function statusOf(sample) {
	if (!sample || sample.kind === "base" || sample.deltaPct == null) return {
		label: "建立基线",
		tone: "flat",
		icon: "flat"
	};
	if (sample.kind === "flat" || Math.abs(sample.deltaPct) < 1e-4) return {
		label: "平稳",
		tone: "flat",
		icon: "flat"
	};
	if (sample.deltaPct > 0) return {
		label: "上浮",
		tone: "up",
		icon: "up"
	};
	return {
		label: "下探",
		tone: "down",
		icon: "down"
	};
}
function toneOf(n) {
	if (n == null || Math.abs(n) < 1e-4) return "flat";
	return n > 0 ? "up" : "down";
}
function toneClass(tone) {
	if (tone === "up") return "text-accent";
	if (tone === "down") return "text-down";
	return "text-ink";
}
function kindLabel(kind) {
	if (kind === "base") return "基线";
	if (kind === "move") return "波动";
	return "整点核对";
}
function seriesLabel(mode, secondary, from, via, to) {
	const fromName = currencyOf(from).name;
	const toName = currencyOf(to).name;
	if (!secondary || mode === "cross" || !via) return `${fromName} → ${toName}`;
	const viaName = currencyOf(via).name;
	if (mode === "leg1") return `${fromName} → ${viaName}`;
	return `${viaName} → ${toName}`;
}
function messageOf(error) {
	if (error instanceof Error && error.message) return error.message;
	return "核对失败，请再试一次";
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FxApp, {});
}
//#endregion
export { Home as component };
