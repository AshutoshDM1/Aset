import DashboardHeader from '@/shared/Dashboard/DashboardHeader';
import { trpc } from '@/utils/trpc';
import { useQuery } from '@tanstack/react-query';
import Loader from '@/shared/PageLoader/Loader';
import { FolderContents } from '@/pages/SingleFolder/components/FolderContents';

export default function Trash() {
  const {
    data: folders,
    isLoading: isFoldersLoading,
    refetch: refetchFolders,
  } = useQuery(trpc.folder.getTrash.queryOptions());

  const {
    data: files,
    isLoading: isFilesLoading,
    refetch: refetchFiles,
  } = useQuery(trpc.file.getTrash.queryOptions());

  const isLoading = isFoldersLoading || isFilesLoading;

  const handleRefetch = () => {
    void refetchFolders();
    void refetchFiles();
  };

  return (
    <div className="w-full ">
      <DashboardHeader
        folderId={0}
        folderName="Trash"
        folerDescription="Deleted folders and files that can be restored or permanently removed."
        canUpload={false}
        canCreate={false}
      />
      <div className="mt-8">
        {isLoading ? (
          <div className="py-10">
            <Loader />
          </div>
        ) : (
          <section aria-label="Deleted Items">
            <FolderContents
              folders={
                folders
                  ? folders.map((f) => ({
                      ...f,
                      createdAt: new Date(f.createdAt),
                    }))
                  : []
              }
              files={
                files
                  ? files.map((f) => ({
                      ...f,
                      createdAt: new Date(f.createdAt),
                    }))
                  : []
              }
              onRefetch={handleRefetch}
              emptyMessage="No deleted folders or files."
            />
          </section>
        )}
      </div>
    </div>
  );
}
