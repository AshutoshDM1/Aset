import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Copy,
  UserPlus,
  Globe,
  Mail,
  Check,
  Loader2,
  Shield,
  Eye,
  Edit2,
  X,
  Users,
  Loader,
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { trpc } from '@/utils/trpc';
import { cn } from '@/lib/utils';

type ShareDialogProps = {
  id: string;
  folderName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const AVATAR_COLORS = [
  'from-indigo-500 to-purple-500',
  'from-pink-500 to-rose-500',
  'from-cyan-500 to-blue-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-violet-500 to-fuchsia-500',
];

function getGradientForEmail(email: string) {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

function getInitials(email: string) {
  const cleanEmail = email.trim();
  if (!cleanEmail) return '??';
  const parts = cleanEmail.split('@')[0].split(/[\._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + (parts[1][0] || '')).toUpperCase();
  }
  return cleanEmail.slice(0, 2).toUpperCase();
}

export function ShareDialog({
  id,
  folderName,
  open,
  onOpenChange,
}: ShareDialogProps) {
  const queryClient = useQueryClient();
  const [emailInput, setEmailInput] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'editor'>('viewer');
  const [copiedLink, setCopiedLink] = useState(false);

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
      canUpload: inviteRole === 'editor',
    });
  };

  // Toggle specific user's upload role
  const handleToggleUserUpload = (
    userEmail: string,
    role: 'viewer' | 'editor',
  ) => {
    addShareMutation.mutate({
      folderId: id,
      email: userEmail,
      canUpload: role === 'editor',
    });
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/dashboard/folder/${id}`;
    void navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast.success('Public link copied to clipboard');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const isPending =
    updateSettingsMutation.isPending ||
    addShareMutation.isPending ||
    removeShareMutation.isPending;

  const [isPendingDelay, setIsPendingDelay] = useState(isPending);

  useEffect(() => {
    if (isPending) {
      setIsPendingDelay(true);
    } else {
      setTimeout(() => {
        setIsPendingDelay(false);
      }, 1000);
    }
  }, [isPending]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="w-[calc(100vw-2rem)] sm:max-w-md md:max-w-lg p-4 sm:p-6 rounded-3xl overflow-hidden"
      >
        {isPendingDelay && (
          <div className="absolute z-10 inset-0 bg-black/15 backdrop-blur-sm flex justify-center items-center">
            <Loader className="size-6 animate-spin text-primary shrink-0" />
          </div>
        )}

        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold flex items-center justify-between gap-2">
            <span className="truncate">Share "{folderName}"</span>
          </DialogTitle>
          <DialogDescription>
            Configure access settings and collaborate with others on this
            folder.
          </DialogDescription>
        </DialogHeader>

        {isLoading || !settings ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground text-sm">
            <Loader2 className="size-8 animate-spin text-primary" />
            <span>Retrieving sharing configurations...</span>
          </div>
        ) : (
          <div className="relative pt-2">
            <Tabs defaultValue="people" className="w-full">
              <TabsList className="w-full grid grid-cols-2 mb-6">
                <TabsTrigger
                  value="people"
                  className="flex items-center justify-center"
                >
                  <Users className="size-4 mr-2" />
                  People & Access
                </TabsTrigger>
                <TabsTrigger
                  value="link"
                  className="flex items-center justify-center"
                >
                  <Globe className="size-4 mr-2" />
                  Link & Privacy
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: PEOPLE & DIRECT ACCESS */}
              <TabsContent
                value="people"
                className="space-y-5 focus:outline-hidden"
              >
                {/* Invite Section */}
                <form onSubmit={handleAddShare} className="space-y-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        type="email"
                        required
                        placeholder="Enter collaborator's email..."
                        className="pl-9 h-10 text-sm w-full rounded-xl bg-input/20 border-border/80 focus-visible:ring-primary/30"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        disabled={isPending}
                      />
                    </div>
                    <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                      <Select
                        value={inviteRole}
                        onValueChange={(val) =>
                          setInviteRole(val as 'viewer' | 'editor')
                        }
                        disabled={isPending}
                      >
                        <SelectTrigger
                          size="default"
                          className="h-10 flex-1 sm:w-28 rounded-xl bg-input/20 border-border/80 text-xs px-3"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">
                            <span className="flex items-center gap-1.5">
                              <Eye className="size-3.5 text-muted-foreground" />
                              Viewer
                            </span>
                          </SelectItem>
                          <SelectItem value="editor">
                            <span className="flex items-center gap-1.5">
                              <Edit2 className="size-3.5 text-primary" />
                              Editor
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        type="submit"
                        className="h-10 flex-1 sm:flex-initial rounded-xl px-4 font-semibold shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all gap-1.5 shrink-0"
                        disabled={isPending || !emailInput.trim()}
                      >
                        <UserPlus className="size-4" />
                        Invite
                      </Button>
                    </div>
                  </div>
                </form>

                {/* People List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      People with Access
                    </h4>
                    <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-semibold">
                      {settings.shares.length + 1}{' '}
                      {settings.shares.length + 1 === 1 ? 'person' : 'people'}
                    </span>
                  </div>

                  <div className="max-h-56 overflow-y-auto divide-y divide-border/40 rounded-xl border border-border/80 bg-background shadow-inner">
                    {/* Owner Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 sm:gap-4 hover:bg-muted/5 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar
                          size="default"
                          className="border shadow-xs shrink-0"
                        >
                          <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-500 text-white font-bold text-xs uppercase select-none">
                            OW
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground flex items-center gap-1.5 flex-wrap">
                            Workspace Owner
                            <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold select-none">
                              Owner
                            </span>
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate leading-normal">
                            Full root workspace permissions
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground font-semibold bg-muted px-2.5 py-1 rounded-xl select-none self-start sm:self-auto">
                        Owner
                      </span>
                    </div>

                    {/* Shared Collaborators */}
                    {settings.shares.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                        <p className="text-xs text-muted-foreground font-medium">
                          No direct collaborators yet
                        </p>
                        <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                          Invite people by email to collaborate securely.
                        </p>
                      </div>
                    ) : (
                      settings.shares.map((share) => {
                        const initials = getInitials(share.email);
                        const gradient = getGradientForEmail(share.email);

                        return (
                          <div
                            key={share.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 sm:gap-4 hover:bg-muted/5 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Avatar
                                size="default"
                                className="border shadow-2xs shrink-0 select-none"
                              >
                                <AvatarFallback
                                  className={cn(
                                    'text-white font-bold text-xs uppercase bg-linear-to-br',
                                    gradient,
                                  )}
                                >
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">
                                  {share.email}
                                </p>
                                <p className="text-[11px] text-muted-foreground leading-normal">
                                  Shared collaborator
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto border-t sm:border-t-0 border-border/20 pt-2 sm:pt-0 shrink-0">
                              <Select
                                value={share.canUpload ? 'editor' : 'viewer'}
                                onValueChange={(val) =>
                                  handleToggleUserUpload(
                                    share.email,
                                    val as 'viewer' | 'editor',
                                  )
                                }
                                disabled={isPending}
                              >
                                <SelectTrigger
                                  size="sm"
                                  className="h-8 flex-1 sm:flex-initial sm:w-24 rounded-xl bg-muted/40 border-muted text-xs px-2"
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="viewer">
                                    <span className="flex items-center gap-1.5">
                                      <Eye className="size-3 text-muted-foreground" />
                                      Viewer
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="editor">
                                    <span className="flex items-center gap-1.5">
                                      <Edit2 className="size-3 text-primary" />
                                      Editor
                                    </span>
                                  </SelectItem>
                                </SelectContent>
                              </Select>

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors shrink-0"
                                onClick={() =>
                                  removeShareMutation.mutate({
                                    folderId: id,
                                    shareId: share.id,
                                  })
                                }
                                disabled={isPending}
                              >
                                <X className="size-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* TAB 2: LINK SHARING & PRIVACY */}
              <TabsContent
                value="link"
                className="space-y-4 focus:outline-hidden"
              >
                {/* Public Access Card */}
                <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-4 relative overflow-hidden group">
                  <div className="absolute -inset-px bg-linear-to-r from-primary/5 via-primary/0 to-primary/5 opacity-50 rounded-xl pointer-events-none" />

                  <div className="flex items-start justify-between gap-4 relative">
                    <div className="flex gap-3 min-w-0">
                      <div
                        className={cn(
                          'rounded-lg transition-all duration-300 mt-1 shrink-0',
                          settings.isPublic
                            ? 'text-primary'
                            : 'text-muted-foreground',
                        )}
                      >
                        <Globe className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm">
                          Public link sharing
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-normal max-w-xs">
                          Anyone with this unique link can view and download
                          files inside this folder.
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.isPublic}
                      onCheckedChange={handleTogglePublic}
                      disabled={isPending}
                      className="mt-1 shrink-0"
                    />
                  </div>

                  {settings.isPublic && (
                    <div className="pt-4 border-t border-border/40 space-y-4 relative animate-in fade-in slide-in-from-top-3 duration-300">
                      {/* Public Role Option */}
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <Label
                          htmlFor="public-upload"
                          className="text-xs font-semibold text-muted-foreground cursor-pointer"
                        >
                          Public Access Rights
                        </Label>
                        <Select
                          value={settings.publicCanUpload ? 'upload' : 'view'}
                          onValueChange={(val) =>
                            handleTogglePublicUpload(val === 'upload')
                          }
                          disabled={isPending}
                        >
                          <SelectTrigger
                            size="sm"
                            className="h-8 w-full sm:w-48 rounded-xl bg-background border-border text-xs px-2.5"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="view">
                              <span className="flex items-center gap-1.5">
                                <Eye className="size-3 text-muted-foreground" />
                                Anyone can view/download
                              </span>
                            </SelectItem>
                            <SelectItem value="upload">
                              <span className="flex items-center gap-1.5">
                                <UserPlus className="size-3 text-primary" />
                                Anyone can view & upload
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Copy Link Input block */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 bg-background border border-border/80 rounded-xl p-1.5 shadow-xs">
                        <Input
                          readOnly
                          className="text-xs bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-8 font-mono select-all flex-1 text-muted-foreground min-w-0 w-full text-center sm:text-left px-2"
                          value={`${window.location.origin}/dashboard/folder/${id}`}
                        />
                        <Button
                          size="sm"
                          onClick={handleCopyLink}
                          className={cn(
                            'h-8 px-4 rounded-lg transition-all duration-300 font-semibold text-xs shrink-0 w-full sm:w-auto',
                            copiedLink
                              ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                              : 'bg-primary text-primary-foreground hover:scale-[1.02] shadow-xs',
                          )}
                        >
                          {copiedLink ? (
                            <span className="flex items-center gap-1.5 justify-center w-full animate-in fade-in zoom-in-95 duration-200">
                              <Check className="size-3 text-emerald-500 stroke-3" />
                              Copied!
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 justify-center w-full">
                              <Copy className="size-3" />
                              Copy Link
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Identity Settings */}
                <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3.5 relative overflow-hidden">
                  <div className="flex items-center gap-2">
                    <Shield className="size-4 text-muted-foreground" />
                    <h4 className="text-sm font-semibold">
                      Identity Privacy Settings
                    </h4>
                  </div>

                  <p className="text-xs text-muted-foreground leading-normal">
                    Control what profile information is displayed to external
                    users accessing this folder via public links.
                  </p>

                  <div className="space-y-3 pt-2 border-t border-border/40">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="text-xs font-semibold flex items-center gap-1.5">
                          Display my full name
                        </Label>
                        <p className="text-[10px] text-muted-foreground leading-normal">
                          Allows other users to see your real profile name.
                        </p>
                      </div>
                      <Switch
                        size="sm"
                        checked={settings.showOwnerName}
                        onCheckedChange={handleToggleOwnerName}
                        disabled={isPending}
                        className="shrink-0"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="text-xs font-semibold flex items-center gap-1.5">
                          Display my email address
                        </Label>
                        <p className="text-[10px] text-muted-foreground leading-normal">
                          Allows other users to contact you directly.
                        </p>
                      </div>
                      <Switch
                        size="sm"
                        checked={settings.showOwnerEmail}
                        onCheckedChange={handleToggleOwnerEmail}
                        disabled={isPending}
                        className="shrink-0"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
