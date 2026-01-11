"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../dialog";
import { Button } from "../button";
import { ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@tada/app/src/locales/client";

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt?: string;
}

export function ImageViewerModal({
  isOpen,
  onClose,
  imageUrl,
  alt = "Image",
}: ImageViewerModalProps) {
  const t = useI18n();

  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = alt || "image";
    link.rel = "noopener noreferrer";

    // Important pour Firefox & co.
    setTimeout(() => {
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 0);
  };

  const resetZoom = () => {
    setZoom(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              {t("missions.addSubDashboard.imageViewer.title")}
            </DialogTitle>
            <div className="flex items-center gap-2 mr-10">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={resetZoom}>
                {t("missions.addSubDashboard.imageViewer.reset")}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-4 pt-0">
          <div className="flex items-center justify-center min-h-[60vh]">
            <img
              src={imageUrl || "/placeholder.svg"}
              alt={alt}
              className="max-w-full max-h-full object-cover transition-transform duration-200 cursor-grab active:cursor-grabbing"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "center",
              }}
              onDoubleClick={resetZoom}
              draggable={false}
            />
          </div>
        </div>

        <div className="p-4 pt-0 text-center">
          <p className="text-sm text-gray-500">
            {t("missions.addSubDashboard.imageViewer.doubleClickHint")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
