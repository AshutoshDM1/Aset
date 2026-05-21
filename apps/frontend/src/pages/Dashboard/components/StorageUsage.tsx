import { Progress } from '@/components/ui/progress';
import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from 'recharts';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { formatBytes } from './mockData';
import type { StorageSlice } from './mockData';

type StorageUsageProps = {
  storage: {
    totalBytes: number;
    usedBytes: number;
    slices: StorageSlice[];
  };
};

const chartConfig = {
  bytes: {
    label: 'Storage Used',
  },
} satisfies ChartConfig;

export function StorageUsage({ storage }: StorageUsageProps) {
  const { totalBytes, usedBytes, slices } = storage;
  const usedPct = Math.min(
    100,
    totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0,
  );

  // Use logarithmic or power scaling for visual bar width so small sizes are still beautiful and readable
  const maxBytes = Math.max(...slices.map((s) => s.bytes), 1);
  const chartData = slices.map((slice) => {
    const pct = slice.bytes / maxBytes;
    // If bytes is 0, give it a baseline 22% width so the text "Audio" fits beautifully.
    // Otherwise, scale it between 30% and 100% using 4th root scale.
    const visualValue = slice.bytes === 0 ? 22 : 30 + Math.pow(pct, 0.25) * 70;

    return {
      ...slice,
      visualValue,
      formattedBytes: formatBytes(slice.bytes),
    };
  });

  return (
    <div className="h-full flex flex-col justify-between rounded-lg bg-background p-5 shadow-sm ring-1 ring-border/60">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Storage</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatBytes(usedBytes)} of {formatBytes(totalBytes)} used
            </p>
          </div>
          <span className="text-sm font-medium tabular-nums">
            {usedPct.toFixed(0)}%
          </span>
        </div>

        <Progress value={usedPct} className="mt-4" />
      </div>

      <div className="mt-6 flex-1 flex items-center">
        <ChartContainer config={chartConfig} className="h-60 w-full">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 0, right: 64, top: 0, bottom: 0 }}
          >
            <YAxis
              dataKey="label"
              type="category"
              tickLine={false}
              axisLine={false}
              hide
            />
            <XAxis type="number" domain={[0, 100]} hide />
            <Bar dataKey="visualValue" radius={4} barSize={36}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <LabelList
                dataKey="label"
                position="insideLeft"
                offset={10}
                className="fill-white font-medium select-none"
                style={{ fontSize: '12px' }}
              />
              <LabelList
                dataKey="formattedBytes"
                position="right"
                offset={10}
                className="fill-foreground font-medium select-none"
                style={{ fontSize: '12px' }}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}
