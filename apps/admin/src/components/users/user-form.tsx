"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@tada/ui/components/button";
import { Input } from "@tada/ui/components/input";
import { Label } from "@tada/ui/components/label";
import { useUpload } from "@/hooks/use-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tada/ui/components/select";
import { Loader2, Save, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange: (file: File | null) => void;
  label: string;
}

function ImageUpload({ value, onChange, label }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
    onChange(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileChange(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors relative ${
          dragActive
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="mx-auto h-24 w-24 rounded-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={() => handleFileChange(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-600">
              Glissez-déposez une image ici ou cliquez pour sélectionner
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 10MB</p>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => {
            const files = e.target.files;
            if (files && files[0]) {
              handleFileChange(files[0]);
            }
          }}
        />
      </div>
    </div>
  );
}

interface UserFormProps {
  mode: "create" | "edit";
  model?: string;
  initialData?: {
    id?: string;
    image?: string;
    email: string;
    name: string;
    adminSubRole: string;
    position?: string | null;
    country?: string | null;
    sector?: string | null;
    job?: string | null;
    location?: string | null;
    kyc_status?: string | null;
    banned?: boolean | null;
    emailVerified?: boolean | null;
  };
}

export function UserForm({ mode, model, initialData }: UserFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: initialData?.email || "",
    name: initialData?.name || "",
    image: initialData?.image || "",
    adminSubRole: initialData?.adminSubRole || "customer_admin",
    position: initialData?.position || "",
    country: initialData?.country || "",
    sector: initialData?.sector || "",
    job: initialData?.job || "",
    location: initialData?.location || "",
    kyc_status: initialData?.kyc_status || "in_progress",
    banned: initialData?.banned || false,
    emailVerified: initialData?.emailVerified || false,
    role: model,
  });

  const { uploadFile } = useUpload();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalImageUrl = formData.image;

      // --- UPLOAD VERS SUPABASE SI UNE NOUVELLE IMAGE EST CHOISIE ---
      if (imageFile) {
        const cleanName = imageFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "");
        const userFolder = initialData?.id ?? crypto.randomUUID();

        const { url } = await uploadFile({
          file: imageFile,
          path: [userFolder, cleanName],
          bucket: "avatars",
        });

        finalImageUrl = url;
      }

      // Choisir route + méthode selon create/edit
      const url = mode === "create" ? "/api/users" : `/api/users/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      // Construire données à envoyer
      const payload = {
        ...formData,
        image: finalImageUrl,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Erreur inconnue");
        return;
      }

      toast.success(
        mode === "create"
          ? "Utilisateur créé avec succès"
          : "Utilisateur mis à jour"
      );

      model === "superAdmin" ? router.push("/users") : router.push("/contributors");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l’envoi du formulaire.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Informations de base
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <ImageUpload
              value={formData.image}
              onChange={(file) => setImageFile(file)}
              label="Photo de profil"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">
              Nom complet <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Jean Dupont"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="jean.dupont@example.com"
              required
              disabled={mode === "edit"}
            />
          </div>
        </div>

        {model == "superAdmin" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="adminSubRole">
              Rôle <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.adminSubRole}
              onValueChange={(value) => handleChange("adminSubRole", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">Super Administrateur</SelectItem>
                <SelectItem value="operations_admin">Administrateur des Opérations</SelectItem>
                <SelectItem value="customer_admin">Administrateur Client</SelectItem>
                <SelectItem value="content_moderator">Modérateur de Contenu</SelectItem>
                <SelectItem value="finance_admin">Administrateur Financier</SelectItem>
                <SelectItem value="auditor">Auditeur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kyc_status">Statut KYC</Label>
            <Select
              value={formData.kyc_status}
              onValueChange={(value) => handleChange("kyc_status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="completed">Complété</SelectItem>
                <SelectItem value="canceled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        )}
        
      </div>

      {/* Informations professionnelles */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Informations professionnelles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="position">Poste</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => handleChange("position", e.target.value)}
              placeholder="Développeur Senior"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job">Métier</Label>
            <Input
              id="job"
              value={formData.job}
              onChange={(e) => handleChange("job", e.target.value)}
              placeholder="Ingénieur Logiciel"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sector">Secteur d'activité</Label>
          <Input
            id="sector"
            value={formData.sector}
            onChange={(e) => handleChange("sector", e.target.value)}
            placeholder="Technologie, Finance, Marketing..."
          />
        </div>
      </div>

      {/* Localisation */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Localisation</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country">Pays</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => handleChange("country", e.target.value)}
              placeholder="France"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ville</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="Paris"
            />
          </div>
        </div>
      </div>

      {/* Statut */}
      {mode === "edit" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Statut</h3>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="banned"
              checked={formData.banned}
              onChange={(e) => handleChange("banned", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="banned" className="font-normal cursor-pointer">
              Bannir cet utilisateur
            </Label>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 dark:bg-red-600 dark:text-white">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {mode === "create" ? "Créer l'utilisateur" : "Enregistrer les modifications"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
