import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import Loader from '@/shared/PageLoader/Loader';
import { StatsOverview } from './components/StatsOverview';
import { StorageUsage } from './components/StorageUsage';
import { UploadsChart } from './components/UploadsChart';
import { FileTypeBreakdown } from './components/FileTypeBreakdown';
import { RecentActivity } from './components/RecentActivity';
import GetStarted from './components/GetStarted';

export default function DashboardStats() {
  const { data, isLoading } = useQuery(
    trpc.stats.getDashboardStats.queryOptions(),
  );

  if (isLoading || !data) {
    return <Loader />;
  }

  const foldersStat = data.overview.find((item) => item.id === 'folders');
  const hasNoFolders = !foldersStat || foldersStat.value === '0';

  if (hasNoFolders) {
    return <GetStarted />;
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          An overview of your files, storage, and recent activity.
        </p>
      </header>

      <StatsOverview overview={data.overview} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 items-stretch">
        <div className="lg:col-span-2 flex flex-col h-full">
          <UploadsChart data={data.uploadsChart} />
        </div>
        <div className="flex flex-col h-full">
          <FileTypeBreakdown data={data.fileTypes} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 items-stretch">
        <div className="lg:col-span-2 flex flex-col h-full">
          <StorageUsage storage={data.storage} />
        </div>
        <div className="flex flex-col h-full">
          <RecentActivity activities={data.activities} />
        </div>
      </div>
    </div>
  );
}
