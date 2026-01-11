export type UploadCategory =
  | "workspaceLogo"
  | "userAvatar"
  | "organizationLogo"
  | "surveyImage"
  | "missionThumbnail"
  | "stimulusMedia";

export type UploadCfg = { bucket: string; folder: string };

export const UPLOAD_CONFIG: Record<UploadCategory, UploadCfg> = {
  workspaceLogo: { bucket: "tada", folder: "workspace-logos" },
  userAvatar: { bucket: "tada", folder: "user-avatars" },
  organizationLogo: { bucket: "tada", folder: "organization-logos" },
  surveyImage: { bucket: "tada", folder: "surveys" },
  missionThumbnail: { bucket: "tada", folder: "mission-thumbnails" },
  stimulusMedia: { bucket: "tada", folder: "stimulus-media" },
};

export function isHttpUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}
