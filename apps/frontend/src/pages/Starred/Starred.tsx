import DashboardHeader from '@/shared/Dashboard/DashboardHeader';
import { trpc } from '@/utils/trpc';
import { useQuery } from '@tanstack/react-query';
import Loader from '@/shared/PageLoader/Loader';
import { FolderContents } from '@/pages/SingleFolder/components/FolderContents';

export default function Starred() {
  const {
    data: folders,
    isLoading: isFoldersLoading,
    refetch: refetchFolders,
  } = useQuery(trpc.folder.getStarred.queryOptions());

  const {
    data: files,
    isLoading: isFilesLoading,
    refetch: refetchFiles,
  } = useQuery(trpc.file.getStarred.queryOptions());

  const isLoading = isFoldersLoading || isFilesLoading;

  const handleRefetch = () => {
    void refetchFolders();
    void refetchFiles();
  };

  return (
    <div className="w-full rounded-lg bg-background p-4 shadow-sm ring-1 ring-border/60">
      <DashboardHeader
        folderId={0}
        folderName="Starred"
        folerDescription="Your favorite folders and files for quick access."
        canUpload={false}
        canCreate={false}
      />
      <div className="mt-8">
        {isLoading ? (
          <div className="py-10">
            <Loader />
          </div>
        ) : (
          <section aria-label="Starred Items">
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
              emptyMessage="No starred folders or files yet."
            />
          </section>
        )}
      </div>
    </div>
  );
}
