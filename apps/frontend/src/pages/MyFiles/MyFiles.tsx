import DashboardHeader from '@/shared/Dashboard/DashboardHeader';
import { FolderList } from '@/shared/Dashboard/FolderList';

export default function MyFiles() {
  return (
    <div className="w-full">
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
