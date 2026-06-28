import { useQueries } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { useUser } from '@clerk/react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/utils/trpc';
import { FolderContents } from './components/FolderContents';
import DashboardHeader from '@/shared/Dashboard/DashboardHeader';
import Loader from '@/shared/PageLoader/Loader';
import { FolderDropZone } from '@/shared/Dashboard/FolderDropZone';

export default function SingleFolder() {
  const { user } = useUser();
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
      <div className="w-full ">
        <p className="text-sm text-destructive font-medium">{errorMsg}</p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link to="/dashboard/my-files">Back to My files</Link>
        </Button>
      </div>
    );
  }

  const isOwner = folder.ownerId === user?.id;

  // Build the folder description respecting privacy choices
  let folderDescription = `Folders and files in ${folder.name}`;
  if (!isOwner) {
    const ownerDetails = [];
    if (folder.ownerName) ownerDetails.push(folder.ownerName);
    if (folder.ownerEmail) ownerDetails.push(folder.ownerEmail);

    if (ownerDetails.length > 0) {
      folderDescription = `Shared by ${ownerDetails.join(' (')}${ownerDetails.length > 1 ? ')' : ''}`;
    } else {
      folderDescription = `Shared by Anonymous user`;
    }
  }

  return (
    <FolderDropZone folderId={folder.id} canUpload={folder.canUpload}>
      <div className="w-full">
        <DashboardHeader
          folderId={folder.id}
          folderName={folder.name}
          folerDescription={folderDescription}
          canUpload={folder.canUpload}
          canCreate={isOwner}
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
    </FolderDropZone>
  );
}
