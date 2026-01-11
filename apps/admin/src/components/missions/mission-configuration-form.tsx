// src/components/missions/mission-configuration-form.tsx
"use client";

import { TempMission } from "@prisma/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useI18n } from "@/locales/client";
import { Button } from "@tada/ui/components/button";
import { Input } from "@tada/ui/components/input";
import { Textarea } from "@tada/ui/components/textarea";
import { Checkbox } from "@tada/ui/components/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@tada/ui/components/form";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { configureMissionAction } from "@/actions/missions/configure-mission-action";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

// Schéma de validation local pour le formulaire
const formSchema = z.object({
  imageUrl: z.string().url("URL invalide. L'image est obligatoire."),
  publicTitle: z.string().min(5, "Minimum 5 caractères."),
  publicDescription: z.string().min(20, "Minimum 20 caractères."),
  gain: z.coerce.number().int().min(1, "Gain > 0."),
  deadline: z.coerce.date().nullable(),
  targetSubmissions: z.coerce.number().int().min(1, "Objectif > 0."),
  geographicZones: z.string().optional(),
  requiresPhoto: z.boolean().default(false),
  requiresVideo: z.boolean().default(false),
  requiresAudio: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface MissionConfigurationFormProps {
  mission: TempMission;
  // Optionnel: données existantes de MissionConfigContributor si en mode édition
  initialConfig?: any; 
}

export function MissionConfigurationForm({ mission, initialConfig }: MissionConfigurationFormProps) {
  const t = useI18n();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      imageUrl: initialConfig?.imageUrl || "",
      publicTitle: initialConfig?.title || "",
      publicDescription: initialConfig?.description || "",
      gain: initialConfig?.gain ? Number(initialConfig.gain) : 1, // Convert BigInt to number
      deadline: initialConfig?.deadline ? new Date(initialConfig.deadline) : null,
      targetSubmissions: mission.targetSubmissions || 100, // Assumer que ce champ existe sur TempMission
      geographicZones: mission.geographicZones || "Global",
      requiresPhoto: initialConfig?.requiresPhoto || false, // Assumer ces champs existent sur MissionConfigContributor
      requiresVideo: initialConfig?.requiresVideo || false,
      requiresAudio: initialConfig?.requiresAudio || false,
    },
  });

  const { execute, isExecuting } = useAction(configureMissionAction, {
    onSuccess: () => {
      toast({
        title: t("missions.config.success"),
        description: t("missions.config.success_description"),
      });
      // Redirection vers la prévisualisation ou l'étape de publication
      router.push(`/missions-to-validate/${mission.id}/preview`);
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: t("missions.config.error"),
        description: t("common.generic_error"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    execute({
        ...values,
        missionId: mission.id,
    });
  };
  
  // NOTE: Le composant de Date (Input type="date") n'est pas inclus ici pour des raisons de simplicité, 
  // mais vous devriez utiliser un DatePicker ou un Input type="date" pour le champ 'deadline'.
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
        
        <h3 className="text-xl font-semibold border-b pb-3 mb-4">
          {t("missions.config.section_public")}
        </h3>

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("missions.config.image_url")}</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="publicTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("missions.config.public_title")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="gain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("missions.config.gain")}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <FormField
          control={form.control}
          name="publicDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("missions.config.public_description")}</FormLabel>
              <FormControl>
                <Textarea rows={5} placeholder={t("missions.config.description_placeholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <h3 className="text-xl font-semibold border-b pb-3 pt-6 mb-4">
          {t("missions.config.section_operational")}
        </h3>

        <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="targetSubmissions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("missions.config.target_submissions")}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="geographicZones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("missions.config.geographic_zones")}</FormLabel>
                  <FormControl>
                    <Input placeholder="FR, US, CA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("missions.config.deadline")}</FormLabel>
                  <FormControl>
                    {/* NOTE: Utiliser un DatePicker réel en production */}
                    <Input 
                      type="date" 
                      {...field} 
                      value={field.value ? field.value.toISOString().split('T')[0] : ''}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        
        <h3 className="text-xl font-semibold border-b pb-3 pt-6 mb-4">
          {t("missions.config.section_media")}
        </h3>
        
        <div className="flex space-x-6">
             <FormField
                control={form.control}
                name="requiresPhoto"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">{t("missions.config.requires_photo")}</FormLabel>
                  </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="requiresVideo"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">{t("missions.config.requires_video")}</FormLabel>
                  </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="requiresAudio"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">{t("missions.config.requires_audio")}</FormLabel>
                  </FormItem>
                )}
            />
        </div>

        <Button type="submit" disabled={isExecuting} className="w-full mt-8">
          {isExecuting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Check className="w-4 h-4 mr-2" />
          )}
          {t("missions.config.save_and_preview")}
        </Button>
      </form>
    </Form>
  );
}