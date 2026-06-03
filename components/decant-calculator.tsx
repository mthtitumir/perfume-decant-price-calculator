"use client";

import { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculateCompetitorProfit,
  calculateDecantPrices,
  createMarkdownPriceTable,
  DECANT_SIZES,
  DEFAULT_CALCULATOR_INPUTS,
  type CalculatorInputs,
  type DecantSize,
} from "@/lib/decant-calculator";

const CARD_BACKGROUNDS = {
  emerald: {
    label: "Emerald",
    from: "#062e2a",
    to: "#10b981",
  },
  noir: {
    label: "Noir",
    from: "#09090b",
    to: "#3f3f46",
  },
  rose: {
    label: "Rose",
    from: "#4a102a",
    to: "#fb7185",
  },
  amber: {
    label: "Amber",
    from: "#422006",
    to: "#f59e0b",
  },
} as const;

const currencyFormatter = new Intl.NumberFormat("en-BD", {
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat("en-BD", {
  maximumFractionDigits: 2,
});

type NumberFieldProps = {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  min?: number;
  error?: string;
};

type CardBackgroundKey = keyof typeof CARD_BACKGROUNDS;

function formatBdt(value: number) {
  return `${currencyFormatter.format(Math.round(value))} BDT`;
}

function parseNumber(value: string) {
  if (value.trim() === "") {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function NumberField({
  id,
  label,
  value,
  onChange,
  suffix = "BDT",
  min = 0,
  error,
}: NumberFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          inputMode="decimal"
          min={min}
          type="number"
          value={String(value)}
          onChange={(event) => onChange(parseNumber(event.target.value))}
          className="pr-16"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {suffix}
        </span>
      </div>
      {error ? <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  );
}

function validateInputs(inputs: CalculatorInputs) {
  return {
    bottleSize: inputs.bottleSize <= 0 ? "Bottle size must be greater than 0." : "",
    bottleCost: inputs.bottleCost < 0 ? "Bottle cost cannot be negative." : "",
    shippingCost: inputs.shippingCost < 0 ? "Shipping cost cannot be negative." : "",
    profitPercent: inputs.profitPercent < 0 ? "Profit percentage cannot be negative." : "",
  };
}

export function DecantCalculator() {
  const promoCardRef = useRef<HTMLDivElement>(null);
  const [perfumeName, setPerfumeName] = useState("Hawas Ice");
  const [shopName, setShopName] = useState("Decant BD");
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_CALCULATOR_INPUTS);
  const [copyLabel, setCopyLabel] = useState("Copy Result");
  const [downloadLabel, setDownloadLabel] = useState("Download Card");
  const [competitorPrice10ml, setCompetitorPrice10ml] = useState(550);
  const [cardBackground, setCardBackground] = useState<CardBackgroundKey>("emerald");
  const [fontColor, setFontColor] = useState("#ffffff");
  const [accentColor, setAccentColor] = useState("#fef3c7");

  const calculations = useMemo(() => calculateDecantPrices(inputs), [inputs]);
  const errors = useMemo(() => validateInputs(inputs), [inputs]);
  const selectedBackground = CARD_BACKGROUNDS[cardBackground];
  const displayName = perfumeName.trim() || "Perfume Decants";

  const tenMlResult = calculations.results.find((result) => result.size === 10);
  const competitor = calculateCompetitorProfit({
    bottleSize: inputs.bottleSize,
    bottleCost: inputs.bottleCost,
    shippingCost: inputs.shippingCost,
    decantSize: 10,
    competitorPrice: competitorPrice10ml,
    packagingCost: tenMlResult?.packagingCost ?? 0,
  });

  const updateInput = <Key extends keyof CalculatorInputs>(
    key: Key,
    value: CalculatorInputs[Key],
  ) => {
    setInputs((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updatePackaging = (size: DecantSize, value: number) => {
    setInputs((current) => ({
      ...current,
      packagingCosts: {
        ...current.packagingCosts,
        [size]: value,
      },
    }));
  };

  const copyResult = async () => {
    const markdown = createMarkdownPriceTable(calculations.results);

    try {
      await navigator.clipboard.writeText(markdown);
      setCopyLabel("Copied");
      window.setTimeout(() => setCopyLabel("Copy Result"), 1800);
    } catch {
      setCopyLabel("Copy failed");
      window.setTimeout(() => setCopyLabel("Copy Result"), 1800);
    }
  };

  const downloadPromoCard = async () => {
    if (!promoCardRef.current) {
      return;
    }

    const fileName = `${displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "perfume"}-price-card.png`;

    try {
      setDownloadLabel("Preparing...");
      const dataUrl = await toPng(promoCardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: selectedBackground.from,
      });
      const link = document.createElement("a");
      link.download = fileName;
      link.href = dataUrl;
      link.click();
      setDownloadLabel("Downloaded");
      window.setTimeout(() => setDownloadLabel("Download Card"), 1800);
    } catch {
      setDownloadLabel("Download failed");
      window.setTimeout(() => setDownloadLabel("Download Card"), 1800);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-3 py-6 sm:py-8">
          <div className="inline-flex w-fit rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-normal text-emerald-800 dark:border-emerald-900/80 dark:bg-emerald-950 dark:text-emerald-200">
            Bangladesh seller toolkit
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-normal text-zinc-950 dark:text-zinc-50 sm:text-5xl">
              Perfume Decant Price Calculator
            </h1>
            <p className="max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400 sm:text-lg">
              Calculate profitable decant prices instantly.
            </p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(430px,0.9fr)]">
          <section className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bottle Information</CardTitle>
                <CardDescription>Enter the landed bottle cost before splitting into decants.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="perfume-name">Perfume Name</Label>
                  <Input
                    id="perfume-name"
                    value={perfumeName}
                    onChange={(event) => setPerfumeName(event.target.value)}
                    placeholder="e.g. Hawas Ice"
                  />
                </div>
                <NumberField
                  id="bottle-size"
                  label="Bottle Size"
                  suffix="ml"
                  value={inputs.bottleSize}
                  onChange={(value) => updateInput("bottleSize", value)}
                  error={errors.bottleSize}
                />
                <NumberField
                  id="bottle-cost"
                  label="Bottle Cost"
                  value={inputs.bottleCost}
                  onChange={(value) => updateInput("bottleCost", value)}
                  error={errors.bottleCost}
                />
                <NumberField
                  id="shipping-cost"
                  label="Shipping / Import Cost"
                  value={inputs.shippingCost}
                  onChange={(value) => updateInput("shippingCost", value)}
                  error={errors.shippingCost}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Packaging Information</CardTitle>
                <CardDescription>These costs are added to every decant sold.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {DECANT_SIZES.map((size) => (
                    <NumberField
                      key={size}
                      id={`packaging-${size}`}
                      label={`${size}ml Bottle Cost`}
                      value={inputs.packagingCosts[size]}
                      onChange={(value) => updatePackaging(size, value)}
                    />
                  ))}
                </div>
                <div className="grid gap-4 border-t border-zinc-200 pt-5 dark:border-zinc-800 sm:grid-cols-3">
                  <NumberField
                    id="sticker-cost"
                    label="Sticker Cost"
                    value={inputs.stickerCost}
                    onChange={(value) => updateInput("stickerCost", value)}
                  />
                  <NumberField
                    id="bubble-wrap-cost"
                    label="Bubble Wrap Cost"
                    value={inputs.bubbleWrapCost}
                    onChange={(value) => updateInput("bubbleWrapCost", value)}
                  />
                  <NumberField
                    id="misc-cost"
                    label="Miscellaneous Cost"
                    value={inputs.miscCost}
                    onChange={(value) => updateInput("miscCost", value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profit Settings</CardTitle>
                <CardDescription>Set the target margin added after perfume and packaging cost.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <NumberField
                  id="profit-percent"
                  label="Desired Profit"
                  suffix="%"
                  value={inputs.profitPercent}
                  onChange={(value) => updateInput("profitPercent", value)}
                  error={errors.profitPercent}
                />
              </CardContent>
            </Card>
          </section>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <Card className="border-emerald-200 bg-emerald-50/80 dark:border-emerald-900 dark:bg-emerald-950/40">
              <CardHeader>
                <CardTitle>{perfumeName.trim() || "Perfume"} Pricing</CardTitle>
                <CardDescription>Live output based on your current inputs.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <div className="rounded-md border border-emerald-200 bg-white p-4 dark:border-emerald-900 dark:bg-zinc-950">
                  <p className="text-xs font-semibold uppercase tracking-normal text-zinc-500 dark:text-zinc-400">
                    Cost Per ml
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {decimalFormatter.format(calculations.costPerMl)} BDT/ml
                  </p>
                </div>
                <div className="rounded-md border border-emerald-200 bg-white p-4 dark:border-emerald-900 dark:bg-zinc-950">
                  <p className="text-xs font-semibold uppercase tracking-normal text-zinc-500 dark:text-zinc-400">
                    5ml Bottle Revenue
                  </p>
                  <p className="mt-2 text-2xl font-bold">{formatBdt(calculations.revenue5ml)}</p>
                </div>
                <div className="rounded-md border border-emerald-200 bg-white p-4 dark:border-emerald-900 dark:bg-zinc-950">
                  <p className="text-xs font-semibold uppercase tracking-normal text-zinc-500 dark:text-zinc-400">
                    10ml Bottle Revenue
                  </p>
                  <p className="mt-2 text-2xl font-bold">{formatBdt(calculations.revenue10ml)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5">
                  <CardTitle>Results Table</CardTitle>
                  <CardDescription>Rounded selling price for each decant size.</CardDescription>
                </div>
                <Button onClick={copyResult} className="w-full sm:w-auto">
                  {copyLabel}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800">
                  <table className="w-full min-w-[620px] border-collapse text-sm">
                    <thead className="bg-zinc-100 text-left text-xs uppercase tracking-normal text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Size</th>
                        <th className="px-4 py-3 font-semibold">Perfume Cost</th>
                        <th className="px-4 py-3 font-semibold">Packaging</th>
                        <th className="px-4 py-3 font-semibold">Total Cost</th>
                        <th className="px-4 py-3 font-semibold">Selling Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculations.results.map((result) => (
                        <tr
                          key={result.size}
                          className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
                        >
                          <td className="px-4 py-3 font-semibold">{result.size}ml</td>
                          <td className="px-4 py-3">{formatBdt(result.perfumeCost)}</td>
                          <td className="px-4 py-3">{formatBdt(result.packagingCost)}</td>
                          <td className="px-4 py-3">{formatBdt(result.totalCost)}</td>
                          <td className="px-4 py-3 text-base font-bold text-emerald-700 dark:text-emerald-300">
                            {formatBdt(result.sellingPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Competitor Pricing Mode</CardTitle>
                <CardDescription>Compare your true profit against a market 10ml price.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <NumberField
                  id="competitor-10ml"
                  label="Competitor sells 10ml"
                  value={competitorPrice10ml}
                  onChange={setCompetitorPrice10ml}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md bg-zinc-100 p-4 dark:bg-zinc-900">
                    <p className="text-xs font-semibold uppercase tracking-normal text-zinc-500 dark:text-zinc-400">
                      Your profit per 10ml
                    </p>
                    <p className="mt-2 text-2xl font-bold">{formatBdt(competitor.profitPerDecant)}</p>
                  </div>
                  <div className="rounded-md bg-zinc-100 p-4 dark:bg-zinc-900">
                    <p className="text-xs font-semibold uppercase tracking-normal text-zinc-500 dark:text-zinc-400">
                      Total profit if decanted
                    </p>
                    <p className="mt-2 text-2xl font-bold">{formatBdt(competitor.totalProfit)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Photo Card Maker</CardTitle>
                <CardDescription>Create a shareable price card for Facebook or Messenger.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="shop-name">Shop Name</Label>
                    <Input
                      id="shop-name"
                      value={shopName}
                      onChange={(event) => setShopName(event.target.value)}
                      placeholder="e.g. Decant BD"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card-background">Background</Label>
                    <select
                      id="card-background"
                      value={cardBackground}
                      onChange={(event) => setCardBackground(event.target.value as CardBackgroundKey)}
                      className="h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-4 focus:ring-zinc-950/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-200 dark:focus:ring-white/10"
                    >
                      {Object.entries(CARD_BACKGROUNDS).map(([key, background]) => (
                        <option key={key} value={key}>
                          {background.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="font-color">Font Color</Label>
                    <Input
                      id="font-color"
                      type="color"
                      value={fontColor}
                      onChange={(event) => setFontColor(event.target.value)}
                      className="p-1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accent-color">Accent Color</Label>
                    <Input
                      id="accent-color"
                      type="color"
                      value={accentColor}
                      onChange={(event) => setAccentColor(event.target.value)}
                      className="p-1"
                    />
                  </div>
                </div>

                <div
                  ref={promoCardRef}
                  className="relative mx-auto aspect-[4/5] w-full max-w-[540px] overflow-hidden rounded-lg border border-white/20 p-[clamp(1rem,4vw,2rem)] shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${selectedBackground.from}, ${selectedBackground.to})`,
                    color: fontColor,
                  }}
                >
                  <div className="absolute -right-[10%] -top-[8%] h-[28%] w-[28%] rounded-full bg-white/10" />
                  <div className="absolute -bottom-[12%] -left-[14%] h-[34%] w-[34%] rounded-full bg-black/10" />
                  <div className="relative flex h-full flex-col rounded-lg border border-white/25 bg-white/10 p-[clamp(1rem,4vw,2rem)] text-center">
                    <p className="text-[clamp(0.7rem,2.3vw,0.95rem)] font-bold uppercase tracking-normal" style={{ color: accentColor }}>
                      {shopName.trim() || "Your Shop"}
                    </p>
                    <h3 className="mt-[clamp(0.6rem,2vw,1rem)] text-[clamp(1.7rem,6vw,2.7rem)] font-black leading-tight">
                      {perfumeName.trim() || "Perfume Decants"}
                    </h3>
                    <p
                      className="mx-auto mt-[clamp(0.6rem,2vw,1rem)] w-fit rounded-full bg-black/20 px-[clamp(0.9rem,3vw,1.4rem)] py-[clamp(0.25rem,1vw,0.45rem)] text-[clamp(0.6rem,1.9vw,0.8rem)] font-bold uppercase tracking-normal"
                      style={{ color: accentColor }}
                    >
                      Decant Price List
                    </p>
                    <div className="mt-[clamp(1.2rem,4vw,2rem)] overflow-hidden rounded-lg bg-white/15 text-[clamp(0.8rem,2.5vw,1rem)]">
                      <div className="grid grid-cols-2 px-[clamp(1rem,4vw,1.7rem)] py-[clamp(0.5rem,1.8vw,0.8rem)] font-bold" style={{ color: accentColor }}>
                        <span className="text-left">Size</span>
                        <span className="text-right">Price</span>
                      </div>
                      {calculations.results.map((result) => (
                        <div key={result.size} className="grid grid-cols-2 border-t border-white/15 px-[clamp(1rem,4vw,1.7rem)] py-[clamp(0.47rem,1.7vw,0.75rem)] font-semibold">
                          <span className="text-left">{result.size}ml</span>
                          <span className="text-right">{currencyFormatter.format(result.sellingPrice)} BDT</span>
                        </div>
                      ))}
                    </div>
                    <div
                      className="mx-auto mt-auto w-fit rounded-full bg-white/15 px-[clamp(1.2rem,4vw,2rem)] py-[clamp(0.45rem,1.4vw,0.7rem)] text-[clamp(0.65rem,2vw,0.85rem)] font-bold uppercase tracking-normal"
                      style={{ color: accentColor }}
                    >
                      DM to order
                    </div>
                  </div>
                </div>

                <Button onClick={downloadPromoCard} className="w-full" disabled={downloadLabel === "Preparing..."}>
                  {downloadLabel}
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
