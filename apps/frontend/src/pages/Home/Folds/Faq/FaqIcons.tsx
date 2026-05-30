export const AvatarStack = () => {
  return (
    <div className="flex -space-x-3 select-none">
      {/* Avatar 1 */}
      <div className="size-10 rounded-full border-2 border-white dark:border-zinc-950 bg-linear-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      {/* Avatar 2 */}
      <div className="size-10 rounded-full border-2 border-white dark:border-zinc-950 bg-linear-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white shadow-md relative z-10">
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </div>
      {/* Avatar 3 */}
      <div className="size-10 rounded-full border-2 border-white dark:border-zinc-950 bg-linear-to-br from-fuchsia-500 to-fuchsia-600 flex items-center justify-center text-white shadow-md relative z-20">
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
    </div>
  );
};
