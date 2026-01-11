"use client";

import { Button } from "@tada/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tada/ui/components/card";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { exportData } from "@/actions/export/export-data-action";

export default function ExportPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (model: string, format: "csv" | "json") => {
    setLoading(`${model}-${format}`);
    const result = await exportData(model, format);
    setLoading(null);

    if (result && "fileContent" in result && result.fileContent) {
      const byteCharacters = atob(result.fileContent);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: result.contentType });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename || "export.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (result && "error" in result) {
      alert(result.error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-gray-950">
      <Card className="w-full max-w-md p-3">
        <CardHeader>
          <CardTitle>Exporter les données</CardTitle>
          <CardDescription>
            Sélectionnez le type de données et le format d'exportation.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => handleExport("SurveyResponse", "csv")}
              disabled={loading === "SurveyResponse-csv"}
            >
              {loading === "SurveyResponse-csv" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Réponses Sondage (CSV)
            </Button>
            <Button
              onClick={() => handleExport("SurveyResponse", "json")}
              disabled={loading === "SurveyResponse-json"}
            >
              {loading === "SurveyResponse-json" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Réponses Sondage (JSON)
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => handleExport("User", "csv")}
              disabled={loading === "User-csv"}
            >
              {loading === "User-csv" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Utilisateurs (CSV)
            </Button>
            <Button
              onClick={() => handleExport("User", "json")}
              disabled={loading === "User-json"}
            >
              {loading === "User-json" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Utilisateurs (JSON)
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => handleExport("Organization", "csv")}
              disabled={loading === "Organization-csv"}
            >
              {loading === "Organization-csv" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Organisations (CSV)
            </Button>
            <Button
              onClick={() => handleExport("Organization", "json")}
              disabled={loading === "Organization-json"}
            >
              {loading === "Organization-json" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Organisations (JSON)
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => handleExport("Mission", "csv")}
              disabled={loading === "Mission-csv"}
            >
              {loading === "Mission-csv" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Missions (CSV)
            </Button>
            <Button
              onClick={() => handleExport("Mission", "json")}
              disabled={loading === "Mission-json"}
            >
              {loading === "Mission-json" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Missions (JSON)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
