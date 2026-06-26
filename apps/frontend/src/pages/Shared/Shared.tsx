import DashboardHeader from '@/shared/Dashboard/DashboardHeader';
import { FolderList } from '@/shared/Dashboard/FolderList';

export default function Shared() {
  return (
    <div className="w-full ">
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
