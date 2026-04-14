import { useAuth } from '@clerk/react';
import { useQuery } from '@tanstack/react-query';
import { Link, Navigate, useParams } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/utils/trpc';
import { CreateFolderDialog } from '../AllFiles/components/CreateFolderDialog';
import { UploadFileButton } from './components/UploadFileButton';
import { FolderContents } from './components/FolderContents';

export default function SingleFolder() {
  const { folderId } = useParams<{ folderId: string }>();
  const id = Number(folderId);
  const { isSignedIn } = useAuth();

  const meQuery = useQuery({
    ...trpc.user.me.queryOptions(),
    enabled: Boolean(isSignedIn),
  });

  const folderQuery = useQuery({
    ...trpc.folder.getById.queryOptions({ id }),
    enabled: Number.isInteger(id) && id > 0 && Boolean(isSignedIn),
    retry: false,
  });

  if (!folderId || !Number.isInteger(id) || id < 1) {
    return <Navigate to="/dashboard" replace />;
  }

  if (folderQuery.isError) {
    return (
      <div className="w-full rounded-lg bg-background p-4 shadow-sm ring-1 ring-border/60">
        <p className="text-sm text-destructive">{folderQuery.error.message}</p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link to="/dashboard">Back to All files</Link>
        </Button>
      </div>
    );
  }

  const folder = folderQuery.data;

  return (
    <div className="w-full rounded-lg bg-background p-4 shadow-sm ring-1 ring-border/60">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Button variant="ghost" size="sm" className="-ml-2 mb-2" asChild>
            <Link
              to={
                folder
                  ? folder.parentId != null
                    ? `/dashboard/folder/${folder.parentId}`
                    : '/dashboard'
                  : '/dashboard'
              }
            >
              <ChevronLeft className="size-4" data-icon="inline-start" />
              {folder?.parentId != null ? 'Parent folder' : 'All files'}
            </Link>
          </Button>
          {folderQuery.isLoading ? (
            <div className="h-8 w-48 animate-pulse rounded-md bg-muted/60" />
          ) : folder ? (
            <>
              <h1 className="text-2xl font-semibold tracking-tight">
                {folder.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Everything in this folder in one place.
              </p>
            </>
          ) : null}
        </div>
        {folder ? (
          <div className="flex flex-wrap items-center gap-2">
            <CreateFolderDialog
              canCreate={Boolean(meQuery.data)}
              parentFolderId={folder.id}
            />
            <UploadFileButton
              folderId={folder.id}
              canUpload={Boolean(meQuery.data)}
            />
          </div>
        ) : null}
      </div>
      {folder ? (
        <section className="mt-6" aria-label="Folder contents">
          <FolderContents folderId={folder.id} />
        </section>
      ) : null}
    </div>
  );
}
