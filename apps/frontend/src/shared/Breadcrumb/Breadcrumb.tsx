import * as React from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  Folder,
  FolderOpen,
  ChevronRight,
  Star,
  Trash2,
  Users,
  HardDrive,
  FolderTree,
} from 'lucide-react';
import { Link } from 'react-router';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface BreadcrumbItemType {
  label: string;
  href: string;
  type?: 'dashboard' | 'my-files' | 'starred' | 'trash' | 'shared' | 'folder';
  id?: string;
}

interface FolderType {
  id: string;
  name: string;
  parentId: string | null;
}

interface BreadcrumbComponentProps {
  items: BreadcrumbItemType[];
  allFolders?: FolderType[];
  className?: string;
}

const BreadcrumbComponent = ({
  items,
  allFolders,
  className,
}: BreadcrumbComponentProps) => {
  // Helpers to fetch children and siblings for interactive navigation dropdowns
  const getDropdownOptions = React.useCallback(
    (item: BreadcrumbItemType) => {
      if (!allFolders) return null;

      // 1. Dashboard
      if (item.type === 'dashboard') {
        return {
          title: 'Quick Access',
          type: 'quick-access' as const,
          options: [
            { label: 'My Files', href: '/dashboard/my-files', icon: HardDrive },
            { label: 'Shared with me', href: '/dashboard/shared', icon: Users },
            { label: 'Starred Files', href: '/dashboard/starred', icon: Star },
            { label: 'Trash', href: '/dashboard/trash', icon: Trash2 },
          ],
        };
      }

      // 2. My Files (Root folder view)
      if (item.type === 'my-files') {
        const children = allFolders.filter((f) => f.parentId === null);
        if (children.length === 0) return null;
        return {
          title: 'Folders in My Files',
          type: 'folder-list' as const,
          children: children.map((f) => ({
            label: f.name,
            href: `/dashboard/folder/${f.id}`,
            icon: Folder,
          })),
        };
      }

      // 3. Regular folder
      if (item.type === 'folder' && item.id) {
        const currentFolder = allFolders.find((f) => f.id === item.id);
        const parentId = currentFolder ? currentFolder.parentId : null;

        // Children of current folder
        const children = allFolders.filter((f) => f.parentId === item.id);
        // Siblings of current folder (same parent, excluding self)
        const siblings = allFolders.filter(
          (f) => f.parentId === parentId && f.id !== item.id,
        );

        if (children.length === 0 && siblings.length === 0) return null;

        return {
          title: currentFolder?.name || item.label,
          type: 'folder-navigation' as const,
          children: children.map((f) => ({
            label: f.name,
            href: `/dashboard/folder/${f.id}`,
            icon: Folder,
          })),
          siblings: siblings.map((f) => ({
            label: f.name,
            href: `/dashboard/folder/${f.id}`,
            icon: Folder,
          })),
        };
      }

      return null;
    },
    [allFolders],
  );

  // Render icons representing different locations
  const getSegmentIcon = (item: BreadcrumbItemType, isActive: boolean) => {
    const iconSize = 'size-4 transition-colors duration-200';
    if (item.type === 'dashboard') {
      return <Home className={iconSize} />;
    }
    if (item.type === 'my-files') {
      return <HardDrive className={iconSize} />;
    }
    if (item.type === 'starred') {
      return <Star className={iconSize} />;
    }
    if (item.type === 'trash') {
      return <Trash2 className={iconSize} />;
    }
    if (item.type === 'shared') {
      return <Users className={iconSize} />;
    }
    if (item.type === 'folder') {
      return isActive ? (
        <FolderOpen className={`${iconSize} text-primary`} />
      ) : (
        <Folder className={iconSize} />
      );
    }
    return null;
  };

  // Render list of dropdown choices
  const renderDropdownContent = (
    dropdownData: ReturnType<typeof getDropdownOptions>,
  ) => {
    if (!dropdownData) return null;

    return (
      <DropdownMenuContent
        align="start"
        className="w-56 p-1 max-h-[300px] overflow-y-auto custom-scrollbar animate-in fade-in-50 zoom-in-95 duration-100"
      >
        {dropdownData.type === 'quick-access' && (
          <>
            <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 py-1.5">
              {dropdownData.title}
            </DropdownMenuLabel>
            {dropdownData.options.map((opt) => {
              const IconComp = opt.icon;
              return (
                <DropdownMenuItem key={opt.href} asChild>
                  <Link
                    to={opt.href}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  >
                    <IconComp className="size-4 opacity-75" />
                    <span>{opt.label}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </>
        )}

        {dropdownData.type === 'folder-list' && (
          <>
            <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 py-1.5">
              {dropdownData.title}
            </DropdownMenuLabel>
            {dropdownData.children.map((child) => {
              const IconComp = child.icon;
              return (
                <DropdownMenuItem key={child.href} asChild>
                  <Link
                    to={child.href}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  >
                    <IconComp className="size-4 text-primary opacity-80" />
                    <span className="truncate">{child.label}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </>
        )}

        {dropdownData.type === 'folder-navigation' && (
          <>
            {dropdownData.children && dropdownData.children.length > 0 && (
              <div className="py-1">
                <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 py-1">
                  Subfolders
                </DropdownMenuLabel>
                {dropdownData.children.map((child) => {
                  const IconComp = child.icon;
                  return (
                    <DropdownMenuItem key={child.href} asChild>
                      <Link
                        to={child.href}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                      >
                        <IconComp className="size-4 text-primary opacity-85" />
                        <span className="truncate">{child.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </div>
            )}

            {dropdownData.children &&
              dropdownData.children.length > 0 &&
              dropdownData.siblings &&
              dropdownData.siblings.length > 0 && (
                <DropdownMenuSeparator className="my-1 bg-border/40" />
              )}

            {dropdownData.siblings && dropdownData.siblings.length > 0 && (
              <div className="py-1">
                <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 py-1">
                  Other folders here
                </DropdownMenuLabel>
                {dropdownData.siblings.map((sib) => {
                  const IconComp = sib.icon;
                  return (
                    <DropdownMenuItem key={sib.href} asChild>
                      <Link
                        to={sib.href}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                      >
                        <IconComp className="size-4 text-muted-foreground opacity-70" />
                        <span className="truncate">{sib.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </div>
            )}
          </>
        )}
      </DropdownMenuContent>
    );
  };

  // If there are no items, just show Home link in capsule
  if (!items || items.length === 0) {
    return (
      <div className={className}>
        <div className="inline-flex items-center bg-muted/30 dark:bg-muted/15 border border-border/50 rounded-xl p-1 shadow-2xs backdrop-blur-xs select-none">
          <Link
            to="/dashboard"
            className="flex items-center justify-center p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
            title="Go to Dashboard"
          >
            <Home className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  const MAX_VISIBLE_ITEMS = 3;
  const shouldCollapse = items.length > MAX_VISIBLE_ITEMS;

  const lastItem = items[items.length - 1];
  const visibleFirstCount = items.length > 3 ? 2 : 1;
  const startItems = items.slice(0, visibleFirstCount);
  const middleItems = items.slice(visibleFirstCount, -1);

  // Render individual breadcrumb path segment
  const renderItemSegment = (item: BreadcrumbItemType, isLast: boolean) => {
    const dropdownOptions = getDropdownOptions(item);

    return (
      <div className="flex items-center gap-0.5 group/segment" key={item.href}>
        {/* Link / Button block */}
        <BreadcrumbItem>
          {isLast ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-foreground font-semibold transition-all duration-200">
              {getSegmentIcon(item, true)}
              <span className="max-w-[150px] truncate">{item.label}</span>
            </span>
          ) : (
            <Link
              to={item.href}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-muted-foreground font-medium hover:text-foreground transition-all duration-200"
              title={item.label}
            >
              {getSegmentIcon(item, false)}
              <span className="max-w-[120px] truncate">{item.label}</span>
            </Link>
          )}
        </BreadcrumbItem>

        {/* Separator / Interactive Chevron trigger */}
        {!isLast && (
          <BreadcrumbItem>
            {dropdownOptions ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center justify-center size-6 rounded-md text-muted-foreground/40 hover:bg-muted/80 dark:hover:bg-muted/30 hover:text-foreground transition-all duration-200 cursor-pointer focus:outline-hidden data-[state=open]:text-foreground data-[state=open]:bg-muted/80 dark:data-[state=open]:bg-muted/30">
                  <ChevronRight className="size-3.5 transition-transform duration-200 data-[state=open]:rotate-90 group-hover/segment:text-muted-foreground" />
                </DropdownMenuTrigger>
                {renderDropdownContent(dropdownOptions)}
              </DropdownMenu>
            ) : (
              <div className="flex items-center justify-center size-6 text-muted-foreground/25">
                <ChevronRight className="size-3.5" />
              </div>
            )}
          </BreadcrumbItem>
        )}
      </div>
    );
  };

  return (
    <div className={className}>
      <Breadcrumb className="w-full">
        <ScrollArea className="w-full max-w-full">
          <BreadcrumbList className="flex items-center p-1 gap-0.5 select-none flex-nowrap whitespace-nowrap">
            {!shouldCollapse ? (
              // Render all items
              items.map((item, index) =>
                renderItemSegment(item, index === items.length - 1),
              )
            ) : (
              // Render collapsed hierarchy
              <>
                {/* Start items */}
                {startItems.map((item) => renderItemSegment(item, false))}

                {/* Collapsed Dropdown Stack */}
                <div className="flex items-center gap-0.5">
                  <BreadcrumbItem>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:bg-muted/80 dark:hover:bg-muted/30 hover:text-foreground transition-all duration-200 focus:outline-hidden cursor-pointer">
                        <FolderTree className="size-4.5" />
                        <span className="sr-only">Toggle breadcrumb menu</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56 p-1">
                        <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 py-1">
                          Skipped folders
                        </DropdownMenuLabel>
                        {middleItems.map((item) => (
                          <DropdownMenuItem key={item.href} asChild>
                            <Link
                              to={item.href}
                              className="flex items-center gap-2 w-full text-sm py-1.5 px-2 rounded-md transition-colors cursor-pointer"
                            >
                              <Folder className="size-4 text-muted-foreground" />
                              <span className="truncate">{item.label}</span>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </BreadcrumbItem>

                  {/* Separator after ellipsis stack */}
                  <BreadcrumbItem>
                    <div className="flex items-center justify-center size-6 text-muted-foreground/25">
                      <ChevronRight className="size-3.5" />
                    </div>
                  </BreadcrumbItem>
                </div>

                {/* Last active folder segment */}
                {renderItemSegment(lastItem, true)}
              </>
            )}
          </BreadcrumbList>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </Breadcrumb>
    </div>
  );
};

export default BreadcrumbComponent;
