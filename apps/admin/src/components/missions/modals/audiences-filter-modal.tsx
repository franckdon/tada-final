"use client";

import {
  type Filter,
  useAudiencesFilter,
} from "@/context/audiences-filter-context";
import { Button } from "@tada/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@tada/ui/components/dialog";
import { useEffect, useState } from "react";

interface ExpandedGroupsState {
  [groupId: string]: boolean;
}

type Props = {
  onOpenChange: (isOpen: boolean) => void;
  isOpen: boolean;
};

export function AudiencesFilterModal({ onOpenChange, isOpen }: Props) {
  const [expandedGroups, setExpandedGroups] = useState<ExpandedGroupsState>({});
  const {
    activeFiltersCount,
    selectedFilters,
    filterGroups,
    handleOptionSelect,
    setSelectedFilters,
  } = useAudiencesFilter();

  const isOptionSelected = (
    groupId: string,
    filterId: string,
    value: string,
  ) => {
    return selectedFilters[groupId]?.[filterId]?.includes(value) || false;
  };

  const resetFilters = () => {
    setSelectedFilters({});
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prevState) => {
      const newState: ExpandedGroupsState = {};
      // biome-ignore lint/complexity/noForEach: <explanation>
      Object.keys(prevState).forEach((key) => {
        newState[key] = false;
      });
      newState[groupId] = true;
      return newState;
    });
  };

  const renderMultiSelectFilter = (groupId: string, filter: Filter) => {
    return (
      <div className="h-full">
        <h4 className="text-sm font-medium text-gray-800 mb-2">
          {filter.label}
        </h4>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-2 thin-scrollbar">
          {filter.options?.map((option) => (
            <div key={option.value} className="flex items-center">
              <input
                type="checkbox"
                id={`${groupId}-${filter.id}-${option.value}`}
                checked={isOptionSelected(groupId, filter.id, option.value)}
                onChange={(e) =>
                  handleOptionSelect(
                    groupId,
                    filter.id,
                    option.value,
                    e.target.checked,
                  )
                }
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label
                htmlFor={`${groupId}-${filter.id}-${option.value}`}
                className="ml-2 text-sm text-gray-600 font-normal"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFreeTextFilter = (groupId: string, filter: Filter) => {
    return (
      <div className="h-full">
        <h4 className="text-sm font-medium text-gray-800 mb-2">
          {filter.label}
        </h4>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder={`Entrez ${filter.label.toLowerCase()}`}
        />
      </div>
    );
  };

  useEffect(() => {
    if (filterGroups.length > 0 && Object.keys(expandedGroups).length === 0) {
      toggleGroup(filterGroups[0]!.id);
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl mx-auto">
        <div className="p-4">
          <DialogHeader>
            <DialogTitle>
              Filtrer les audiences{" "}
              {activeFiltersCount > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {activeFiltersCount}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className=" py-5  overflow-y-auto">
            <div className="flex flex-nowrap">
              <div className="w-64 min-w-[16rem] border-r border-gray-200 px-4">
                <h4 className="text-xs uppercase font-semibold text-gray-500 mb-4 tracking-wider">
                  Catégories
                </h4>
                <nav className="space-y-1">
                  {filterGroups.map((group) => (
                    <button
                      type="button"
                      key={group.id}
                      onClick={() => toggleGroup(group.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        expandedGroups[group.id]
                          ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <span className="truncate">{group.label}</span>
                      {selectedFilters[group.id] &&
                        Object.keys(selectedFilters[group.id]!).length > 0 && (
                          <span className="ml-auto inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {Object.keys(selectedFilters[group.id]!).length}
                          </span>
                        )}
                    </button>
                  ))}
                </nav>
              </div>
              <div className="flex-1 px-6">
                {filterGroups.map((group) => (
                  <div
                    key={group.id}
                    className={expandedGroups[group.id] ? "block" : "hidden"}
                  >
                    <div className="border-b border-gray-200 pb-4 mb-6">
                      <h3 className="text-xl font-medium text-gray-900">
                        {group.label}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Sélectionnez les critères pour filtrer votre audience
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
                      {group.filters.map((filter) => (
                        <div
                          key={filter.id}
                          className="col-span-1 bg-white rounded-lg p-4 border border-gray-100 shadow-sm"
                        >
                          {filter.type === "multiSelect" &&
                            renderMultiSelectFilter(group.id, filter)}
                          {filter.type === "freeText" &&
                            renderFreeTextFilter(group.id, filter)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 mb-6">
            <DialogFooter>
              <div className="space-x-4">
                <Button type="button" variant="outline" onClick={resetFilters}>
                  Réinitialiser
                </Button>
              </div>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
