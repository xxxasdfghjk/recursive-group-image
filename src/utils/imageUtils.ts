import { PriorityQueue } from "./PriorityQueue";
// utils/imageUtils.ts

export type Region = {
    x: number;
    y: number;
    width: number;
    height: number;
    variance: number;
};

function getLuminance(r: number, g: number, b: number): number {
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function computeAvgColor(
    x: number,
    y: number,
    width: number,
    height: number,
    accumulate: { r: number[][]; g: number[][]; b: number[][] }
): [number, number, number] {
    const { r: dpR, g: dpG, b: dpB } = accumulate;
    const yBottom = y + height;
    const xRight = x + width;
    const r = dpR[yBottom][xRight] - dpR[y][xRight] - dpR[yBottom][x] + dpR[y][x];
    const g = dpG[yBottom][xRight] - dpG[y][xRight] - dpG[yBottom][x] + dpG[y][x];
    const b = dpB[yBottom][xRight] - dpB[y][xRight] - dpB[yBottom][x] + dpB[y][x];
    const total = width * height;
    return [r / total, g / total, b / total];
}

export function computeVariance(
    x: number,
    y: number,
    width: number,
    height: number,
    accumulate: number[][],
    accumulateSquare: number[][]
): number {
    // (x-z)^2 = x^2-2*z + z^2
    const yBottom = y + height;
    const xRight = x + width;
    const sumLuminous = accumulate[yBottom][xRight] - accumulate[y][xRight] - accumulate[yBottom][x] + accumulate[y][x];

    const sumLuminousSquare =
        accumulateSquare[yBottom][xRight] -
        accumulateSquare[y][xRight] -
        accumulateSquare[yBottom][x] +
        accumulateSquare[y][x];
    const pixels = width * height;
    const mean = sumLuminous / pixels;
    return pixels + sumLuminousSquare - 2 * sumLuminous * mean + pixels * mean * mean;
}

export function fillRegionWithAvgColor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    accumulateRGB: { r: number[][]; g: number[][]; b: number[][] }
) {
    const [r, g, b] = computeAvgColor(x, y, width, height, accumulateRGB);
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(x, y, width, height);
}

export function splitAndAnalyze(
    region: Region,
    luminousAccumulate: number[][],
    luminousSquareAccumulate: number[][]
): Region[] {
    const { x, y, width, height } = region;
    const halfWidth = Math.floor(width / 2);
    const halfHeight = Math.floor(height / 2);

    const subRegions: Region[] = [];

    for (let dx = 0; dx < 2; dx++) {
        for (let dy = 0; dy < 2; dy++) {
            const sx = dx * halfWidth;
            const sy = dy * halfHeight;
            const widthRest = dx !== 0 && width % 2 == 1 ? 1 : 0;
            const heightRest = dy !== 0 && height % 2 == 1 ? 1 : 0;
            subRegions.push({
                x: x + sx,
                y: y + sy,
                width: halfWidth + widthRest,
                height: halfHeight + heightRest,
                variance: computeVariance(
                    x + sx,
                    y + sy,
                    halfWidth,
                    halfHeight,
                    luminousAccumulate,
                    luminousSquareAccumulate
                ),
            });
        }
    }

    return subRegions;
}

export function selectMostComplexRegion(regions: Region[]): Region {
    return regions.reduce((max, region) => {
        if ((region.variance ?? 0) > (max.variance ?? 0)) return region;
        return max;
    }, regions[0]);
}

const calcAccumulateRGB = (imageData: Uint8ClampedArray<ArrayBufferLike>, width: number, height: number) => {
    const dpR: number[][] = Array.from({ length: height + 1 })
        .fill(0)
        .map(() => Array.from({ length: width + 1 }).fill(0)) as number[][];
    const dpG: number[][] = Array.from({ length: height + 1 })
        .fill(0)
        .map(() => Array.from({ length: width + 1 }).fill(0)) as number[][];
    const dpB: number[][] = Array.from({ length: height + 1 })
        .fill(0)
        .map(() => Array.from({ length: width + 1 }).fill(0)) as number[][];

    for (let i = 1; i <= height; i++)
        for (let j = 1; j <= width; j++) {
            const r = imageData[4 * ((i - 1) * width + (j - 1))];
            const g = imageData[4 * ((i - 1) * width + (j - 1)) + 1];
            const b = imageData[4 * ((i - 1) * width + (j - 1)) + 2];
            dpR[i][j] += dpR[i - 1][j] + dpR[i][j - 1] - dpR[i - 1][j - 1] + r;
            dpG[i][j] += dpG[i - 1][j] + dpG[i][j - 1] - dpG[i - 1][j - 1] + g;
            dpB[i][j] += dpB[i - 1][j] + dpB[i][j - 1] - dpB[i - 1][j - 1] + b;
        }
    return { r: dpR, g: dpG, b: dpB };
};

const calcAccumulate = (imageData: Uint8ClampedArray<ArrayBufferLike>, width: number, height: number) => {
    const dp: number[][] = Array.from({ length: height + 1 })
        .fill(0)
        .map(() => Array.from({ length: width + 1 }).fill(0)) as number[][];
    const dpsquare: number[][] = Array.from({ length: height + 1 })
        .fill(0)
        .map(() => Array.from({ length: width + 1 }).fill(0)) as number[][];

    for (let i = 1; i <= height; i++)
        for (let j = 1; j <= width; j++) {
            const r = imageData[4 * ((i - 1) * width + (j - 1))];
            const g = imageData[4 * ((i - 1) * width + (j - 1)) + 1];
            const b = imageData[4 * ((i - 1) * width + (j - 1)) + 2];
            const luminous = getLuminance(r, g, b);
            dp[i][j] += dp[i - 1][j] + dp[i][j - 1] - dp[i - 1][j - 1] + luminous;
            dpsquare[i][j] += dpsquare[i - 1][j] + dpsquare[i][j - 1] - dpsquare[i - 1][j - 1] + luminous * luminous;
        }

    return { luminousAccumulate: dp, luminousSquareAccumulate: dpsquare };
};

export async function runSegmentationSteps(image: HTMLImageElement, canvas: HTMLCanvasElement, steps: number) {
    const ctx = canvas.getContext("2d")!;
    const width = canvas.width;
    const height = canvas.height;

    ctx.drawImage(image, 0, 0, width, height);
    const baseImageData = ctx.getImageData(0, 0, width, height);
    const { luminousAccumulate, luminousSquareAccumulate } = calcAccumulate(
        baseImageData.data,
        canvas.width,
        canvas.height
    );
    const accumulateRGB = calcAccumulateRGB(baseImageData.data, canvas.width, canvas.height);
    const initialRegion = {
        x: 0,
        y: 0,
        width,
        height,
        variance: computeVariance(0, 0, canvas.width, canvas.height, luminousAccumulate, luminousSquareAccumulate),
    };
    const subRegions = splitAndAnalyze(initialRegion, luminousAccumulate, luminousSquareAccumulate);
    subRegions.forEach((top) => {
        fillRegionWithAvgColor(ctx, top.x, top.y, top.width, top.height, accumulateRGB);
    });
    const priorityQueue = new PriorityQueue(subRegions, (e1, e2) => {
        return e2.variance - e1.variance;
    });

    for (let step = 0; step < steps; step++) {
        const region = priorityQueue.pop();
        fillRegionWithAvgColor(ctx, region.x, region.y, region.width, region.height, accumulateRGB);
        const subRegions = splitAndAnalyze(region, luminousAccumulate, luminousSquareAccumulate);
        priorityQueue.push(...subRegions);
        await new Promise((res) => setTimeout(res, 10));
    }
}
