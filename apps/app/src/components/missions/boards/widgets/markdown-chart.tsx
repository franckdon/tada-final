"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  BoldIcon,
  ItalicIcon,
  QuoteIcon,
  CodeIcon,
  ImageIcon,
  LinkIcon,
  ListOrderedIcon,
  ListIcon,
  SquareCheckIcon,
  EllipsisVerticalIcon,
  MonitorXIcon,
  MonitorIcon,
  TrashIcon,
  PencilIcon,
  LayoutDashboardIcon,
  EyeIcon,
  HeadingIcon,
  LucideBookMarked,
  Loader2Icon,
  SettingsIcon,
  FileDownIcon,
} from "lucide-react";
import remarkGfm from "remark-gfm";
import { debounce } from "lodash";

import { Button } from "@tada/ui/components/button";
import { Card, CardContent, CardHeader } from "@tada/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@tada/ui/components/dropdown";
import { cn } from "@tada/ui/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@tada/ui/components/tooltip";
import { Chart, useBoardBuilder } from "@/context/board-builder-context";
import rehypeExternalLinks from "rehype-external-links";
import MarkdownPreview from "@uiw/react-markdown-preview";

export function MarkdownChart({ chart }: { chart: Chart }) {
  const { editingBoard, setEditingBoard } = useBoardBuilder();
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 400, height: 300 });

  useEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setSize({
          width: Math.max(200, rect.width - 50),
          height: Math.max(150, rect.height - 70),
        });
      }
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <motion.div
      animate={{ opacity: [0, 1] }}
      transition={{ duration: 0.7 }}
      style={styles.container}
      ref={containerRef}
    >
      {chart && (
        <Card
          className="h-full bg-white dark:bg-slate-700 border-solid border-1 border-divider"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {editingBoard && (
            <div className="absolute top-2 right-2 z-10 p-1  transition">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <EllipsisVerticalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => {
                      /*  router.push(
                            `/${board.organizationId}/${board.missionId}/${board.id}/chart/${chart.id}/edit`
                          ); */
                    }}
                  >
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>Edit chart</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {}}>
                    <FileDownIcon className="mr-2 h-4 w-4" />
                    <span>Export to Excel</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {}}>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    <span>Export to Image</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => {}}
                    className="text-destructive focus:text-destructive"
                  >
                    <TrashIcon className="mr-2 h-4 w-4" />
                    <span>Delete chart</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <CardContent className="p-3 overflow-hidden h-full">
            <MarkdownPreview
              className="markdown-tile"
              source={chart.content || ""}
              rehypePlugins={[[rehypeExternalLinks, { target: "_blank" }]]}
            />
          </CardContent>
        </Card>
      )}
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
