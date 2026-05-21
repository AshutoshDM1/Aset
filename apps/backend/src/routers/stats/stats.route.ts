import { router, protectedProcedure } from '../../trpc';

const IMAGE_EXTS = /\.(jpe?g|png|gif|webp|avif|svg|bmp|ico)$/i;
const PDF_EXTS = /\.pdf$/i;
const VIDEO_EXTS = /\.(mp4|webm|ogg|mov|mkv|avi|flv|wmv|m4v)$/i;
const TEXT_DOC_EXTS =
  /\.(txt|md|json|js|jsx|ts|tsx|py|go|html|css|yaml|yml|sh|sql|jsonld|ini|conf|env|doc|docx|xls|xlsx|ppt|pptx|csv|rtf)$/i;
const AUDIO_EXTS = /\.(mp3|wav|m4a|flac|aac|ogg|wma)$/i;

export const statsRouter = router({
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const currentUser = await ctx.db.user.findUnique({
      where: { id: ctx.auth.userId },
      select: { email: true },
    });
    const userEmail = currentUser?.email || ctx.auth.email || '';

    // 1. Overview metrics & Trend Calculations (last 7 days vs previous 7 days)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [
      totalFiles,
      totalFolders,
      starredFiles,
      starredFolders,
      sharedWithMe,
      currentFiles,
      previousFiles,
      currentFolders,
      previousFolders,
      currentShared,
      previousShared,
      currentStarredFiles,
      previousStarredFiles,
      currentStarredFolders,
      previousStarredFolders,
    ] = await Promise.all([
      // Total counts
      ctx.db.file.count({
        where: { ownerId: ctx.auth.userId, trashed: false },
      }),
      ctx.db.folder.count({
        where: { ownerId: ctx.auth.userId, trashed: false },
      }),
      ctx.db.file.count({
        where: { ownerId: ctx.auth.userId, starred: true, trashed: false },
      }),
      ctx.db.folder.count({
        where: { ownerId: ctx.auth.userId, starred: true, trashed: false },
      }),
      ctx.db.folderShare.count({
        where: {
          email: userEmail.toLowerCase().trim(),
          folder: { trashed: false },
        },
      }),
      // Trends - Files
      ctx.db.file.count({
        where: {
          ownerId: ctx.auth.userId,
          trashed: false,
          createdAt: { gte: sevenDaysAgo, lte: now },
        },
      }),
      ctx.db.file.count({
        where: {
          ownerId: ctx.auth.userId,
          trashed: false,
          createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
        },
      }),
      // Trends - Folders
      ctx.db.folder.count({
        where: {
          ownerId: ctx.auth.userId,
          trashed: false,
          createdAt: { gte: sevenDaysAgo, lte: now },
        },
      }),
      ctx.db.folder.count({
        where: {
          ownerId: ctx.auth.userId,
          trashed: false,
          createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
        },
      }),
      // Trends - Shared
      ctx.db.folderShare.count({
        where: {
          email: userEmail.toLowerCase().trim(),
          folder: { trashed: false },
          createdAt: { gte: sevenDaysAgo, lte: now },
        },
      }),
      ctx.db.folderShare.count({
        where: {
          email: userEmail.toLowerCase().trim(),
          folder: { trashed: false },
          createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
        },
      }),
      // Trends - Starred Files
      ctx.db.file.count({
        where: {
          ownerId: ctx.auth.userId,
          starred: true,
          trashed: false,
          createdAt: { gte: sevenDaysAgo, lte: now },
        },
      }),
      ctx.db.file.count({
        where: {
          ownerId: ctx.auth.userId,
          starred: true,
          trashed: false,
          createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
        },
      }),
      // Trends - Starred Folders
      ctx.db.folder.count({
        where: {
          ownerId: ctx.auth.userId,
          starred: true,
          trashed: false,
          createdAt: { gte: sevenDaysAgo, lte: now },
        },
      }),
      ctx.db.folder.count({
        where: {
          ownerId: ctx.auth.userId,
          starred: true,
          trashed: false,
          createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
        },
      }),
    ]);

    function calculateTrend(current: number, previous: number) {
      if (previous === 0) {
        if (current > 0) {
          return { change: '+100%', trend: 'up' as const };
        }
        return { change: '+0%', trend: 'flat' as const };
      }
      const pct = ((current - previous) / previous) * 100;
      const change = (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%';
      const trend =
        pct > 0
          ? ('up' as const)
          : pct < 0
            ? ('down' as const)
            : ('flat' as const);
      return { change, trend };
    }

    const filesTrend = calculateTrend(currentFiles, previousFiles);
    const foldersTrend = calculateTrend(currentFolders, previousFolders);
    const sharedTrend = calculateTrend(currentShared, previousShared);
    const starredTrend = calculateTrend(
      currentStarredFiles + currentStarredFolders,
      previousStarredFiles + previousStarredFolders,
    );

    // 2. Storage metrics
    const storage = await ctx.db.userStorage.findUnique({
      where: { userId: ctx.auth.userId },
    });

    const totalStorageMb = storage?.totalStorage ?? 10240; // Default to 10GB in MB
    const usedStorageMb = storage?.usedStorage ?? 0;

    // Convert MB to bytes
    const totalBytes = totalStorageMb * 1024 * 1024;
    const usedBytes = usedStorageMb * 1024 * 1024;

    // 3. File types and slice calculations
    const allFiles = await ctx.db.file.findMany({
      where: { ownerId: ctx.auth.userId, trashed: false },
      select: { name: true, sizeMb: true },
    });

    let imageBytes = 0;
    let videoBytes = 0;
    let docBytes = 0;
    let audioBytes = 0;
    let pdfBytes = 0;
    let otherBytes = 0;

    let imageCount = 0;
    let videoCount = 0;
    let docCount = 0;
    let audioCount = 0;
    let pdfCount = 0;
    let otherCount = 0;

    for (const file of allFiles) {
      const name = file.name;
      const bytes = file.sizeMb * 1024 * 1024;

      if (IMAGE_EXTS.test(name)) {
        imageBytes += bytes;
        imageCount++;
      } else if (PDF_EXTS.test(name)) {
        pdfBytes += bytes;
        pdfCount++;
      } else if (VIDEO_EXTS.test(name)) {
        videoBytes += bytes;
        videoCount++;
      } else if (AUDIO_EXTS.test(name)) {
        audioBytes += bytes;
        audioCount++;
      } else if (TEXT_DOC_EXTS.test(name)) {
        docBytes += bytes;
        docCount++;
      } else {
        otherBytes += bytes;
        otherCount++;
      }
    }

    // PDF size falls under Docs for slices in storage, or let's merge Doc and PDF bytes for Documents label in storage
    const slices = [
      {
        id: 'images',
        label: 'Images',
        bytes: imageBytes,
        color: 'var(--chart-1)',
      },
      {
        id: 'videos',
        label: 'Videos',
        bytes: videoBytes,
        color: 'var(--chart-2)',
      },
      {
        id: 'docs',
        label: 'Documents',
        bytes: docBytes + pdfBytes,
        color: 'var(--chart-3)',
      },
      {
        id: 'audio',
        label: 'Audio',
        bytes: audioBytes,
        color: 'var(--chart-4)',
      },
      {
        id: 'other',
        label: 'Other',
        bytes: otherBytes,
        color: 'var(--chart-5)',
      },
    ];

    const fileTypes = [
      { type: 'Images', count: imageCount },
      { type: 'Docs', count: docCount },
      { type: 'Videos', count: videoCount },
      { type: 'Audio', count: audioCount },
      { type: 'PDFs', count: pdfCount },
      { type: 'Other', count: otherCount },
    ];

    // 4. Upload and Download activity chart data (last 7 days)
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    const startOfPeriod = new Date(last7Days[0]);
    startOfPeriod.setHours(0, 0, 0, 0);

    const [recentUploads, recentDownloads] = await Promise.all([
      ctx.db.file.findMany({
        where: {
          ownerId: ctx.auth.userId,
          trashed: false,
          createdAt: { gte: startOfPeriod },
        },
        select: { createdAt: true },
      }),
      ctx.db.fileDownload.findMany({
        where: {
          userId: ctx.auth.userId,
          downloadedAt: { gte: startOfPeriod },
        },
        select: { downloadedAt: true },
      }),
    ]);

    const uploadsChart = last7Days.map((date) => {
      const dayName = weekdayNames[date.getDay()];

      const uploadCount = recentUploads.filter((f) => {
        const fileDate = new Date(f.createdAt);
        return (
          fileDate.getFullYear() === date.getFullYear() &&
          fileDate.getMonth() === date.getMonth() &&
          fileDate.getDate() === date.getDate()
        );
      }).length;

      const downloadCount = recentDownloads.filter((d) => {
        const downloadDate = new Date(d.downloadedAt);
        return (
          downloadDate.getFullYear() === date.getFullYear() &&
          downloadDate.getMonth() === date.getMonth() &&
          downloadDate.getDate() === date.getDate()
        );
      }).length;

      return {
        date: dayName,
        uploads: uploadCount,
        downloads: downloadCount,
      };
    });

    // 5. Recent Activity from database changes
    const [recentFiles, recentFolders] = await Promise.all([
      ctx.db.file.findMany({
        where: { ownerId: ctx.auth.userId, trashed: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, createdAt: true },
      }),
      ctx.db.folder.findMany({
        where: { ownerId: ctx.auth.userId, trashed: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, createdAt: true },
      }),
    ]);

    const activities = [
      ...recentFiles.map((f) => ({
        id: `file-${f.id}`,
        actor: 'You',
        action: 'uploaded',
        target: f.name,
        createdAt: f.createdAt,
      })),
      ...recentFolders.map((f) => ({
        id: `folder-${f.id}`,
        actor: 'You',
        action: 'created',
        target: f.name,
        createdAt: f.createdAt,
      })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map((act) => {
        const diffMs = Date.now() - act.createdAt.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        let timeStr = 'Just now';

        if (diffMins > 0 && diffMins < 60) {
          timeStr = `${diffMins}m ago`;
        } else if (diffHours > 0 && diffHours < 24) {
          timeStr = `${diffHours}h ago`;
        } else if (diffHours >= 24) {
          const days = Math.floor(diffHours / 24);
          timeStr = days === 1 ? 'Yesterday' : `${days} days ago`;
        }

        return {
          id: act.id,
          actor: act.actor,
          action: act.action,
          target: act.target,
          time: timeStr,
        };
      });

    return {
      overview: [
        {
          id: 'files',
          label: 'Total Files',
          value: totalFiles.toLocaleString(),
          change: filesTrend.change,
          trend: filesTrend.trend,
          hint: 'Updated live',
        },
        {
          id: 'folders',
          label: 'Folders',
          value: totalFolders.toLocaleString(),
          change: foldersTrend.change,
          trend: foldersTrend.trend,
          hint: 'Updated live',
        },
        {
          id: 'shared',
          label: 'Shared with me',
          value: sharedWithMe.toLocaleString(),
          change: sharedTrend.change,
          trend: sharedTrend.trend,
          hint: 'Updated live',
        },
        {
          id: 'starred',
          label: 'Starred',
          value: (starredFiles + starredFolders).toLocaleString(),
          change: starredTrend.change,
          trend: starredTrend.trend,
          hint: 'Updated live',
        },
      ],
      storage: {
        totalBytes,
        usedBytes,
        slices,
      },
      fileTypes,
      uploadsChart,
      activities,
    };
  }),
});
