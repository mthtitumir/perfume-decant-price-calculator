export const DECANT_SIZES = [2, 3, 5, 10, 15, 20, 30] as const;

export type DecantSize = number;

export type PackagingCosts = Record<number, number>;

export type CalculatorInputs = {
  bottleSize: number;
  bottleCost: number;
  shippingCost: number;
  decantSizes: DecantSize[];
  packagingCosts: PackagingCosts;
  stickerCost: number;
  bubbleWrapCost: number;
  miscCost: number;
  profitPercent: number;
};

export type DecantResult = {
  size: DecantSize;
  perfumeCost: number;
  packagingCost: number;
  totalCost: number;
  sellingPrice: number;
};

export const DEFAULT_PACKAGING_COSTS: PackagingCosts = {
  2: 15,
  3: 15,
  5: 20,
  10: 25,
  15: 30,
  20: 35,
  30: 45,
};

export const DEFAULT_CALCULATOR_INPUTS: CalculatorInputs = {
  bottleSize: 100,
  bottleCost: 4000,
  shippingCost: 0,
  decantSizes: [...DECANT_SIZES],
  packagingCosts: DEFAULT_PACKAGING_COSTS,
  stickerCost: 5,
  bubbleWrapCost: 5,
  miscCost: 0,
  profitPercent: 30,
};

export function roundSellingPrice(value: number) {
  return Math.round(value / 10) * 10;
}

export function calculateDecantPrices(inputs: CalculatorInputs) {
  const safeBottleSize = inputs.bottleSize > 0 ? inputs.bottleSize : 1;
  const totalBottleCost = inputs.bottleCost + inputs.shippingCost;
  const costPerMl = totalBottleCost / safeBottleSize;
  const decantSizes = normalizeDecantSizes(inputs.decantSizes);

  const createResult = (size: DecantSize): DecantResult => {
    const perfumeCost = costPerMl * size;
    const packagingCost =
      getPackagingCost(inputs.packagingCosts, size) +
      inputs.stickerCost +
      inputs.bubbleWrapCost +
      inputs.miscCost;
    const totalCost = perfumeCost + packagingCost;
    const sellingPrice = roundSellingPrice(totalCost * (1 + inputs.profitPercent / 100));

    return {
      size,
      perfumeCost,
      packagingCost,
      totalCost,
      sellingPrice,
    };
  };

  const results: DecantResult[] = decantSizes.map(createResult);

  return {
    totalBottleCost,
    costPerMl,
    results,
    revenue5ml: calculateBottleRevenue([createResult(5)], safeBottleSize, 5),
    revenue10ml: calculateBottleRevenue([createResult(10)], safeBottleSize, 10),
  };
}

export function normalizeDecantSizes(sizes: DecantSize[]) {
  const uniqueSizes = Array.from(
    new Set(
      sizes
        .map((size) => Number(size))
        .filter((size) => Number.isFinite(size) && size > 0),
    ),
  );

  return uniqueSizes.sort((a, b) => a - b);
}

export function getPackagingCost(packagingCosts: PackagingCosts, size: DecantSize) {
  return packagingCosts[size] ?? DEFAULT_PACKAGING_COSTS[size] ?? 25;
}

export function calculateBottleRevenue(
  results: DecantResult[],
  bottleSize: number,
  decantSize: DecantSize,
) {
  const result = results.find((item) => item.size === decantSize);
  if (!result || bottleSize <= 0) {
    return 0;
  }

  return Math.floor(bottleSize / decantSize) * result.sellingPrice;
}

export function calculateCompetitorProfit({
  bottleSize,
  bottleCost,
  shippingCost,
  decantSize,
  competitorPrice,
  packagingCost,
}: {
  bottleSize: number;
  bottleCost: number;
  shippingCost: number;
  decantSize: DecantSize;
  competitorPrice: number;
  packagingCost: number;
}) {
  const safeBottleSize = bottleSize > 0 ? bottleSize : 1;
  const perfumeCost = ((bottleCost + shippingCost) / safeBottleSize) * decantSize;
  const totalCost = perfumeCost + packagingCost;
  const profitPerDecant = competitorPrice - totalCost;
  const decantCount = Math.floor(safeBottleSize / decantSize);

  return {
    totalCost,
    profitPerDecant,
    decantCount,
    totalProfit: profitPerDecant * decantCount,
  };
}

export function createMarkdownPriceTable(results: DecantResult[]) {
  const rows = results
    .map((result) => `| ${result.size}ml | ${result.sellingPrice} |`)
    .join("\n");

  return `| Size | Selling Price |
|------|--------------|
${rows}`;
}
