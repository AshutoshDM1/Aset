import DashboardHeader from '@/shared/Dashboard/DashboardHeader';
import { FolderList } from '@/shared/Dashboard/FolderList';

export default function Trash() {
  return (
    <div className="w-full rounded-lg bg-background p-4 shadow-sm ring-1 ring-border/60">
      <DashboardHeader
        folderId={0}
        folderName="Trash"
        folerDescription="Deleted folders that can be restored or permanently removed."
        canUpload={false}
        canCreate={false}
      />
      <section className="mt-6" aria-label="Deleted Folders">
        <FolderList mode="trash" />
      </section>
    </div>
  );
}
