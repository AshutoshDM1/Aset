import DashboardHeader from '@/shared/Dashboard/DashboardHeader';
import { FileList } from '@/shared/Dashboard/FileList';

export default function Recent() {
  return (
    <div className="w-full ">
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
