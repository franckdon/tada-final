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
} from "lucide-react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { debounce } from "lodash";

import { Button } from "@tada/ui/components/button";
import { Card, CardContent } from "@tada/ui/components/card";
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
import { updateChartAction } from "@/actions/boards/update-chart-action";
import { useAction } from "next-safe-action/hooks";

interface TextWidgetProps {
  chart: Chart;
  onEditLayout: () => void;
  editingLayout: boolean;
  onCancelChanges: () => void;
  onSaveChanges: () => Promise<void>;
  onEditContent: (content: string) => void;
  isPublic?: boolean;
}

interface MarkdownComponents {
  code: React.ComponentType<{
    children: React.ReactNode;
    className?: string;
  }>;
  li: React.ComponentType<{
    children: React.ReactNode;
    className?: string;
  }>;
}

export function TextWidget({
  chart,
  onEditLayout,
  editingLayout,
  onCancelChanges,
  onSaveChanges,
  onEditContent,
  isPublic = false,
}: TextWidgetProps) {
  const [content, setContent] = useState(chart.content || "");
  const [isEditing, setIsEditing] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const { board, setBoard } = useBoardBuilder();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsEditing(chart.staged ?? false);
  }, [chart]);

  const handleInteractiveMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const components: MarkdownComponents = {
    code: ({ children, className }) => {
      const formattedText = String(children).replace(/^`|`$/g, "");

      return className ? (
        <pre className="bg-content2 text-foreground p-2 rounded-md overflow-auto">
          <code className={className}>{formattedText}</code>
        </pre>
      ) : (
        <span className="bg-content2 text-foreground px-1 rounded">
          {formattedText}
        </span>
      );
    },
    li: ({ children, className }) => {
      if (className?.includes("task-list-item")) {
        return <li className={`${className} list-none -ml-6`}>{children}</li>;
      }
      return <li className={className}>{children}</li>;
    },
  };

  const _canAccess = (role: string): boolean => {
    //return canAccess(role, user.id, team.TeamRoles);
    return true;
  };

  const insertMarkdown = (type: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = content;
    const selectedText = text.substring(start, end);

    let insertion = "";
    let newCursorPosition = start;

    switch (type) {
      case "heading":
        insertion = `### ${selectedText || "Heading"}`;
        newCursorPosition = start + 4;
        break;
      case "bold":
        insertion = `**${selectedText || "bold text"}**`;
        newCursorPosition = start + 2;
        break;
      case "italic":
        insertion = `*${selectedText || "italic text"}*`;
        newCursorPosition = start + 1;
        break;
      case "quote":
        insertion = `> ${selectedText || "quote"}`;
        newCursorPosition = start + 2;
        break;
      case "code":
        insertion = `\`${selectedText || "code"}\``;
        newCursorPosition = start + 1;
        break;
      case "image":
        insertion = "![alt text](image_url)";
        newCursorPosition = start + 2;
        break;
      case "link":
        insertion = `[${selectedText || "link text"}](url)`;
        newCursorPosition = start + 1;
        break;
      case "numbered":
        insertion = `1. ${selectedText || "First item"}\n2. Second item`;
        newCursorPosition = start + 3;
        break;
      case "unordered":
        insertion = `- ${selectedText || "List item"}\n- Another item`;
        newCursorPosition = start + 2;
        break;
      case "task":
        insertion = `- [ ] ${selectedText || "Task item"}\n- [ ] Another task`;
        newCursorPosition = start + 6;
        break;
    }

    const newContent =
      text.substring(0, start) + insertion + text.substring(end);
    _onEditContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };

  const updateChart = useAction(updateChartAction);

  const debouncedEditContent = useCallback(
    debounce((content: string) => {
      if (chart.staged) {
        onEditContent(content);
      }
    }, 300),
    [chart.staged, onEditContent]
  );

  const _onEditContent = (content: string) => {
    setContent(content);
    debouncedEditContent(content);
  };

  const _onChangeReport = () => {
    setChartLoading(true);
    updateChart
      .executeAsync({
        id: chart.id,
        onReport: !chart.onReport,
        projectId: board.id,
      })
      .then((response) => {
        const chartUpdated = response?.data?.data;
        if (chartUpdated) {
          setBoard({
            ...board,
            charts: board.charts.map((chart) =>
              chart.id === chartUpdated.id
                ? { ...chart, onReport: !chart.onReport }
                : chart
            ),
          });
        }
        setChartLoading(false);
      })
      .catch(() => {
        setChartLoading(false);
      });
  };

  const _onDeleteChartConfirmation = () => {
    setDeleteModal(true);
  };

  const _onDeleteChart = () => {
    setDeleteModal(false);
    setChartLoading(true);

    /*  dispatch(
      removeChart({
        project_id: params.projectId,
        chart_id: chart.id,
      })
    )
      .then((response: any) => {
        if (response?.error) {
          toast.error("Error deleting the widget");
        }
        setChartLoading(false);
      })
      .catch(() => {
        toast.error("Error deleting the widget");
        setChartLoading(false);
      }); */
  };

  const _onSaveContent = async () => {
    setChartLoading(true);

    if (chart.staged) {
      await onSaveChanges();
      return setChartLoading(false);
    }

    updateChart
      .executeAsync({
        id: chart.id,
        content,
        projectId: board.id,
      })
      .then((response) => {
        const chartUpdated = response?.data?.data;
        if (chartUpdated) {
          setBoard({
            ...board,
            charts: board.charts.map((chart) =>
              chart.id === chartUpdated.id
                ? { ...chart, content: chartUpdated.content }
                : chart
            ),
          });
        }
        setChartLoading(false);
      })
      .catch(() => {
        setChartLoading(false);
      });
  };

  const _onCancelChanges = () => {
    setIsEditing(false);
    _onEditContent(chart.content || "");
    if (chart.staged) {
      onCancelChanges();
    }
  };

  const MemoizedMarkdown = useMemo(
    () => (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components as Components}
      >
        {content}
      </ReactMarkdown>
    ),
    [content]
  );

  return (
    <motion.div
      animate={{ opacity: [0, 1] }}
      transition={{ duration: 0.7 }}
      className="w-full h-full"
    >
      {chart && (
        <Card className="h-full bg-white dark:bg-slate-700 border-solid border-1 border-divider rounded-md">
          {isEditing && (
            <>
              <CardContent>
                {!isPreview && (
                  <>
                    <div
                      className="flex gap-1 flex-wrap"
                      onMouseDown={handleInteractiveMouseDown}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="p-1 rounded-md hover:bg-muted cursor-pointer"
                              onClick={(e) => insertMarkdown("heading", e)}
                            >
                              <HeadingIcon size={16} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Add heading</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="p-1 rounded-md hover:bg-muted cursor-pointer"
                              onClick={(e) => insertMarkdown("bold", e)}
                            >
                              <BoldIcon size={16} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Add bold text</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="p-1 rounded-md hover:bg-muted cursor-pointer"
                              onClick={(e) => insertMarkdown("italic", e)}
                            >
                              <ItalicIcon size={16} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Add italic text</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="p-1 rounded-md hover:bg-muted cursor-pointer"
                              onClick={(e) => insertMarkdown("quote", e)}
                            >
                              <QuoteIcon size={16} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Add quote</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="p-1 rounded-md hover:bg-muted cursor-pointer"
                              onClick={(e) => insertMarkdown("code", e)}
                            >
                              <CodeIcon size={16} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Add code</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="p-1 rounded-md hover:bg-muted cursor-pointer"
                              onClick={(e) => insertMarkdown("image", e)}
                            >
                              <ImageIcon size={16} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Add image</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="p-1 rounded-md hover:bg-muted cursor-pointer"
                              onClick={(e) => insertMarkdown("link", e)}
                            >
                              <LinkIcon size={16} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Add link</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="p-1 rounded-md hover:bg-muted cursor-pointer"
                              onClick={(e) => insertMarkdown("numbered", e)}
                            >
                              <ListOrderedIcon size={16} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Add numbered list</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="p-1 rounded-md hover:bg-muted cursor-pointer"
                              onClick={(e) => insertMarkdown("unordered", e)}
                            >
                              <ListIcon size={16} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Add bullet list</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="p-1 rounded-md hover:bg-muted cursor-pointer"
                              onClick={() => setIsPreview(true)}
                              onMouseDown={handleInteractiveMouseDown}
                            >
                              <EyeIcon size={16} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Preview</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="flex flex-col h-full">
                      <div className="relative">
                        <textarea
                          value={content}
                          onChange={(e) => _onEditContent(e.target.value)}
                          placeholder="Enter markdown text here..."
                          className="w-full h-full min-h-[200px] font-mono p-3 pr-12 border border-border rounded-md 
        focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
        bg-background text-foreground resize-none"
                          onMouseDown={handleInteractiveMouseDown}
                          ref={textareaRef}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <a
                          href="https://www.markdownguide.org/basic-syntax/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <LucideBookMarked size={18} />
                          <span>Markdown is supported</span>
                        </a>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={_onCancelChanges}>
                            Cancel
                          </Button>
                          <Button onClick={_onSaveContent} color="primary">
                            {chartLoading ? (
                              <Loader2Icon className="animate-spin" />
                            ) : (
                              "Save"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {isPreview && (
                  <div className="relative prose prose-xs md:prose-sm dark:prose-invert prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base prose-h5:text-sm prose-h6:text-xs prose-a:text-primary hover:prose-a:text-primary-400 prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:pl-2 prose-blockquote:italic prose-strong:font-bold prose-em:italic prose-pre:bg-content2 prose-pre:text-foreground prose-pre:p-2 prose-pre:rounded prose-img:rounded prose-img:mx-auto max-w-none p-1 leading-tight [&>p]:mb-4 [&>*]:my-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-1 right-1"
                      onClick={() => setIsPreview(false)}
                    >
                      <PencilIcon />
                    </Button>
                    {MemoizedMarkdown}
                  </div>
                )}
              </CardContent>
            </>
          )}
          {!isEditing && (
            <CardContent className="relative">
              {!isPublic && (
                <div
                  className={`absolute top-4 right-2 ${
                    _canAccess("projectEditor") ? "" : "hidden"
                  }`}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <EllipsisVerticalIcon />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {_canAccess("projectEditor") && (
                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                          <PencilIcon className="mr-2 h-4 w-4" />
                          <span>Edit content</span>
                        </DropdownMenuItem>
                      )}
                      {_canAccess("projectEditor") && (
                        <>
                          <DropdownMenuItem onClick={onEditLayout}>
                            <LayoutDashboardIcon
                              className={cn(
                                "mr-2 h-4 w-4",
                                editingLayout && "text-primary"
                              )}
                            />
                            <span
                              className={editingLayout ? "text-primary" : ""}
                            >
                              {editingLayout
                                ? "Complete layout"
                                : "Edit layout"}
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      {!chart.draft && _canAccess("projectEditor") && (
                        <>
                          <DropdownMenuItem onClick={_onChangeReport}>
                            {chart.onReport ? (
                              <MonitorXIcon className="mr-2 h-4 w-4" />
                            ) : (
                              <MonitorIcon className="mr-2 h-4 w-4" />
                            )}
                            <span>
                              {chart.onReport
                                ? "Remove from report"
                                : "Add to report"}
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      {_canAccess("projectEditor") && (
                        <DropdownMenuItem
                          onClick={_onDeleteChartConfirmation}
                          className="text-destructive focus:text-destructive"
                        >
                          <TrashIcon className="mr-2 h-4 w-4" />
                          <span>Delete widget</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              <div className="prose prose-xs md:prose-sm dark:prose-invert prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base prose-h5:text-sm prose-h6:text-xs prose-a:text-primary hover:prose-a:text-primary-400 prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:pl-2 prose-blockquote:italic prose-strong:font-bold prose-em:italic prose-pre:bg-content2 prose-pre:text-foreground prose-pre:p-2 prose-pre:rounded prose-img:rounded prose-img:mx-auto max-w-none p-1 leading-tight [&>p]:mb-4 [&>*]:my-2">
                {MemoizedMarkdown}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/*  <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader>
            <div className="font-bold">Remove the widget?</div>
          </ModalHeader>
          <ModalBody>
            <div className="text-sm">
              {
                "The widget will be removed from the dashboard and you won't be able to see it anymore."
              }
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="bordered"
              onPress={() => setDeleteModal(false)}
              auto
            >
              Go back
            </Button>
            <Button
              color="danger"
              endContent={<TrashIcon />}
              onPress={_onDeleteChart}
              isLoading={chartLoading}
            >
              Remove completely
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal> */}
    </motion.div>
  );
}
