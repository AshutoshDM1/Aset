import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { FileTypePoint } from './mockData';

const chartConfig = {
  count: {
    label: 'Files',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

type FileTypeBreakdownProps = {
  data: FileTypePoint[];
};

export function FileTypeBreakdown({ data }: FileTypeBreakdownProps) {
  const total = data.reduce((acc, f) => acc + f.count, 0);

  return (
    <div className="h-full rounded-lg bg-background p-5 shadow-sm ring-1 ring-border/60">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">By file type</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {total.toLocaleString()} files across categories
          </p>
        </div>
      </div>

      <ChartContainer config={chartConfig} className="mt-4 h-65 w-full">
        <BarChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="type"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} width={28} />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar dataKey="count" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
