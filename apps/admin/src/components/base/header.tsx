"use client";

import { useI18n } from "@/locales/client";
import { Button } from "@tada/ui/components/button";
import { Input } from "@tada/ui/components/input";
import { cn } from "@tada/ui/lib/utils";
import { Calendar, Moon, Search, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

interface HeaderProps {
  title?: string;
  className?: string;
}

export function Header({ title = "Dashboard", className }: HeaderProps) {
  const t = useI18n();
  const { setTheme, theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <header
      className={cn(
        "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4 px-6",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-lg font-medium mr-4 dark:text-white">{title}</h1>
          <div className="relative">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("common.search.placeholder")}
              className="py-2 pl-4 pr-10 w-64"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {!searchQuery && (
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleThemeToggle}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
