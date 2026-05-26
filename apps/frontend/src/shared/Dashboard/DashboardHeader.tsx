import { CreateFolderDialog } from '@/shared/Dashboard/CreateFolderDialog';
import { UploadFileButton } from './UploadFileButton';
import { DashboardToolbar } from './DashboardToolbar';

interface DashboardHeaderProps {
  folderId: string | number;
  folderName: string;
  folerDescription: string;
  canUpload: boolean;
  canCreate: boolean;
}

const DashboardHeader = ({
  folderId,
  folderName = 'My Files',
  folerDescription = 'Folders in your personal drive.',
  canUpload = false,
  canCreate = false,
}: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex justify-between items-start w-full sm:w-auto">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
            {folderName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {folerDescription}
          </p>
        </div>
        <div className="sm:hidden shrink-0 ml-4">
          <DashboardToolbar />
        </div>
      </div>

      {canCreate || canUpload ? (
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <DashboardToolbar />
          </div>
          <div className="flex gap-2 sm:ml-2">
            {canCreate && (
              <CreateFolderDialog
                canCreate={true}
                parentFolderId={
                  typeof folderId === 'string' && folderId.length > 0
                    ? folderId
                    : undefined
                }
              />
            )}
            {canUpload && (
              <UploadFileButton folderId={folderId} canUpload={canUpload} />
            )}
          </div>
        </div>
      ) : (
        <div className="hidden sm:flex items-center gap-2">
          <DashboardToolbar />
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;
