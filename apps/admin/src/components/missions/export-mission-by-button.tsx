"use client";

import { Button } from "@tada/ui/components/button";
import { useState } from "react";

export function ExportMissionIdButton({ missionId }: { missionId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    const res = await fetch(`/api/export-mission-by-id-csv?id=${missionId}`);
    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "missions_export.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    setLoading(false);
  };

  return (
    <Button onClick={handleDownload} disabled={loading}>
      {loading ? "Export en cours..." : "📄 Exporter en CSV"}
    </Button>
  );
}
