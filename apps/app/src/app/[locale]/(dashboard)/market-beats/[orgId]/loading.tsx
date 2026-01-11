import { Loader2 } from "lucide-react";

export default function LoadingMarketBeats() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF5B4A]" />
        <p className="text-sm text-gray-600">Chargement des études Tada...</p>
      </div>
    </div>
  );
}
