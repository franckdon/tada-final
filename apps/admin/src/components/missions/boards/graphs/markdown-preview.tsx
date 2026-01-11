"use client";

import { useRef } from "react";
import { motion } from "framer-motion";

import { Button } from "@tada/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tada/ui/components/card";
import rehypeExternalLinks from "rehype-external-links";
import MarkdownPreview from "@uiw/react-markdown-preview";
import MarkdownEditor from "@uiw/react-markdown-editor";
import { MarkdownPreviewCardProps } from "./type";

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
      animate={{ opacity: [0, 1] }}
      transition={{ duration: 0.7 }}
      style={styles.container}
      ref={containerRef}
    >
      <Card className="h-full bg-white dark:bg-slate-700">
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
        )}

        <CardContent className="p-3 overflow-hidden h-full ">
          {editable ? (
            <MarkdownEditor
              value={content || ""}
              onChange={(value, viewUpdate) => {
                onChange?.(value);
              }}
              style={{ padding: 16 }}
            />
          ) : (
            <></>
          )}
          {showPreview ? (
            <MarkdownPreview
              className="markdown-tile bg-white dark:bg-slate-700 dark:text-white "
              source={content || ""}
              rehypePlugins={[[rehypeExternalLinks, { target: "_blank" }]]}
              style={{ padding: 16 }}
            />
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}

const styles = {
  container: {
    width: "100%",
    height: "100%",
  },
  draft: {
    marginRight: 10,
  },
  filterBtn: (addPadding: boolean) => ({
    position: "absolute",
    right: addPadding ? 40 : 10,
    top: 10,
    backgroundColor: "transparent",
    boxShadow: "none",
  }),
  titleArea: (isKpi: boolean) => ({
    paddingLeft: isKpi ? 15 : 0,
  }),
};
