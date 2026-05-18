import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Copy,
  Trash2,
  UserPlus,
  Globe,
  User,
  Mail,
  Check,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { trpc } from '@/utils/trpc';

type ShareDialogProps = {
  id: string;
  folderName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ShareDialog({
  id,
  folderName,
  open,
  onOpenChange,
}: ShareDialogProps) {
  const queryClient = useQueryClient();
  const [emailInput, setEmailInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Fetch current share settings
  const {
    data: settings,
    isLoading,
    refetch,
  } = useQuery({
    ...trpc.folder.getShareSettings.queryOptions({ id }),
    enabled: open,
  });

  // Mutate general settings
  const updateSettingsMutation = useMutation({
    ...trpc.folder.updateShareSettings.mutationOptions(),
    onSuccess: () => {
      toast.success('Share settings updated');
      void queryClient.invalidateQueries(
        trpc.folder.getShareSettings.queryFilter({ id }),
      );
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || 'Could not update settings');
    },
  });

  // Add specific share
  const addShareMutation = useMutation({
    ...trpc.folder.addShare.mutationOptions(),
    onSuccess: () => {
      toast.success('Folder shared successfully');
      setEmailInput('');
      void queryClient.invalidateQueries(
        trpc.folder.getShareSettings.queryFilter({ id }),
      );
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || 'Could not share folder');
    },
  });

  // Remove specific share
  const removeShareMutation = useMutation({
    ...trpc.folder.removeShare.mutationOptions(),
    onSuccess: () => {
      toast.success('Access revoked');
      void queryClient.invalidateQueries(
        trpc.folder.getShareSettings.queryFilter({ id }),
      );
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || 'Could not revoke access');
    },
  });

  // Toggles for general options
  const handleTogglePublic = (checked: boolean) => {
    if (!settings) return;
    updateSettingsMutation.mutate({
      id,
      isPublic: checked,
      publicCanUpload: settings.publicCanUpload,
      showOwnerName: settings.showOwnerName,
      showOwnerEmail: settings.showOwnerEmail,
    });
  };

  const handleTogglePublicUpload = (checked: boolean) => {
    if (!settings) return;
    updateSettingsMutation.mutate({
      id,
      isPublic: settings.isPublic,
      publicCanUpload: checked,
      showOwnerName: settings.showOwnerName,
      showOwnerEmail: settings.showOwnerEmail,
    });
  };

  const handleToggleOwnerName = (checked: boolean) => {
    if (!settings) return;
    updateSettingsMutation.mutate({
      id,
      isPublic: settings.isPublic,
      publicCanUpload: settings.publicCanUpload,
      showOwnerName: checked,
      showOwnerEmail: settings.showOwnerEmail,
    });
  };

  const handleToggleOwnerEmail = (checked: boolean) => {
    if (!settings) return;
    updateSettingsMutation.mutate({
      id,
      isPublic: settings.isPublic,
      publicCanUpload: settings.publicCanUpload,
      showOwnerName: settings.showOwnerName,
      showOwnerEmail: checked,
    });
  };

  // Add share form submit
  const handleAddShare = (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailInput.trim();
    if (!email) return;
    addShareMutation.mutate({
      folderId: id,
      email,
      canUpload: false,
    });
  };

  // Toggle specific user's upload role
  const handleToggleUserUpload = (userEmail: string, canUpload: boolean) => {
    addShareMutation.mutate({
      folderId: id,
      email: userEmail,
      canUpload,
    });
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/dashboard/folder/${id}`;
    void navigator.clipboard.writeText(link);
    setIsCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const isPending =
    updateSettingsMutation.isPending ||
    addShareMutation.isPending ||
    removeShareMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md md:max-w-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            Share "{folderName}"
          </DialogTitle>
          <DialogDescription>
            Configure who can view and upload files inside this folder.
          </DialogDescription>
        </DialogHeader>

        {isLoading || !settings ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground text-sm">
            <Loader2 className="size-8 animate-spin text-primary" />
            Loading settings...
          </div>
        ) : (
          <div className="relative space-y-6 pt-4">
            {isPending && (
              <div className="absolute inset-0 bg-background/65 backdrop-blur-[1px] z-50 flex flex-col items-center justify-center gap-2 text-sm font-semibold text-muted-foreground select-none">
                <Loader2 className="size-7 animate-spin text-primary" />
                <span>Updating settings...</span>
              </div>
            )}
            {/* Public Link Section */}
            <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="rounded-lg p-2 bg-primary/10 text-primary">
                    <Globe className="size-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">
                      Public link sharing
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Anyone on the internet with the link can view.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.isPublic}
                  onCheckedChange={handleTogglePublic}
                  disabled={isPending}
                />
              </div>

              {settings.isPublic && (
                <div className="pt-2 border-t border-border/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="public-upload"
                      className="text-xs font-medium text-muted-foreground cursor-pointer"
                    >
                      Allow public uploads
                    </Label>
                    <Switch
                      id="public-upload"
                      size="sm"
                      checked={settings.publicCanUpload}
                      onCheckedChange={handleTogglePublicUpload}
                      disabled={isPending}
                    />
                  </div>

                  <div className="flex gap-2 items-center mt-2">
                    <Input
                      readOnly
                      className="text-xs bg-muted border-border/80 h-9"
                      value={`${window.location.origin}/dashboard/folder/${id}`}
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      className="size-9 shrink-0"
                      onClick={handleCopyLink}
                    >
                      {isCopied ? (
                        <Check className="size-4 text-emerald-500" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Owner Identity Settings */}
            <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Identity privacy
              </h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <User className="size-4 text-muted-foreground" />
                  Show my name to other people
                </div>
                <Switch
                  size="sm"
                  checked={settings.showOwnerName}
                  onCheckedChange={handleToggleOwnerName}
                  disabled={isPending}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Mail className="size-4 text-muted-foreground" />
                  Show my email to other people
                </div>
                <Switch
                  size="sm"
                  checked={settings.showOwnerEmail}
                  onCheckedChange={handleToggleOwnerEmail}
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Specific User Invite Form */}
            <form onSubmit={handleAddShare} className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Invite people
              </h4>
              <div className="flex gap-2">
                <Input
                  type="email"
                  required
                  placeholder="Enter email address"
                  className="h-9 text-sm flex-1"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  disabled={isPending}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 shrink-0 gap-1.5"
                  disabled={isPending || !emailInput.trim()}
                >
                  <UserPlus className="size-4" />
                  Invite
                </Button>
              </div>
            </form>

            {/* List of Shares */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                People with access
              </h4>
              {settings.shares.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-2">
                  Not shared with anyone specifically yet.
                </p>
              ) : (
                <div className="max-h-44 overflow-y-auto divide-y divide-border/40 rounded-lg border border-border/60 bg-background">
                  {settings.shares.map((share) => (
                    <div
                      key={share.id}
                      className="flex items-center justify-between p-3 gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {share.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={share.canUpload}
                            onChange={(e) =>
                              handleToggleUserUpload(
                                share.email,
                                e.target.checked,
                              )
                            }
                            className="rounded border-border text-primary focus:ring-primary size-3.5 cursor-pointer"
                            disabled={isPending}
                          />
                          Can Upload
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive hover:bg-destructive/10 rounded-full"
                          onClick={() =>
                            removeShareMutation.mutate({
                              folderId: id,
                              shareId: share.id,
                            })
                          }
                          disabled={isPending}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
