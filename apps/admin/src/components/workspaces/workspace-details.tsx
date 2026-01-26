export default function WorkspaceDetails({ workspace }: { workspace: any }) {
  const infos = [
    { label: "Industrie", value: workspace.industry },
    { label: "Taille", value: workspace.companySize },
    { label: "Pays", value: workspace.country },
    { label: "Owner", value: workspace.owner?.name },
    { label: "Email owner", value: workspace.owner?.email },
    {
      label: "Créé le",
      value: new Date(workspace.createdAt).toLocaleDateString("fr-FR"),
    },
  ];

  return (
    <div className="rounded-lg border bg-white shadow-sm divide-y">
      <h3 className="text-xl font-medium p-6">Informations générales</h3>

      {infos.map((info, idx) => (
        <div key={idx} className="flex justify-between items-center px-6 py-4">
          <span className="text-gray-600">{info.label}</span>
          <span className="font-medium">{info.value || "—"}</span>
        </div>
      ))}
    </div>
  );
}
