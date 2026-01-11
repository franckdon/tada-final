export function MissionCardSkeleton() {
  return (
    <div className="flex items-center bg-white justify-between animate-pulse border-b border-gray-200">
      <div className="grid grid-cols-4 py-6 px-4 gap-4 w-full">
        {/* Column 1: Mission Title and Status Tag */}
        <div className="flex flex-col space-y-2">
          <div className="h-4 bg-gray-300 rounded w-full max-w-[280px] dark:bg-gray-700" />
          <div className="h-3 bg-gray-200 rounded w-1/4 max-w-[80px] dark:bg-gray-600" />
        </div>
        {/* Column 2: Completion Percentage and Date */}
        <div className="flex flex-col space-y-2">
          <div className="h-4 bg-gray-300 rounded w-1/2 max-w-[120px] dark:bg-gray-700" />
          <div className="h-3 bg-gray-200 rounded w-1/3 max-w-[80px] dark:bg-gray-600" />
        </div>
        {/* Column 3: Submissions and Date */}
        <div className="flex flex-col space-y-2">
          <div className="h-4 bg-gray-300 rounded w-1/2 max-w-[120px] dark:bg-gray-700" />
          <div className="h-3 bg-gray-200 rounded w-1/3 max-w-[80px] dark:bg-gray-600" />
        </div>
        {/* Column 4: Last Date */}
        <div className="flex flex-col space-y-2 items-end">
          <div className="h-4 bg-gray-300 rounded w-1/3 max-w-[80px] dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
}
