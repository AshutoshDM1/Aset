import * as React from 'react';
import { Label, Pie, PieChart } from 'recharts';
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
  },
  images: {
    label: 'Images',
    color: 'var(--color-blue-400)',
  },
  docs: {
    label: 'Documents',
    color: 'var(--color-pink-500)',
  },
  videos: {
    label: 'Videos',
    color: 'var(--color-yellow-400)',
  },
  audio: {
    label: 'Audio',
    color: 'var(--color-orange-400)',
  },
  pdfs: {
    label: 'PDFs',
    color: 'var(--color-purple-500)',
  },
  other: {
    label: 'Other',
    color: 'var(--color-neutral-800)',
  },
} satisfies ChartConfig;

type FileTypeBreakdownProps = {
  data: FileTypePoint[];
};

export function FileTypeBreakdown({ data }: FileTypeBreakdownProps) {
  const total = React.useMemo(() => {
    return data.reduce((acc, f) => acc + f.count, 0);
  }, [data]);

  const chartData = React.useMemo(() => {
    return data.map((item) => {
      const key = item.type === 'Docs' ? 'docs' : item.type.toLowerCase();
      return {
        type: key,
        count: item.count,
        fill: `var(--color-${key})`,
      };
    });
  }, [data]);

  return (
    <div className="h-full flex flex-col justify-between rounded-lg bg-background p-5 shadow-sm ring-1 ring-border/60">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">By file type</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {total.toLocaleString()} {total === 1 ? 'file' : 'files'} across
              categories
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-6">
          <div className="relative w-[150px] h-[150px] shrink-0">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square w-full h-full"
            >
              <PieChart width={150} height={150}>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="type"
                  innerRadius={45}
                  outerRadius={65}
                  strokeWidth={4}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-2xl font-bold tracking-tight"
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              {total.toLocaleString()}
                            </text>
                            <text
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 18}
                              className="fill-muted-foreground text-[10px]"
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              {total === 1 ? 'File' : 'Files'}
                            </text>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>

          <div className="flex-1 w-full flex flex-col gap-2.5">
            {data.map((item) => {
              const key =
                item.type === 'Docs' ? 'docs' : item.type.toLowerCase();
              const config = chartConfig[key as keyof typeof chartConfig];
              const label = config?.label || item.type;
              const pct =
                total > 0 ? ((item.count / total) * 100).toFixed(1) : '0';
              const dotColor =
                config && 'color' in config ? config.color : 'oklch(0.708 0 0)';

              return (
                <div
                  key={item.type}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: dotColor }}
                    />
                    <span className="text-muted-foreground">{label}</span>
                  </div>
                  <span className="font-semibold text-foreground tabular-nums">
                    {item.count}{' '}
                    <span className="text-xs text-muted-foreground font-normal">
                      ({pct}%)
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
