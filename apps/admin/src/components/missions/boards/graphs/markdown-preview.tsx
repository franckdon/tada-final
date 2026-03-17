"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import rehypeExternalLinks from "rehype-external-links";
import MarkdownPreview from "@uiw/react-markdown-preview";
import MarkdownEditor from "@uiw/react-markdown-editor";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tada/ui/components/card";
import { MarkdownPreviewCardProps } from "./type";
import { cn } from "@tada/ui/lib/utils";

export function MarkdownPreviewCard({
  title,
  description,
  participationQuestions,
  content,
  editable = false,
  showPreview = true,
  onChange,
}: MarkdownPreviewCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={containerRef}
      animate={{ opacity: [0, 1] }}
      transition={{ duration: 0.35 }}
      className="w-full"
    >
      <Card className="w-full border border-slate-200 bg-white shadow-sm rounded-2xl">
        {(title || description) && (
          <CardHeader className="px-10 pt-10 pb-4">
            {title ? (
              <CardTitle className="text-5xl md:text-4xl font-semibold tracking-tight text-slate-900">
                {title}
              </CardTitle>
            ) : null}

            {description ? (
              <CardDescription className="mt-3 max-w-4xl text-base leading-7 text-slate-500">
                {description}
              </CardDescription>
            ) : null}
          </CardHeader>
        )}

        <CardContent className="px-10 pb-10 pt-2">
          {editable ? (
            <div className="mb-6 overflow-hidden rounded-xl border border-slate-200">
              <MarkdownEditor
                value={content || ""}
                onChange={(value) => onChange?.(value)}
                style={{ padding: 16 }}
              />
            </div>
          ) : null}

          {showPreview ? (
            <MarkdownPreview
              className={cn(
                "markdown-tile !bg-transparent !p-0 text-slate-700",
                "[&_h1]:mb-6 [&_h1]:text-4xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-slate-900",
                "[&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-slate-900",
                "[&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-slate-900",
                "[&_p]:mb-6 [&_p]:text-[18px] [&_p]:leading-9 [&_p]:text-slate-600",
                "[&_strong]:font-semibold [&_strong]:text-slate-900",
                "[&_ul]:mb-6 [&_ul]:space-y-3 [&_ul]:pl-6",
                "[&_ol]:mb-6 [&_ol]:space-y-3 [&_ol]:pl-6",
                "[&_li]:text-[17px] [&_li]:leading-8 [&_li]:text-slate-600",
                "[&_blockquote]:my-6 [&_blockquote]:border-l-2 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:text-slate-500",
                "[&_hr]:my-8 [&_hr]:border-slate-200",
              )}
              source={content || ""}
              rehypePlugins={[[rehypeExternalLinks, { target: "_blank" }]]}
              style={{
                backgroundColor: "transparent",
                padding: 0,
              }}
            />
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}
