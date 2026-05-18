import DashboardHeader from '@/shared/Dashboard/DashboardHeader';
import { FolderList } from '@/shared/Dashboard/FolderList';

export default function MyFiles() {
  return (
    <div className="w-full rounded-lg bg-background p-3 md:p-4 shadow-sm ring-1 ring-border/60">
      <DashboardHeader
        folderId={0}
        folderName="My Files"
        folerDescription="Folders in your personal drive."
        canUpload={false}
        canCreate
      />
      <section className="mt-6" aria-label="Folders">
        <FolderList mode="all" />
      </section>
    </div>
  );
}
