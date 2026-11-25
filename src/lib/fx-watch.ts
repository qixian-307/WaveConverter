import {
  HOUR_MS,
  PERIODS,
  isCurrencyCode,
  rateMoved,
  sanitizeAmount,
  type PeriodId,
  type SeriesMode,
} from "@/lib/fx";

export const WATCH_KEY = "bolv.watch.v1";
export const PREF_KEY = "bolv.pref.v1";
const LEGACY_WATCH_KEY = "liangduanhui.watch.v1";
const LEGACY_PREF_KEY = "liangduanhui.pref.v1";

export type WatchSample = {
  at: number;
  quoteDate: string;
  path: string;
  from: string;
  via: string | null;
  to: string;
  leg1: number;
  leg2: number;
  cross: number;
  deltaPct: number | null;
  kind: "base" | "move" | "flat";
};

export type WatchState = {
  lastCheckAt: number;
  samples: WatchSample[];
};

export const EMPTY_WATCH: WatchState = { lastCheckAt: 0, samples: [] };

export type Pref = {
  amountText: string;
  from: string;
  via: string;
  to: string;
  secondary: boolean;
  period: PeriodId;
  series: SeriesMode;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function asSample(row: unknown): WatchSample | null {
  if (!isRecord(row)) return null;
  if (typeof row.at !== "number" || typeof row.quoteDate !== "string") return null;
  if (typeof row.path !== "string" || typeof row.from !== "string" || typeof row.to !== "string") {
    return null;
  }
  if (typeof row.leg1 !== "number" || typeof row.leg2 !== "number" || typeof row.cross !== "number") {
    return null;
  }
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
    kind,
  };
}

export function loadWatch(): WatchState {
  if (typeof localStorage === "undefined") return EMPTY_WATCH;
  try {
    const raw = localStorage.getItem(WATCH_KEY) ?? localStorage.getItem(LEGACY_WATCH_KEY);
    if (!raw) return EMPTY_WATCH;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !Array.isArray(parsed.samples)) return EMPTY_WATCH;
    const samples: WatchSample[] = [];
    for (const row of parsed.samples) {
      const sample = asSample(row);
      if (sample) samples.push(sample);
    }
    return {
      lastCheckAt: typeof parsed.lastCheckAt === "number" ? parsed.lastCheckAt : 0,
      samples: samples.slice(-168),
    };
  } catch {
    return EMPTY_WATCH;
  }
}

export function saveWatch(state: WatchState) {
  try {
    localStorage.setItem(WATCH_KEY, JSON.stringify(state));
  } catch {
    /* private mode or a full disk — the live view still works */
  }
}

export type Observation = {
  at: number;
  quoteDate: string;
  path: string;
  from: string;
  via: string | null;
  to: string;
  leg1: number;
  leg2: number;
  cross: number;
};

export function observe(state: WatchState, obs: Observation): WatchState {
  const same = state.samples.filter((s) => s.path === obs.path);
  const prev = same.length > 0 ? same[same.length - 1] : undefined;
  const moved = prev
    ? rateMoved(prev.cross, obs.cross) || rateMoved(prev.leg1, obs.leg1) || rateMoved(prev.leg2, obs.leg2)
    : false;
  const dateChanged = prev ? prev.quoteDate !== obs.quoteDate : false;
  const recentDup = Boolean(
    prev && !moved && !dateChanged && obs.at - prev.at < 2 * 60 * 1000,
  );
  if (recentDup) return { ...state, lastCheckAt: obs.at };

  const hourAdvanced = prev
    ? Math.floor(obs.at / HOUR_MS) !== Math.floor(prev.at / HOUR_MS)
    : false;
  const shouldAppend = !prev || moved || dateChanged || hourAdvanced;
  if (!shouldAppend) return { ...state, lastCheckAt: obs.at };

  const deltaPct = prev && prev.cross !== 0 ? ((obs.cross - prev.cross) / prev.cross) * 100 : null;
  let kind: WatchSample["kind"] = "flat";
  if (!prev) kind = "base";
  else if (moved) kind = "move";
  const sample: WatchSample = { ...obs, deltaPct: prev ? deltaPct : null, kind };
  return {
    lastCheckAt: obs.at,
    samples: [...state.samples, sample].slice(-168),
  };
}

export function loadPref(): Pref | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(PREF_KEY) ?? localStorage.getItem(LEGACY_PREF_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    if (typeof parsed.from !== "string" || !isCurrencyCode(parsed.from)) return null;
    if (typeof parsed.to !== "string" || !isCurrencyCode(parsed.to)) return null;
    if (typeof parsed.via !== "string" || !isCurrencyCode(parsed.via)) return null;
    const period = PERIODS.find((p) => p.id === parsed.period);
    if (!period) return null;
    const series: SeriesMode =
      parsed.series === "leg1" ||
      parsed.series === "leg2" ||
      parsed.series === "cross" ||
      parsed.series === "gap"
        ? parsed.series
        : "cross";
    const amountText = typeof parsed.amountText === "string" ? sanitizeAmount(parsed.amountText) : "1000";
    return {
      amountText: amountText || "0",
      from: parsed.from,
      via: parsed.via,
      to: parsed.to,
      secondary: parsed.secondary !== false,
      period: period.id,
      series,
    };
  } catch {
    return null;
  }
}

export function savePref(pref: Pref) {
  try {
    localStorage.setItem(PREF_KEY, JSON.stringify(pref));
  } catch {
    /* ignore quota */
  }
}
