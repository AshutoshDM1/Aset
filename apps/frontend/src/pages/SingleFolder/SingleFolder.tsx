import { useQueries } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { trpc } from '@/utils/trpc';
import { FolderContents } from './components/FolderContents';
import DashboardHeader from '@/shared/Dashboard/DashboardHeader';
import Loader from '@/shared/PageLoader/Loader';

export default function SingleFolder() {
  const { folderId } = useParams<{ folderId: string }>();
  const id = folderId ?? '';
  const isValidId = typeof id === 'string' && id.length > 0;

  const [folderQuery, foldersQuery, filesQuery] = useQueries({
    queries: [
      {
        ...trpc.folder.getById.queryOptions({ id }),
        enabled: isValidId,
        retry: false,
      },
      {
        ...trpc.folder.list.queryOptions({ parentId: id }),
        enabled: isValidId,
      },
      {
        ...trpc.file.listByFolder.queryOptions({ folderId: id }),
        enabled: isValidId,
      },
    ],
  });

  const isLoading =
    folderQuery.isPending || foldersQuery.isPending || filesQuery.isPending;

  const isError =
    folderQuery.isError || foldersQuery.isError || filesQuery.isError;

  if (isLoading) {
    return (
      <div className="py-10">
        <Loader />
      </div>
    );
  }

  const folder = folderQuery.data;

  if (isError || !folder) {
    let errorMsg = 'Something went wrong';
    if (folderQuery.error) {
      errorMsg = folderQuery.error.message;
    } else if (foldersQuery.error) {
      errorMsg = foldersQuery.error.message;
    } else if (filesQuery.error) {
      errorMsg = filesQuery.error.message;
    } else if (!folder) {
      errorMsg = 'Folder not found';
    }

    return (
      <div className="w-full rounded-lg bg-background p-4 shadow-sm ring-1 ring-border/60">
        <p className="text-sm text-destructive font-medium">{errorMsg}</p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link to="/dashboard/my-files">Back to My files</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg bg-background p-4 shadow-sm ring-1 ring-border/60">
      <DashboardHeader
        folderId={folder.id}
        folderName={folder.name}
        folerDescription={`Folders and files in ${folder.name}`}
        canUpload={true}
        canCreate={true}
      />
      <section className="mt-6" aria-label="Folder contents">
        <FolderContents
          folders={foldersQuery.data ?? []}
          files={filesQuery.data ?? []}
          onRefetch={() => {
            void foldersQuery.refetch();
            void filesQuery.refetch();
          }}
        />
      </section>
    </div>
  );
}
