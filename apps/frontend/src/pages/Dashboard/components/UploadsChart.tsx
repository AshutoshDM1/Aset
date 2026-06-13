import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { UploadsPoint } from './mockData';

const chartConfig = {
  uploads: {
    label: 'Uploads',
    color: 'var(--chart-1)',
  },
  downloads: {
    label: 'Downloads',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

type UploadsChartProps = {
  data: UploadsPoint[];
  rangeDays: number;
  onRangeDaysChange: (days: number) => void;
};

export function UploadsChart({
  data,
  rangeDays,
  onRangeDaysChange,
}: UploadsChartProps) {
  return (
    <div className="h-full rounded-lg bg-background p-5 shadow-sm ring-1 ring-border/60">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Activity</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Uploads & downloads over the last {rangeDays} days
          </p>
        </div>
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/40 shrink-0">
          <button
            onClick={() => onRangeDaysChange(7)}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
              rangeDays === 7
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => onRangeDaysChange(30)}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
              rangeDays === 30
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      <ChartContainer config={chartConfig} className="mt-4 h-65 w-full">
        <AreaChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
          <defs>
            <linearGradient id="fillUploads" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-uploads)"
                stopOpacity={0.6}
              />
              <stop
                offset="95%"
                stopColor="var(--color-uploads)"
                stopOpacity={0.05}
              />
            </linearGradient>
            <linearGradient id="fillDownloads" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-downloads)"
                stopOpacity={0.5}
              />
              <stop
                offset="95%"
                stopColor="var(--color-downloads)"
                stopOpacity={0.05}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            interval={rangeDays > 7 ? 4 : 0}
          />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} width={28} />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Area
            dataKey="downloads"
            type="monotone"
            stroke="var(--color-downloads)"
            fill="url(#fillDownloads)"
            strokeWidth={2}
          />
          <Area
            dataKey="uploads"
            type="monotone"
            stroke="var(--color-uploads)"
            fill="url(#fillUploads)"
            strokeWidth={2}
          />
          <ChartLegend content={<ChartLegendContent />} />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
