"use client";
import { useChartBuilder } from "@/context/chart-builder-context";

export function QueryResults() {
  const {
    data: filteredData,
    filters,
    generateFieldConfig,
  } = useChartBuilder();

  const fieldConfig = generateFieldConfig(filteredData);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {Object.entries(fieldConfig).map(([key, config]) => (
              <th
                key={key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {config.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredData.map((item) => (
            <tr key={item.id as string} className="hover:bg-gray-50">
              {Object.entries(fieldConfig).map(([key, config]) => (
                <td
                  key={key}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {config.type === "boolean" ? (
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item[key]
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item[key] ? "Oui" : "Non"}
                    </span>
                  ) : config.type === "select" && key === "status" ? (
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item[key] === "active"
                          ? "bg-green-100 text-green-800"
                          : item[key] === "inactive"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {item[key] as string}
                    </span>
                  ) : config.type === "number" && key === "salary" ? (
                    `${item[key]?.toLocaleString()} €`
                  ) : config.type === "date" ? (
                    new Date(item[key] as string).toLocaleDateString("fr-FR")
                  ) : item[key] instanceof Date ? (
                    item[key].toLocaleString()
                  ) : (
                    item[key]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {filteredData.length === 0 && filters.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          Aucun résultat ne correspond aux filtres appliqués.
        </div>
      )}
    </div>
  );
}
