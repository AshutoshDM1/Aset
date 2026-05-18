import { CreateFolderDialog } from '@/shared/Dashboard/CreateFolderDialog';
import { UploadFileButton } from './UploadFileButton';
import { ViewToggle } from './ViewToggle';

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
      <div>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
          {folderName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{folerDescription}</p>
      </div>
      <div className="flex items-center gap-2">
        <ViewToggle />
        <div className="flex gap-2 ml-2">
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
    </div>
  );
};

export default DashboardHeader;
