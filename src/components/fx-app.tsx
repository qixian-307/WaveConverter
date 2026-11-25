import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftRight, ChevronDown, Clock, Minus, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { RateChart, type ChartPoint } from "@/components/rate-chart";
import {
  CURRENCIES,
  HOUR_MS,
  PERIODS,
  buildQuote,
  comparePaths,
  currencyOf,
  factorOnDate,
  fetchHistory,
  fetchLatest,
  formatBps,
  formatFactor,
  formatMoney,
  formatPct,
  formatRate,
  formatRemain,
  formatShanghai,
  parseAmount,
  pathKey,
  percentChange,
  periodById,
  pickVia,
  sanitizeAmount,
  seriesRate,
  unitRate,
  type PeriodId,
  type SeriesMode,
} from "@/lib/fx";
import {
  EMPTY_WATCH,
  loadPref,
  loadWatch,
  observe,
  savePref,
  saveWatch,
  type WatchSample,
  type WatchState,
} from "@/lib/fx-watch";

const PRESETS = [
  { label: "人民币 → 欧元 → 兹罗提", from: "CNY", via: "EUR", to: "PLN", secondary: true },
  { label: "人民币 → 美元 → 欧元", from: "CNY", via: "USD", to: "EUR", secondary: true },
  { label: "美元 → 欧元 → 兹罗提", from: "USD", via: "EUR", to: "PLN", secondary: true },
  { label: "欧元 → 人民币", from: "EUR", via: "USD", to: "CNY", secondary: false },
] as const;

const AMOUNTS = ["100", "1000", "10000", "50000"];

const fieldClass =
  "w-full rounded-md border border-line bg-surface px-3 text-base text-ink";
const choiceClass =
  "inline-flex h-11 items-center justify-center rounded-md border border-line bg-surface px-3 text-sm text-ink";
const choiceOn = "inline-flex h-11 items-center justify-center rounded-md bg-accent px-3 text-sm text-on-accent";

export function FxApp() {
  const [amountText, setAmountText] = useState("1000");
  const [from, setFrom] = useState("CNY");
  const [via, setVia] = useState("EUR");
  const [to, setTo] = useState("PLN");
  const [secondary, setSecondary] = useState(true);
  const [period, setPeriod] = useState<PeriodId>("1m");
  const [series, setSeries] = useState<SeriesMode>("cross");
  const [hydrated, setHydrated] = useState(false);
  const [watch, setWatch] = useState<WatchState>(EMPTY_WATCH);
  const [now, setNow] = useState<number | null>(null);
  const watchRef = useRef<WatchState>(EMPTY_WATCH);
  const amountId = useId();

  useEffect(() => {
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

  useEffect(() => {
    if (!hydrated) return;
    savePref({ amountText, from, via, to, secondary, period, series });
  }, [hydrated, amountText, from, via, to, secondary, period, series]);

  useEffect(() => {
    if (!secondary) return;
    if (via === from || via === to) setVia(pickVia(from, to));
  }, [secondary, from, to, via]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const amount = parseAmount(amountText);
  const activeVia = secondary ? via : null;
  const days = periodById(period).days;
  const quotes = useMemo(() => {
    const codes = activeVia ? [activeVia, to] : [to];
    return [...new Set(codes.filter((code) => code !== from))];
  }, [activeVia, to, from]);

  const latest = useQuery({
    queryKey: ["fx-latest", from],
    enabled: hydrated,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchInterval: HOUR_MS,
    refetchIntervalInBackground: true,
    queryFn: () => fetchLatest(from),
  });

  const history = useQuery({
    queryKey: ["fx-history", from, quotes.join(","), days],
    enabled: hydrated && quotes.length > 0,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchInterval: HOUR_MS,
    queryFn: () => fetchHistory(from, quotes, days),
  });

  const viaReady = secondary && via !== from && via !== to;
  const viaLatest = useQuery({
    queryKey: ["fx-latest", via],
    enabled: hydrated && viaReady,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchInterval: HOUR_MS,
    refetchIntervalInBackground: true,
    queryFn: () => fetchLatest(via),
  });

  const viaHistory = useQuery({
    queryKey: ["fx-history", via, to, days],
    enabled: hydrated && viaReady,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchInterval: HOUR_MS,
    queryFn: () => fetchHistory(via, [to], days),
  });

  const quote = useMemo(() => {
    if (!latest.data || latest.data.base !== from) return null;
    return buildQuote({
      rates: latest.data.rates,
      viaRates: viaReady && viaLatest.data?.base === via ? viaLatest.data.rates : null,
      base: latest.data.base,
      amount,
      from,
      via: activeVia,
      to,
    });
  }, [latest.data, viaLatest.data, viaReady, via, amount, from, activeVia, to]);

  const signature =
    quote && latest.data
      ? [
          latest.dataUpdatedAt,
          latest.data.date,
          pathKey(quote.from, quote.via, quote.to),
          quote.leg1Rate.toFixed(8),
          quote.leg2Rate.toFixed(8),
          quote.crossRate.toFixed(8),
        ].join("|")
      : "";

  useEffect(() => {
    if (!hydrated || !quote || !latest.data || !signature) return;
    if (viaReady && !viaLatest.isFetched) return;
    const next = observe(watchRef.current, {
      at: latest.dataUpdatedAt || Date.now(),
      quoteDate: latest.data.date,
      path: pathKey(quote.from, quote.via, quote.to),
      from: quote.from,
      via: quote.via,
      to: quote.to,
      leg1: quote.leg1Rate,
      leg2: quote.leg2Rate,
      cross: quote.crossRate,
    });
    watchRef.current = next;
    saveWatch(next);
    setWatch(next);
  }, [hydrated, signature, quote, latest.data, latest.dataUpdatedAt, viaReady, viaLatest.isFetched]);

  useEffect(() => {
    const tick = () => {
      const anchor = watchRef.current.lastCheckAt;
      if (anchor === 0 || Date.now() - anchor < HOUR_MS) return;
      void latest.refetch();
      void history.refetch();
      if (viaReady) {
        void viaLatest.refetch();
        void viaHistory.refetch();
      }
    };
    const id = window.setInterval(tick, 30_000);
    const onVis = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [latest.refetch, history.refetch, viaLatest.refetch, viaHistory.refetch, viaReady]);

  const mode: SeriesMode = !secondary && series !== "cross" ? "cross" : series;
  const points = useMemo(() => {
    const rows = history.data?.base === from ? history.data.points : [];
    if (mode === "gap" && activeVia) {
      const viaRows = viaHistory.data?.base === activeVia ? viaHistory.data.points : [];
      const viaByDate = new Map(viaRows.map((row) => [row.date, row]));
      const next: ChartPoint[] = [];
      for (const row of rows) {
        const rate = factorOnDate(row, viaByDate.get(row.date), from, activeVia, to);
        if (rate != null) next.push({ date: row.date, rate });
      }
      return next;
    }
    if (mode === "leg2" && activeVia && viaHistory.data?.base === activeVia) {
      const next: ChartPoint[] = [];
      for (const row of viaHistory.data.points) {
        const rate = unitRate(row.rates, activeVia, to);
        if (rate != null) next.push({ date: row.date, rate });
      }
      if (next.length > 0) return next;
    }
    const next: ChartPoint[] = [];
    for (const row of rows) {
      const rate = seriesRate(row, from, mode, from, activeVia, to);
      if (rate != null) next.push({ date: row.date, rate });
    }
    if (next.length === 0 && to === from && mode === "cross") {
      const end = new Date();
      const start = new Date(end.getTime() - days * 86_400_000);
      const iso = (date: Date) => date.toISOString().slice(0, 10);
      return [
        { date: iso(start), rate: 1 },
        { date: iso(end), rate: 1 },
      ];
    }
    return next;
  }, [history.data, viaHistory.data, from, mode, activeVia, to, days]);

  const stats = useMemo(() => {
    if (points.length === 0) return null;
    let low = points[0]?.rate ?? 0;
    let high = low;
    for (const point of points) {
      if (point.rate < low) low = point.rate;
      if (point.rate > high) high = point.rate;
    }
    const first = points[0]?.rate ?? 0;
    const last = points[points.length - 1]?.rate ?? 0;
    return { first, last, low, high, change: percentChange(first, last) };
  }, [points]);

  const dayChange = useMemo(() => {
    const rows = history.data?.base === from ? history.data.points : [];
    if (rows.length < 2) return null;
    const prev = seriesRate(rows[rows.length - 2]!, from, "cross", from, activeVia, to);
    const last = seriesRate(rows[rows.length - 1]!, from, "cross", from, activeVia, to);
    if (prev == null || last == null) return null;
    return percentChange(prev, last);
  }, [history.data, from, activeVia, to]);

  const currentPath = pathKey(from, activeVia, to);
  const pathSamples = watch.samples.filter((sample) => sample.path === currentPath);
  const lastSample = pathSamples.length > 0 ? pathSamples[pathSamples.length - 1] : undefined;
  const status = statusOf(lastSample);
  const remain = watch.lastCheckAt > 0 && now != null ? watch.lastCheckAt + HOUR_MS - now : null;

  function checkNow() {
    void latest.refetch();
    void history.refetch();
    if (viaReady) {
      void viaLatest.refetch();
      void viaHistory.refetch();
    }
  }

  function swapEnds() {
    const nextFrom = to;
    const nextTo = from;
    setFrom(nextFrom);
    setTo(nextTo);
    setVia((current) => pickVia(nextFrom, nextTo, current));
  }

  const publishedLeg2 =
    viaReady && viaLatest.data?.base === via ? unitRate(viaLatest.data.rates, via, to) : null;
  const compare =
    secondary && quote?.via && publishedLeg2 != null
      ? comparePaths(quote.crossRate, quote.leg1Rate, publishedLeg2, quote.amount, quote.via, quote.to)
      : null;
  const viaBookReady = publishedLeg2 != null;
  const heroAmount = quote ? (viaBookReady && compare ? compare.chainAmount : quote.finalAmount) : 0;
  const heroSize =
    quote && formatMoney(heroAmount, quote.to).length > 14 ? "text-4xl" : "text-5xl sm:text-6xl";
  const pairLabel = seriesLabel(mode, secondary, from, activeVia, to);

  return (
    <main className="min-h-screen bg-bg px-4 pt-8 pb-24 text-ink sm:px-6 sm:pt-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 h-1 w-16 bg-accent" />
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium tracking-widest text-accent">二次换算 · 打开即查</p>
            <h1 className="mt-2 text-5xl text-ink sm:text-6xl">波律换算器</h1>
          </div>
          <p className="max-w-sm text-sm text-muted">
            先换成中间货币，再换成目标货币。打开页面、切回页面或点立即查询，都会由网页直接向汇率源要最新牌价。
          </p>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <section className="lg:col-span-5">
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => {
                const on =
                  preset.from === from &&
                  preset.to === to &&
                  preset.secondary === secondary &&
                  (!preset.secondary || preset.via === via);
                return (
                  <button
                    key={preset.label}
                    type="button"
                    className={on ? choiceOn : choiceClass}
                    onClick={() => {
                      setFrom(preset.from);
                      setVia(preset.via);
                      setTo(preset.to);
                      setSecondary(preset.secondary);
                      setSeries("cross");
                    }}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-lg border border-line bg-surface p-4 sm:p-5">
              <label htmlFor={amountId} className="text-sm text-muted">
                金额
              </label>
              <div className="mt-1 flex items-center gap-3">
                <input
                  id={amountId}
                  inputMode="decimal"
                  autoComplete="off"
                  value={amountText}
                  onChange={(event) => setAmountText(sanitizeAmount(event.target.value))}
                  className={`${fieldClass} h-14 font-display text-2xl tabular-nums`}
                />
                <span className="w-14 shrink-0 text-sm font-medium">{from}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {AMOUNTS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={amountText === value ? choiceOn : choiceClass}
                    onClick={() => setAmountText(value)}
                  >
                    {formatMoney(Number(value), from)}
                  </button>
                ))}
              </div>

              <div className="mt-5 grid gap-4">
                <CurrencySelect label="从" value={from} onChange={setFrom} />
                {secondary ? (
                  <CurrencySelect
                    label="中间货币"
                    value={via}
                    onChange={setVia}
                    disabledCodes={[from, to]}
                  />
                ) : null}
                <CurrencySelect label="到" value={to} onChange={setTo} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  aria-pressed={secondary}
                  className={secondary ? choiceOn : choiceClass}
                  onClick={() => setSecondary((on) => !on)}
                >
                  {secondary ? "二次换算已开启" : "开启二次换算"}
                </button>
                <button type="button" className={choiceClass} onClick={swapEnds}>
                  <ArrowLeftRight className="size-4" aria-hidden="true" />
                  对调首尾
                </button>
              </div>

              <div className="mt-5 border-t border-dashed border-line pt-5" aria-live="polite">
                {latest.isError ? (
                  <ErrorNote
                    message={messageOf(latest.error)}
                    onRetry={checkNow}
                  />
                ) : !quote ? (
                  <p className="text-sm text-muted">
                    {latest.isPending ? "正在核对牌价…" : "这一对货币暂时没有牌价。"}
                  </p>
                ) : (
                  <Receipt
                    quote={quote}
                    heroSize={heroSize}
                    secondary={secondary}
                    compare={viaBookReady ? compare : null}
                    viaPending={secondary && !viaBookReady && !viaLatest.isError}
                    viaError={secondary && viaLatest.isError ? messageOf(viaLatest.error) : null}
                    onRetry={checkNow}
                  />
                )}
              </div>
            </div>
          </section>

          <section className="min-w-0 lg:col-span-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-3xl text-ink">走势</h2>
                <p className="mt-1 text-sm text-muted">{pairLabel}</p>
              </div>
              {secondary ? (
                <div className="flex flex-wrap gap-2">
                  <SeriesButton current={mode} id="leg1" label="第一段" onPick={setSeries} />
                  <SeriesButton current={mode} id="leg2" label="第二段" onPick={setSeries} />
                  <SeriesButton current={mode} id="cross" label="直接" onPick={setSeries} />
                  <SeriesButton current={mode} id="gap" label="比对" onPick={setSeries} />
                </div>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {PERIODS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={item.id === period ? choiceOn : choiceClass}
                  onClick={() => setPeriod(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-4">
              {history.isError ? (
                <ErrorNote message={messageOf(history.error)} onRetry={() => void history.refetch()} />
              ) : points.length === 0 ? (
                <div className="flex h-56 items-center text-sm text-muted sm:h-72">
                  {history.isPending ||
                  ((mode === "gap" || mode === "leg2") && viaHistory.isPending) ||
                  !hydrated
                    ? "正在读取走势…"
                    : mode === "gap" && viaHistory.isError
                      ? messageOf(viaHistory.error)
                      : "这个周期没有交易日牌价。"}
                </div>
              ) : (
                <RateChart
                  points={points}
                  period={period}
                  tone={stats && stats.change != null && stats.change < 0 ? "down" : stats?.change === 0 ? "flat" : "up"}
                />
              )}
            </div>

            {stats ? (
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-5">
                <Stat label={mode === "gap" ? "期初因素" : "期初"} value={mode === "gap" ? formatFactor(stats.first) : formatRate(stats.first)} />
                <Stat label={mode === "gap" ? "期末因素" : "期末"} value={mode === "gap" ? formatFactor(stats.last) : formatRate(stats.last)} />
                <Stat
                  label={mode === "gap" ? "区间基点" : "区间涨跌"}
                  value={mode === "gap" ? formatBps((stats.last - stats.first) * 10_000) : formatPct(stats.change)}
                  tone={toneOf(mode === "gap" ? (stats.last - stats.first) * 10_000 : stats.change)}
                />
                <Stat label="最高" value={mode === "gap" ? formatFactor(stats.high) : formatRate(stats.high)} />
                <Stat label="最低" value={mode === "gap" ? formatFactor(stats.low) : formatRate(stats.low)} />
              </dl>
            ) : null}
            <p className="mt-3 text-xs text-muted">
              {mode === "gap"
                ? "比对因素 = 两段公布牌价连乘 ÷ 直接牌价。大于 1 表示走两段更贵。按两边牌价日对齐。"
                : "折线按汇率源返回的牌价日连接。每次打开都会重新请求，不使用本机缓存的旧牌价。"}
            </p>
          </section>
        </div>

        <section className="mt-12 border-t border-line pt-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl text-ink">波动核对</h2>
              <p className="mt-1 max-w-xl text-sm text-muted">
                打开、切回或点立即查询都会马上拉一次。页面一直开着时，仍按一小时再记一笔：没变是平稳，变了才是波动。记录只留在这台设备上。
              </p>
            </div>
            <button
              type="button"
              className={choiceClass}
              onClick={checkNow}
              disabled={latest.isFetching}
            >
              <RefreshCw className={`size-4 ${latest.isFetching ? "motion-safe:animate-spin" : ""}`} aria-hidden="true" />
              立即查询
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3" role="status">
            <StatusCard
              label="当前状态"
              value={status.label}
              tone={status.tone}
              icon={status.icon}
              detail={
                !lastSample
                  ? "尚未建立基线"
                  : lastSample.kind === "base"
                    ? "这是这一路径的第一笔"
                    : `相对上一笔 ${formatPct(lastSample.deltaPct)}`
              }
            />
            <StatusCard
              label="下次整点记录"
              value={remain == null ? "等待首次查询" : formatRemain(remain)}
              tone="flat"
              icon="clock"
              detail={
                watch.lastCheckAt > 0 && now != null
                  ? `上次查询 ${formatShanghai(watch.lastCheckAt)} 北京时间`
                  : "打开后会立即查询"
              }
            />
            <StatusCard
              label="直接汇率较上一交易日"
              value={formatPct(dayChange)}
              tone={toneOf(dayChange)}
              icon={toneOf(dayChange) === "down" ? "down" : toneOf(dayChange) === "up" ? "up" : "flat"}
              detail={latest.data ? `牌价日 ${latest.data.date}` : "牌价日尚未返回"}
            />
          </div>

          <ol className="mt-6 divide-y divide-line border-y border-line">
            {pathSamples.length === 0 ? (
              <li className="py-4 text-sm text-muted">这一路径还没有核对记录。</li>
            ) : (
              [...pathSamples].reverse().slice(0, 8).map((sample) => (
                <li key={`${sample.path}-${sample.at}`} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                  <span className="text-sm text-ink">
                    {kindLabel(sample.kind)}
                    <span className="ml-3 text-muted">{formatShanghai(sample.at)} 北京时间</span>
                  </span>
                  <span className={`font-display text-lg tabular-nums ${toneClass(toneOf(sample.deltaPct))}`}>
                    {sample.kind === "base" ? "基线" : formatPct(sample.deltaPct)}
                    <span className="ml-3 font-sans text-sm text-muted">牌价日 {sample.quoteDate}</span>
                  </span>
                </li>
              ))
            )}
          </ol>
        </section>
      </div>
    </main>
  );
}

function Receipt({
  quote,
  heroSize,
  secondary,
  compare,
  viaPending,
  viaError,
  onRetry,
}: {
  quote: NonNullable<ReturnType<typeof buildQuote>>;
  heroSize: string;
  secondary: boolean;
  compare: ReturnType<typeof comparePaths>;
  viaPending: boolean;
  viaError: string | null;
  onRetry: () => void;
}) {
  const from = currencyOf(quote.from);
  const to = currencyOf(quote.to);
  const via = quote.via ? currencyOf(quote.via) : null;
  const priced = Boolean(compare);
  const hero = compare ? compare.chainAmount : quote.finalAmount;
  return (
    <div>
      {secondary && via ? (
        <ol className="grid gap-4">
          <Leg
            index="01"
            title={`第一段 · ${from.name} → ${via.name}`}
            amount={formatMoney(quote.midAmount, via.code)}
            unit={via.name}
            rate={`1 ${from.code} = ${formatRate(quote.leg1Rate)} ${via.code}`}
          />
          <Leg
            index="02"
            title={`第二段 · ${via.name} → ${to.name}`}
            amount={priced ? formatMoney(hero, to.code) : "—"}
            unit={to.name}
            rate={
              priced
                ? `1 ${via.code} = ${formatRate(quote.leg2Rate)} ${to.code}`
                : viaError
                  ? "这一段牌价没有取到"
                  : "正在读取这一段自己的公布牌价"
            }
          />
        </ol>
      ) : null}
      <p className="mt-5 text-sm text-muted">{secondary ? "两段到手" : "到手"}</p>
      <p className={`font-display tabular-nums text-ink ${heroSize}`}>
        {secondary && !priced ? "…" : formatMoney(secondary ? hero : quote.finalAmount, to.code)}
      </p>
      <p className="mt-1 text-sm text-muted">
        {to.name} {to.symbol}
      </p>
      {secondary && via ? (
        compare ? (
          <Compare compare={compare} from={from.code} via={via.code} to={to.code} />
        ) : viaError ? (
          <div className="mt-4">
            <ErrorNote message={viaError} onRetry={onRetry} />
          </div>
        ) : viaPending ? (
          <p className="mt-4 text-sm text-muted">正在取中间货币自己的牌价，用来和直接换算比对。</p>
        ) : (
          <p className="mt-4 text-sm text-muted">这一段暂时对不上直接牌价。</p>
        )
      ) : (
        <p className="mt-4 text-sm text-muted">
          1 {from.code} = {formatRate(quote.crossRate)} {to.code}。打开二次换算后，会和两段路径做价格比对。
        </p>
      )}
    </div>
  );
}

function Compare({
  compare,
  from,
  via,
  to,
}: {
  compare: NonNullable<ReturnType<typeof comparePaths>>;
  from: string;
  via: string;
  to: string;
}) {
  const lean =
    compare.cashGap > 0 ? "两段到手更高" : compare.cashGap < 0 ? "直接到手更高" : "四舍五入后到手相同";
  return (
    <div className="mt-5 border-t border-dashed border-line pt-4">
      <p className="text-sm text-muted">直接与二次比对</p>
      <dl className="mt-3 grid grid-cols-2 gap-4">
        <div>
          <dt className="text-xs text-muted">直接换算</dt>
          <dd className="mt-1 font-display text-2xl tabular-nums text-ink">
            {formatMoney(compare.directAmount, to)}
          </dd>
          <dd className="mt-1 text-xs tabular-nums text-muted">
            1 {from} = {formatRate(compare.directRate)} {to}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">二次换算</dt>
          <dd className="mt-1 font-display text-2xl tabular-nums text-ink">
            {formatMoney(compare.chainAmount, to)}
          </dd>
          <dd className="mt-1 text-xs tabular-nums text-muted">
            1 {from} = {formatRate(compare.chainRate)} {to}
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-xs text-muted">比对因素 · 二次连乘 ÷ 直接牌价</p>
      <p className="font-display text-3xl tabular-nums text-ink">{formatFactor(compare.factor)}</p>
      <p className="mt-1 text-sm text-muted">
        价差 {formatBps(compare.bps)} · 到手差额 {formatMoney(compare.cashGap, to)} {to} · 经 {via} · {lean}
      </p>
    </div>
  );
}

function Leg({
  index,
  title,
  amount,
  unit,
  rate,
}: {
  index: string;
  title: string;
  amount: string;
  unit: string;
  rate: string;
}) {
  return (
    <li className="grid grid-cols-[2.5rem_1fr] gap-3">
      <span className="font-display text-lg text-muted">{index}</span>
      <div className="min-w-0">
        <p className="text-sm text-muted">{title}</p>
        <p className="font-display text-3xl tabular-nums text-ink">
          {amount}
          <span className="ml-2 font-sans text-sm text-muted">{unit}</span>
        </p>
        <p className="text-sm tabular-nums text-muted">{rate}</p>
      </div>
    </li>
  );
}

function CurrencySelect({
  label,
  value,
  onChange,
  disabledCodes = [],
}: {
  label: string;
  value: string;
  onChange: (code: string) => void;
  disabledCodes?: string[];
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-sm text-muted">
        {label}
      </label>
      <div className="relative mt-1">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${fieldClass} h-12 appearance-none pr-10`}
        >
          {CURRENCIES.map((item) => (
            <option key={item.code} value={item.code} disabled={disabledCodes.includes(item.code)}>
              {item.name} · {item.code}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

function SeriesButton({
  current,
  id,
  label,
  onPick,
}: {
  current: SeriesMode;
  id: SeriesMode;
  label: string;
  onPick: (id: SeriesMode) => void;
}) {
  return (
    <button type="button" className={current === id ? choiceOn : choiceClass} onClick={() => onPick(id)}>
      {label}
    </button>
  );
}

function Stat({ label, value, tone = "flat" }: { label: string; value: string; tone?: "up" | "down" | "flat" }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={`mt-1 font-display text-xl tabular-nums ${toneClass(tone)}`}>{value}</dd>
    </div>
  );
}

function StatusCard({
  label,
  value,
  detail,
  tone,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "up" | "down" | "flat";
  icon: "up" | "down" | "flat" | "clock";
}) {
  const Icon = icon === "up" ? TrendingUp : icon === "down" ? TrendingDown : icon === "clock" ? Clock : Minus;
  const wrap =
    tone === "up" ? "bg-accent-soft text-accent" : tone === "down" ? "bg-down-soft text-down" : "bg-surface text-ink";
  return (
    <div className={`rounded-lg border border-line px-4 py-3 ${wrap}`}>
      <p className="flex items-center gap-2 text-xs text-muted">
        <Icon className="size-4" aria-hidden="true" />
        {label}
      </p>
      <p className="mt-2 font-display text-2xl">{value}</p>
      <p className="mt-1 text-xs text-muted">{detail}</p>
    </div>
  );
}

function ErrorNote({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-sm text-down">{message}</p>
      <button type="button" className={choiceClass} onClick={onRetry}>
        重试
      </button>
    </div>
  );
}

function statusOf(sample: WatchSample | undefined): {
  label: string;
  tone: "up" | "down" | "flat";
  icon: "up" | "down" | "flat";
} {
  if (!sample || sample.kind === "base" || sample.deltaPct == null) {
    return { label: "建立基线", tone: "flat", icon: "flat" };
  }
  if (sample.kind === "flat" || Math.abs(sample.deltaPct) < 0.0001) {
    return { label: "平稳", tone: "flat", icon: "flat" };
  }
  if (sample.deltaPct > 0) return { label: "上浮", tone: "up", icon: "up" };
  return { label: "下探", tone: "down", icon: "down" };
}

function toneOf(n: number | null | undefined): "up" | "down" | "flat" {
  if (n == null || Math.abs(n) < 0.0001) return "flat";
  return n > 0 ? "up" : "down";
}

function toneClass(tone: "up" | "down" | "flat"): string {
  if (tone === "up") return "text-accent";
  if (tone === "down") return "text-down";
  return "text-ink";
}

function kindLabel(kind: WatchSample["kind"]): string {
  if (kind === "base") return "基线";
  if (kind === "move") return "波动";
  return "整点核对";
}

function seriesLabel(
  mode: SeriesMode,
  secondary: boolean,
  from: string,
  via: string | null,
  to: string,
): string {
  const fromName = currencyOf(from).name;
  const toName = currencyOf(to).name;
  if (!secondary || mode === "cross" || !via) return `${fromName} → ${toName}`;
  const viaName = currencyOf(via).name;
  if (mode === "gap") return `${fromName} → ${toName} 比对因素`;
  if (mode === "leg1") return `${fromName} → ${viaName}`;
  return `${viaName} → ${toName}`;
}

function messageOf(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "核对失败，请再试一次";
}
