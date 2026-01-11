import { ChartConfig } from "./ui/chart";

export interface BarChartCardProps {
  config: ChartConfig;
  data: object[];
  title: string;
  description: string;
  primaryDataKey: string;
  categoryKey: string;
  participationQuestions: string;
  primaryKeys?: string[];
  participantCount?: number;
  label?: "value" | "key";
  isDeletable?: boolean;
  onDelete?: () => void;
}

export interface MarkdownPreviewCardProps {
  title: string;
  description: string;
  participationQuestions: string;
  content: string;
  editable?: boolean;
  showPreview?: boolean;
  onChange?: (value: string) => void;
  isDeletable?: boolean;
  onDelete?: () => void;
}

export interface ArrayChartCardProps {
  title: string;
  description: string;
  participationQuestions: string;
  texts: string[];
  isDeletable?: boolean;
  onDelete?: () => void;
}
