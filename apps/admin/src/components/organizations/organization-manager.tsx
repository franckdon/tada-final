"use client";

import { useState, useEffect } from "react";
import { Button } from "@tada/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@tada/ui/components/dialog";
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
import { Textarea } from "@tada/ui/components/textarea";
import { Loader2, Building2, User, Upload, X } from "lucide-react";
import { SECTORS, generateSlug } from "@/lib/validations/organization";

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
              className="mx-auto h-20 w-20 object-contain"
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

interface OrganizationManagerProps {
  isOpen: boolean;
  onClose: () => void;
  organization?: {
    id?: string;
    name: string;
    slug: string;
    logo?: string | null;
    metadata?: string | null;
    status?: string | null;
    country?: string | null;
    sector?: string | null;
  };
  onSuccess?: (organization?: any) => void;
}

export function OrganizationManager({
  isOpen,
  onClose,
  organization,
  onSuccess,
}: OrganizationManagerProps) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    logo: "",
    metadata: "",
    status: "active",
    country: "",
    sector: "",
    ownerEmail: "",
    ownerName: "",
    ownerPosition: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);

  // Mettre à jour le formulaire quand l'organisation change
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || "",
        slug: organization.slug || "",
        logo: organization.logo || "",
        metadata: organization.metadata || "",
        status: organization.status || "active",
        country: organization.country || "",
        sector: organization.sector || "",
        ownerEmail: "",
        ownerName: "",
        ownerPosition: "",
      });
      setLogoFile(null); // Réinitialiser le fichier logo
      setAutoGenerateSlug(false);
    } else {
      // Réinitialiser le formulaire pour une nouvelle création
      setFormData({
        name: "",
        slug: "",
        logo: "",
        metadata: "",
        status: "active",
        country: "",
        sector: "",
        ownerEmail: "",
        ownerName: "",
        ownerPosition: "",
      });
      setLogoFile(null); // Réinitialiser le fichier logo
      setAutoGenerateSlug(true);
    }
    setError(null);
  }, [organization, isOpen]);

  // Générer automatiquement le slug à partir du nom
  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: autoGenerateSlug ? generateSlug(value) : prev.slug,
    }));
  };

  const { uploadFile } = useUpload();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validation côté client pour la création
    if (!organization?.id) {
      if (!formData.name.trim()) {
        setError("Le nom de l'organisation est requis");
        setIsSubmitting(false);
        return;
      }
      if (!formData.ownerEmail.trim()) {
        setError("L'email du propriétaire est requis");
        setIsSubmitting(false);
        return;
      }
      if (!formData.ownerName.trim()) {
        setError("Le nom du propriétaire est requis");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      let finalImageUrl = formData.logo;

      // --- UPLOAD VERS SUPABASE SI UNE NOUVELLE IMAGE EST CHOISIE ---
      if (imageFile) {
        const cleanName = imageFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "");
        const userFolder = organization?.id ?? crypto.randomUUID();

        const { url } = await uploadFile({
          file: imageFile,
          path: [userFolder, cleanName],
          bucket: "avatars",
        });

        finalImageUrl = url;
      }

      const url = organization?.id
        ? `/api/organizations/${organization.id}`
        : "/api/organizations";
      
      const method = organization?.id ? "PATCH" : "POST";

      // Structurer les données selon ce que l'API attend
      let requestData;
      
      if (organization?.id) {
        // Pour la modification, envoyer seulement les données de l'organisation
        requestData = {
          name: formData.name,
          slug: formData.slug,
          logo: formData.logo || null,
          metadata: formData.metadata || null,
          status: formData.status,
          country: formData.country || null,
          sector: formData.sector || null,
        };
      } else {
        // Pour la création, structurer avec organization et owner
        requestData = {
          organization: {
            name: formData.name,
            slug: formData.slug,
            logo: formData.logo || null,
            metadata: formData.metadata || null,
            status: formData.status,
            country: formData.country || null,
            sector: formData.sector || null,
          },
          owner: {
            email: formData.ownerEmail,
            name: formData.ownerName,
            position: formData.ownerPosition || null,
          },
        };
      }

      console.log("Données envoyées à l'API:", requestData);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      console.log("Réponse de l'API:", result);

      if (!response.ok) {
        console.error("Erreur API:", result);
        const errorMessage = result.errors ? 
          result.errors.join(", ") : 
          (result.error || result.message || "Failed to save organization");
        throw new Error(errorMessage);
      }

      // Succès
      if (onSuccess) {
        onSuccess(result.data || result);
      }
      onClose();
    } catch (err) {
      console.error("Error saving organization:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [imageFile, setImageFile] = useState<File | null>(null);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {organization?.id ? "Modifier l'organisation" : "Nouvelle organisation"}
          </DialogTitle>
          <DialogDescription>
            {organization?.id
              ? "Modifiez les informations de l'organisation"
              : "Créez une nouvelle organisation avec son propriétaire"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section Organisation */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Building2 className="h-4 w-4" />
              Informations de l'organisation
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">
                  Nom de l'organisation <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Renault, Orange, BNP Paribas"
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="slug">
                  Slug (URL) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => {
                    setAutoGenerateSlug(false);
                    setFormData({ ...formData, slug: e.target.value });
                  }}
                  placeholder="Ex: renault, orange, bnp-paribas"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Généré automatiquement à partir du nom
                </p>
              </div>

              <div>
                <Label htmlFor="sector">Secteur d'activité</Label>
                <Select
                  value={formData.sector}
                  onValueChange={(value) =>
                    setFormData({ ...formData, sector: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  placeholder="Ex: France, Belgique"
                />
              </div>

              <div>
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                    <SelectItem value="suspended">Suspendu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <ImageUpload
                value={formData.logo}
                onChange={(file) => setLogoFile(file)}
                label="Logo de l'organisation"
              />

              <div className="col-span-2">
                <Label htmlFor="metadata">Métadonnées (JSON)</Label>
                <Textarea
                  id="metadata"
                  value={formData.metadata}
                  onChange={(e) =>
                    setFormData({ ...formData, metadata: e.target.value })
                  }
                  placeholder='{"website": "https://example.com"}'
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Section Propriétaire (seulement pour création) */}
          {!organization?.id && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <User className="h-4 w-4" />
                Propriétaire de l'organisation
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="ownerEmail">
                    Email du propriétaire <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, ownerEmail: e.target.value })
                    }
                    placeholder="proprietaire@entreprise.com"
                    required={!organization?.id}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Si l'email existe déjà, l'utilisateur sera lié à l'organisation
                  </p>
                </div>

                <div>
                  <Label htmlFor="ownerName">
                    Nom du propriétaire <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) =>
                      setFormData({ ...formData, ownerName: e.target.value })
                    }
                    placeholder="Jean Dupont"
                    required={!organization?.id}
                  />
                </div>

                <div>
                  <Label htmlFor="ownerPosition">Poste</Label>
                  <Input
                    id="ownerPosition"
                    value={formData.ownerPosition}
                    onChange={(e) =>
                      setFormData({ ...formData, ownerPosition: e.target.value })
                    }
                    placeholder="Directeur Général"
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {organization?.id ? "Mise à jour..." : "Création..."}
                </>
              ) : organization?.id ? (
                "Mettre à jour"
              ) : (
                "Créer l'organisation"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
