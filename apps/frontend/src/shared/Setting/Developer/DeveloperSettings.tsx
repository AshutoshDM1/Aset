import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Copy,
  Trash2,
  Key,
  Check,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { trpc } from '@/utils/trpc';

export function DeveloperSettings() {
  const [name, setName] = useState('');
  const [folderId, setFolderId] = useState('');
  const [copiedField, setCopiedField] = useState<'key' | 'secret' | null>(null);

  // Store newly generated credentials to show exactly once
  const [generatedKey, setGeneratedKey] = useState<{
    keyId: string;
    secretKey: string;
    name: string;
  } | null>(null);

  // Queries & Mutations
  const {
    data: apiKeys,
    refetch,
    isPending,
  } = useQuery(trpc.apiKey.list.queryOptions());
  const { data: folders } = useQuery(trpc.folder.listAll.queryOptions());

  const generateKey = useMutation({
    ...trpc.apiKey.create.mutationOptions(),
    onSuccess: (data) => {
      setGeneratedKey(data);
      refetch();
      setName('');
      setFolderId('');
      toast.success('API Key generated successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to generate API key');
    },
  });

  const deleteKey = useMutation({
    ...trpc.apiKey.delete.mutationOptions(),
    onSuccess: () => {
      refetch();
      toast.success('API Key revoked successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to revoke API key');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a key name');
      return;
    }
    generateKey.mutate({
      name: name.trim(),
      folderId: folderId || null,
    });
  };

  const copyToClipboard = (text: string, field: 'key' | 'secret') => {
    void navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold flex items-center gap-2">
          <Key className="h-4.5 w-4.5 text-primary" />
          Developer SDK Setup
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Generate API keys to connect external servers programmatically using
          the ASET Node.js SDK.
        </p>
      </div>

      {/* Generate API Key Form */}
      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-4 p-4 rounded-xl border border-border/60 bg-muted/10"
      >
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Create New API Key
        </h3>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <div className="flex-1 flex flex-col gap-1.5 min-w-0">
            <Label htmlFor="key-name" className="text-xs">
              Key Name
            </Label>
            <Input
              id="key-name"
              placeholder="e.g. Production server"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="flex-1 flex flex-col gap-1.5 min-w-0">
            <Label htmlFor="key-folder" className="text-xs">
              Restricted Folder
            </Label>
            <Select
              value={folderId || 'unrestricted'}
              onValueChange={(val) =>
                setFolderId(val === 'unrestricted' ? '' : val)
              }
            >
              <SelectTrigger
                id="key-folder"
                className="w-full h-9 text-xs justify-between cursor-pointer"
              >
                <SelectValue placeholder="Full Drive Access (Unrestricted)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unrestricted">
                  Full Drive Access (Unrestricted)
                </SelectItem>
                {folders?.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    Only Folder: {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            size="sm"
            className="cursor-pointer h-9 px-4 font-medium text-xs gap-1.5 shrink-0"
            disabled={generateKey.isPending}
          >
            Generate Key
          </Button>
        </div>
      </form>

      {/* Existing Keys */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Active API Keys
        </h3>

        {isPending ? (
          <div className="text-xs text-muted-foreground p-4 text-center border border-dashed rounded-xl">
            Loading keys...
          </div>
        ) : apiKeys && apiKeys.length > 0 ? (
          <div className="border border-border/50 rounded-xl overflow-hidden bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Public Key ID</TableHead>
                  <TableHead className="text-xs">Scope / Folder</TableHead>
                  <TableHead className="text-xs w-[80px] text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="text-xs font-medium">
                      {key.name}
                    </TableCell>
                    <TableCell className="text-xs font-mono select-all">
                      {key.keyId}
                    </TableCell>
                    <TableCell className="text-xs">
                      {key.folder ? (
                        <span className="inline-flex items-center gap-1 text-primary bg-primary/5 px-2 py-0.5 rounded-full font-medium">
                          {key.folder.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Full Access
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer"
                        disabled={deleteKey.isPending}
                        onClick={() => {
                          if (
                            confirm(
                              'Are you sure you want to revoke this API key? Extenal integrations using this key will immediately fail.',
                            )
                          ) {
                            deleteKey.mutate({ id: key.id });
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-border/80 rounded-xl bg-muted/5">
            <Key className="h-8 w-8 text-muted-foreground/45 mb-2" />
            <p className="text-xs font-medium">No API keys generated yet</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Create an API key above to start uploading files programmatically.
            </p>
          </div>
        )}
      </div>

      {/* Dialog showing newly generated key (ONCE) */}
      <Dialog
        open={!!generatedKey}
        onOpenChange={(open) => {
          if (!open) setGeneratedKey(null);
        }}
      >
        <DialogContent className="sm:max-w-md p-6 border border-border/60 rounded-2xl shadow-xl bg-background">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
              API Key Generated Successfully
            </DialogTitle>
            <DialogDescription className="sr-only">
              Credentials are displayed here once.
            </DialogDescription>
          </DialogHeader>

          <Alert
            variant="destructive"
            className="bg-destructive/10 text-destructive border-destructive/20 my-2"
          >
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle className="text-xs font-semibold">
              Important Security Warning
            </AlertTitle>
            <AlertDescription className="text-[11px] leading-relaxed mt-1">
              Copy this <strong>Secret Key</strong> now. For security reasons,
              we do not store this key in plaintext and you{' '}
              <strong>cannot see it again</strong>.
            </AlertDescription>
          </Alert>

          <div className="space-y-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Public Key ID (Key ID)
              </Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={generatedKey?.keyId || ''}
                  className="h-8 text-xs font-mono bg-muted/20 select-all"
                />
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 cursor-pointer"
                  onClick={() =>
                    copyToClipboard(generatedKey?.keyId || '', 'key')
                  }
                >
                  {copiedField === 'key' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Private Secret Key (API Secret)
              </Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={generatedKey?.secretKey || ''}
                  className="h-8 text-xs font-mono bg-muted/20 select-all border-amber-500/20"
                />
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 cursor-pointer"
                  onClick={() =>
                    copyToClipboard(generatedKey?.secretKey || '', 'secret')
                  }
                >
                  {copiedField === 'secret' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              size="sm"
              className="h-8 px-4 text-xs font-medium cursor-pointer"
              onClick={() => setGeneratedKey(null)}
            >
              I have saved the Secret
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
