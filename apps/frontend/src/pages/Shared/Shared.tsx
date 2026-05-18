import DashboardHeader from '@/shared/Dashboard/DashboardHeader';
import { FolderList } from '@/shared/Dashboard/FolderList';

export default function Shared() {
  return (
    <div className="w-full rounded-lg bg-background p-4 shadow-sm ring-1 ring-border/60">
      <DashboardHeader
        folderId={0}
        folderName="Shared with me"
        folerDescription="Files and folders shared with you by others."
        canUpload={false}
        canCreate={false}
      />
      <section className="mt-6" aria-label="Shared Folders">
        <FolderList mode="shared" />
      </section>
    </div>
  );
}
