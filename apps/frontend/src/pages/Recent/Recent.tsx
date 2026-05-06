import DashboardHeader from '@/shared/Dashboard/DashboardHeader';
import { FileList } from '@/shared/Dashboard/FileList';

export default function Recent() {
  return (
    <div className="w-full rounded-lg bg-background p-4 shadow-sm ring-1 ring-border/60">
      <DashboardHeader
        folderId={0}
        folderName="Recent"
        folerDescription="Your most recently uploaded files."
        canUpload={false}
        canCreate={false}
      />
      <section className="mt-6" aria-label="Recent Files">
        <FileList mode="recent" />
      </section>
    </div>
  );
}
