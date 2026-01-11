export function FullScreenLoader() {
  return (
    <div className="fixed inset-0 z-50 bg-white/80 dark:bg-black/60 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-gray-200" />
    </div>
  );
}
