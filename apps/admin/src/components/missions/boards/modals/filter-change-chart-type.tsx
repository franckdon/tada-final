"use client";

import { Button } from "@tada/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@tada/ui/components/dialog";
import { Label } from "@tada/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tada/ui/components/select";
import { Switch } from "@tada/ui/components/switch";
import { useQueryState } from "nuqs";
import { useState } from "react";

export default function FilterChangeChartType() {
  const [questionId, setQuestionId] = useQueryState("questionId", {
    defaultValue: "",
  });
  const [filter, setFilter] = useState<string>("standard");
  const [chartType, setChartType] = useState<string>("bar");
  const [isSorted, setIsSorted] = useState<boolean>(false);

  const isOpen = Boolean(questionId);

  const onClose = () => {
    setQuestionId("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl mx-auto">
        <DialogHeader>
          <DialogTitle>Modifier la visualisation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label>Filter</Label>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select a filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="age">Age</SelectItem>
                <SelectItem value="gender">Gender</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Visualisation</Label>
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger>
                <SelectValue placeholder="Select a chart type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BarChartHorizontalCard">Barres</SelectItem>
                <SelectItem value="PieChart">Diagramme circulaire</SelectItem>
                <SelectItem value="ArrayChartCard">Tableau</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="is_sorted"
              checked={isSorted}
              onCheckedChange={setIsSorted}
            />
            <Label htmlFor="is_sorted">Ordonner</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={() => {}}>Appliquer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
