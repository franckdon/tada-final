"use client";

import type React from "react";

import {
  Edit3,
  EllipsisVerticalIcon,
  FileDown,
  ImageIcon,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "@tada/ui/components/button";
import { useState } from "react";
import { useUpload } from "@/hooks/use-upload";
import { stripSpecialCharacters } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { DeleteConfirmation } from "@tada/ui/components/customs/delete-confirmation-modal";
import { ImageViewerModal } from "@tada/ui/components/customs/image-view-modal";
import { useBoolean } from "@/hooks/use-boolean";
import { useI18n } from "@/locales/client";
import { useAction } from "next-safe-action/hooks";
import { updateSubDashboardItemAction } from "@/actions/missions/sub-dashboard/update-subdashboard-item-action";
import { deleteSubDashboardItemAction } from "@/actions/missions/sub-dashboard/delete-subdashboard-item-action";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@tada/ui/components/dropdown";

interface ImageItemProps {
  id: string;
  imageUrl: string;
  isShared: boolean;
}

export const ImageItem = ({ id, imageUrl, isShared }: ImageItemProps) => {
  const t = useI18n();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [url, setUrl] = useState(imageUrl);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const deleteTextModal = useBoolean();
  const { uploadFile } = useUpload();

  const deleteSubDashboardItem = useAction(deleteSubDashboardItemAction, {
    onSuccess: () => {
      toast({
        title: t("missions.addSubDashboard.delete.success"),
      });
      setIsLoading(false);
      deleteTextModal.onToggle();
    },
    onError: (error) => {
      console.log("error", error);
      toast({
        title: t("missions.addSubDashboard.delete.error"),
        variant: "destructive",
      });
    },
  });

  const updateSubDashboardItem = useAction(updateSubDashboardItemAction, {
    onSuccess: ({ data }) => {
      toast({
        title: t("missions.addSubDashboard.update.success"),
      });
      setUrl(data?.item?.imageUrl || "");
      setIsEditing(false);
      setImageFile(null);
    },
    onError: (error) => {
      console.log("error", error);
      toast({
        title: t("missions.addSubDashboard.update.error"),
        variant: "destructive",
      });
    },
  });

  const handleSave = async () => {
    let finalUrl = url;

    if (imageFile) {
      const filename = stripSpecialCharacters(imageFile.name);
      const { url: uploadedUrl } = await uploadFile({
        file: imageFile,
        path: [id, filename],
        bucket: "avatars",
      });
      finalUrl = uploadedUrl;
    }

    updateSubDashboardItem.execute({
      id,
      imageUrl: finalUrl,
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = () => {
    deleteSubDashboardItem.execute({
      id,
    });
  };

  const handleImageClick = () => {
    setIsViewerOpen(true);
  };

  const isPending =
    updateSubDashboardItem.status === "executing" ||
    deleteSubDashboardItem.status === "executing";

  const exportImage = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "dashboard-image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Erreur lors du téléchargement de l’image :", error);
    }
  };

  return (
    <>
      <div className="bg-white group">
        <div className="px-4 pt-2 flex flex-row items-center justify-between">
          <p>
            {isEditing
              ? t("missions.addSubDashboard.imageItem.editMode")
              : t("missions.addSubDashboard.imageItem.viewMode")}
          </p>

          {isShared && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={deleteTextModal.onTrue}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 px-2">
                    <EllipsisVerticalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportImage}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Télécharger l’image
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        <div className="relative p-4">
          {isEditing ? (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <label className="block text-center cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-blue-600 mb-1 font-medium">
                    {t("teamMembers.organization.avatar.upload.button")}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {t("teamMembers.organization.avatar.upload.formats")}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {t("teamMembers.organization.avatar.upload.maxSize")}
                  </p>
                </label>
              </div>

              {url && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">
                    {t("missions.addSubDashboard.imageItem.preview")}
                  </p>
                  <img
                    src={url || "/placeholder.svg"}
                    alt="Aperçu"
                    className="w-full h-60 object-cover rounded-md"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isPending || isLoading}
                >
                  <Save className="h-4 w-4 mr-1" />
                  {isPending || isLoading
                    ? t("missions.addSubDashboard.imageItem.saving")
                    : t("missions.addSubDashboard.imageItem.save")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setUrl(imageUrl);
                    setImageFile(null);
                  }}
                >
                  {t("missions.addSubDashboard.imageItem.cancel")}
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="relative group/image cursor-zoom-in"
              onClick={handleImageClick}
            >
              <img
                src={url || ""}
                alt={url ? "Image" : ""}
                className="w-full h-60 object-cover rounded-md cursor-pointer transition-transform hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/image:bg-opacity-10 transition-all duration-200 rounded-md flex items-center justify-center">
                <div className="opacity-0 group-hover/image:opacity-100 transition-opacity">
                  <div className="bg-white bg-opacity-90 rounded-full p-2">
                    <ImageIcon className="h-6 w-6 text-gray-700" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DeleteConfirmation
          isOpen={deleteTextModal.value}
          onToggle={deleteTextModal.onToggle}
          title={t("missions.addSubDashboard.imageItem.deleteTitle")}
          message={t("missions.addSubDashboard.imageItem.deleteMessage")}
          confirmLabel={t("missions.addSubDashboard.imageItem.deleteConfirm")}
          cancelLabel={t("missions.addSubDashboard.imageItem.deleteCancel")}
          deletingText={t("missions.addSubDashboard.imageItem.deleting")}
          onConfirm={handleDelete}
          isDeletingInfo={deleteSubDashboardItem.status === "executing"}
        />
      </div>

      <ImageViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        imageUrl={url}
        alt="Image du dashboard"
      />
    </>
  );
};

export default ImageItem;
