import DashboardHeader from '@/shared/Dashboard/DashboardHeader';
import { FolderList } from '@/shared/Dashboard/FolderList';

export default function Starred() {
  return (
    <div className="w-full rounded-lg bg-background p-4 shadow-sm ring-1 ring-border/60">
      <DashboardHeader
        folderId={0}
        folderName="Starred"
        folerDescription="Your favorite folders for quick access."
        canUpload={false}
        canCreate={false}
      />
      <section className="mt-6" aria-label="Starred Folders">
        <FolderList mode="starred" />
      </section>
    </div>
  );
}
