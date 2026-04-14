import { useAuth } from '@clerk/react';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import { CreateFolderDialog } from './components/CreateFolderDialog';
import { FolderList } from './components/FolderList';

export default function AllFiles() {
  const { isSignedIn } = useAuth();
  const meQuery = useQuery({
    ...trpc.user.me.queryOptions(),
    enabled: Boolean(isSignedIn),
  });

  return (
    <div className="w-full rounded-lg bg-background p-4 shadow-sm ring-1 ring-border/60">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">All Files</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Folders in your drive root.
          </p>
        </div>
        <CreateFolderDialog canCreate={Boolean(meQuery.data)} />
      </div>
      <section className="mt-6" aria-label="Folders">
        <FolderList />
      </section>
    </div>
  );
}
