import React from 'react';
import { motion } from 'motion/react';
import CountUp from '@/components/CountUp';
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from 'recharts';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';

interface RadialMetricProps {
  nodeName: string;
  latency: number;
  flag: string;
}

const RadialMetricChart: React.FC<RadialMetricProps> = ({
  nodeName,
  latency,
  flag,
}) => {
  // Compute percentage score: lower latency is better.
  const percentage = Math.max(30, Math.min(95, 100 - (latency - 10) * 2.5));

  // startAngle at 90 (12 o'clock), sweep clockwise based on percentage
  const startAngle = 90;
  const endAngle = startAngle - 360 * (percentage / 100);

  const chartData = [
    { name: nodeName, value: 100, fill: `url(#gradient-${nodeName})` },
  ];

  const chartConfig = {
    value: {
      label: nodeName,
    },
  } satisfies ChartConfig;

  return (
    <div className="flex flex-col items-center justify-center flex-1">
      <ChartContainer
        config={chartConfig}
        className="w-full aspect-square max-h-[130px] mx-auto overflow-visible"
      >
        <RadialBarChart
          data={chartData}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={32}
          outerRadius={45}
        >
          <defs>
            <linearGradient
              id={`gradient-${nodeName}`}
              x1="0"
              y1="1"
              x2="0"
              y2="0"
            >
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
          <PolarGrid
            gridType="circle"
            radialLines={false}
            stroke="none"
            className="first:fill-muted last:fill-black dark:last:fill-black"
            polarRadius={[41, 35]}
          />
          <RadialBar dataKey="value" cornerRadius={4} />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
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
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy - 3}
                        className="fill-white text-[15px] font-bold tracking-tight"
                      >
                        {latency}ms
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 10}
                        className="fill-zinc-400 text-[8px] font-black uppercase tracking-wider"
                      >
                        {flag} {nodeName}
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </PolarRadiusAxis>
        </RadialBarChart>
      </ChartContainer>
    </div>
  );
};

const GlobalStatusCard: React.FC = () => {
  return (
    <motion.div
      className="relative w-full h-full flex flex-col justify-between p-6 bg-white dark:bg-zinc-950 rounded-3xl shadow-xs select-none min-h-[300px] overflow-hidden border border-zinc-200/80 dark:border-zinc-900 cursor-pointer"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Background radial glows */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,rgba(124,58,237,0.015),transparent_70%] pointer-events-none rounded-3xl" />
      <div className="absolute inset-0 bg-radial-[circle_at_30%_50%,rgba(124,58,237,0.015),transparent_60%] pointer-events-none rounded-3xl" />

      {/* Header Info */}
      <div className="flex justify-between items-start z-10">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight leading-none">
            Global Edge Accelerator
          </h3>
          <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 mt-1 uppercase tracking-wider">
            Zero-latency file delivery network
          </p>
        </div>
        <span className="text-[9px] uppercase tracking-wider font-extrabold text-primary bg-primary/5 dark:bg-primary/10 px-2.5 py-1 rounded-full border border-primary/15 flex items-center gap-1.5">
          <span className="relative flex size-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/70 opacity-75" />
            <span className="relative inline-flex rounded-full size-1.5 bg-primary" />
          </span>
          Live CDN Nodes
        </span>
      </div>

      {/* 3 Circular Recharts Radial Graphs */}
      <div className="flex flex-row gap-4 items-center justify-between my-4 z-10 w-full">
        <RadialMetricChart nodeName="US-EAST" latency={12} flag="🇺🇸" />
        <RadialMetricChart nodeName="EU-WEST" latency={18} flag="🇬🇧" />
        <RadialMetricChart nodeName="AS-PAC" latency={26} flag="🇯🇵" />
      </div>

      {/* Stats Divider Line */}
      <div className="w-full h-px bg-zinc-100 dark:bg-zinc-900 z-10" />

      {/* Dashboard Footer Metrics */}
      <div className="flex items-center justify-between w-full mt-2 px-1 z-10">
        <div className="flex flex-col">
          <span className="text-lg font-medium text-zinc-900 dark:text-white tracking-tight leading-none">
            <CountUp to={18} duration={1.2} />
            ms
          </span>
          <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1.5 leading-none">
            Avg Edge Latency
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-lg font-medium text-zinc-900 dark:text-white tracking-tight leading-none">
            <CountUp to={310} duration={1.5} />+
          </span>
          <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1.5 leading-none">
            Global Edge POPs
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-lg font-medium text-zinc-900 dark:text-white tracking-tight leading-none">
            <CountUp to={99.4} duration={1.5} />%
          </span>
          <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1.5 leading-none">
            Cache Hit Ratio
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default GlobalStatusCard;
export { GlobalStatusCard };
