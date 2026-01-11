"use client";

import type React from "react";
import mapboxgl from "mapbox-gl";
import { useEffect, useRef, useState, useMemo } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@tada/ui/components/sheet";
import { Badge } from "@tada/ui/components/badge";
import { Button } from "@tada/ui/components/button";
import {
  MapPin,
  Calendar,
  X,
  Star,
  Check,
  FileText,
  MessageSquare,
  CheckSquare,
  ChevronDown,
  Clock,
  User,
} from "lucide-react";

// Types pour les données de sondage
type SurveyResponse = Record<string, any>;

// Interface pour les données de localisation extraites des surveys
interface MapLocation {
  id: string;
  coordinates: [number, number]; // [longitude, latitude]
  count: number;
  location: string;
  responses: SurveyResponse[];
  columns: string[];
}

interface MapboxMapProps {
  accessToken: string;
  surveys: SurveyResponse[];
  columns: string[];
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  width?: string;
  height?: string;
}

export const MapboxMap: React.FC<MapboxMapProps> = ({
  accessToken,
  surveys,
  columns,
  initialViewState = {
    longitude: 0,
    latitude: 20,
    zoom: 8,
  },
  width = "100%",
  height = "400px",
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(
    null
  );
  const [selectedResponse, setSelectedResponse] =
    useState<SurveyResponse | null>(null);

  // Configurer Mapbox avec votre token d'accès
  mapboxgl.accessToken = accessToken;

  // Extraire les locations des surveys
  const locations = useMemo(() => {
    const locationMap = new Map<string, MapLocation>();

    surveys?.forEach((resp) => {
      const loc = resp?.location as any;
      const label = loc?.label;
      const lng = loc?.lng;
      const lat = loc?.lat;

      if (!label || lng === undefined || lat === undefined) return;

      if (locationMap.has(label)) {
        const existingLocation = locationMap.get(label)!;
        existingLocation.count += 1;
        existingLocation.responses.push(resp);
      } else {
        locationMap.set(label, {
          id: crypto.randomUUID(),
          coordinates: [lng, lat],
          count: 1,
          location: label,
          responses: [resp],
          columns: Object.keys(resp?.responses || {}), // Utiliser les clés de responses
        });
      }
    });

    return Array.from(locationMap.values());
  }, [surveys]);

  // Supprimer la fonction detectQuestionType car on a déjà le type dans les données

  // Détecter les colonnes spéciales en utilisant les propriétés directes
  const identityColumns = useMemo(() => {
    if (!selectedResponse) return [];
    const directProps = ["age", "gender", "name"]; // Propriétés directes qui peuvent identifier
    return directProps.filter((prop) => selectedResponse[prop] !== undefined);
  }, [selectedResponse]);

  const locationColumns = useMemo(() => {
    if (!selectedResponse?.location) return [];
    return ["location"]; // La localisation est dans selectedResponse.location
  }, [selectedResponse]);

  const dateColumns = useMemo(() => {
    if (!selectedResponse) return [];
    const dateProps = ["createdAt", "updatedAt", "submittedAt"];
    return dateProps.filter((prop) => selectedResponse[prop] !== undefined);
  }, [selectedResponse]);

  const metadataColumns = useMemo(() => {
    if (!selectedResponse) return [];
    const metaProps = ["id", "surveyId", "ipAddress", "userAgent", "status"];
    return metaProps.filter((prop) => selectedResponse[prop] !== undefined);
  }, [selectedResponse]);

  // Colonnes à exclure des questions principales
  const excludedColumns = useMemo(
    () => [
      ...identityColumns,
      ...locationColumns,
      ...dateColumns,
      ...metadataColumns,
      "responses",
    ],
    [identityColumns, locationColumns, dateColumns, metadataColumns]
  );

  // Initialiser la carte
  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [initialViewState.longitude, initialViewState.latitude],
      zoom: initialViewState.zoom,
      attributionControl: false,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [
    initialViewState.longitude,
    initialViewState.latitude,
    initialViewState.zoom,
    accessToken,
  ]);

  // Ajouter les données et gérer les interactions
  useEffect(() => {
    if (!map.current || !mapLoaded || !locations?.length) return;

    const mapInstance = map.current;

    const geoJson = {
      type: "FeatureCollection",
      features:
        locations?.map((location) => ({
          type: "Feature",
          properties: {
            id: location?.id,
            count: location?.count,
            location: location?.location,
          },
          geometry: {
            type: "Point",
            coordinates: location?.coordinates,
          },
        })) || [],
    };

    if (mapInstance.getSource("submissions")) {
      mapInstance.removeLayer("clusters");
      mapInstance.removeLayer("cluster-count");
      mapInstance.removeLayer("unclustered-point");
      mapInstance.removeSource("submissions");
    }

    mapInstance.addSource("submissions", {
      type: "geojson",
      data: geoJson as any,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    });

    // Styles des clusters et points
    mapInstance.addLayer({
      id: "clusters",
      type: "circle",
      source: "submissions",
      filter: ["has", "point_count"],
      paint: {
        "circle-radius": [
          "step",
          ["get", "point_count"],
          20,
          100,
          30,
          1000,
          40,
        ],
        "circle-color": [
          "step",
          ["get", "point_count"],
          "#fb923c",
          100,
          "#f97316",
          1000,
          "#ea580c",
        ],
        "circle-opacity": 0.8,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#fff",
      },
    });

    mapInstance.addLayer({
      id: "cluster-count",
      type: "symbol",
      source: "submissions",
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-size": 12,
        "text-font": ["DIN Pro Medium", "Arial Unicode MS Bold"],
      },
      paint: {
        "text-color": "#ffffff",
      },
    });

    mapInstance.addLayer({
      id: "unclustered-point",
      type: "circle",
      source: "submissions",
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-radius": 10,
        "circle-color": "#f97316",
        "circle-opacity": 0.8,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#fff",
      },
    });

    // Gérer le clic sur les points individuels
    mapInstance.on("click", "unclustered-point", (e) => {
      if (!e?.features || e.features.length === 0) return;

      const feature = e.features?.[0];
      const properties = feature?.properties;

      const location = locations?.find((loc) => loc?.id === properties?.id);
      if (location) {
        setSelectedLocation(location);
        setSelectedResponse(location?.responses?.[0] || null);
        setIsSheetOpen(true);
      }
    });

    // Gérer les clusters
    mapInstance.on("click", "clusters", (e) => {
      if (!e?.features || e.features.length === 0) return;

      const feature = e.features?.[0];
      const clusterId = feature?.properties?.cluster_id;

      const source = mapInstance.getSource(
        "submissions"
      ) as mapboxgl.GeoJSONSource;
      source?.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;

        mapInstance.easeTo({
          center: (
            feature?.geometry as unknown as { coordinates: [number, number] }
          )?.coordinates,
          zoom: zoom as number,
        });
      });
    });

    // Curseurs
    mapInstance.on("mouseenter", "clusters", () => {
      mapInstance.getCanvas().style.cursor = "pointer";
    });

    mapInstance.on("mouseleave", "clusters", () => {
      mapInstance.getCanvas().style.cursor = "";
    });

    mapInstance.on("mouseenter", "unclustered-point", () => {
      mapInstance.getCanvas().style.cursor = "pointer";
    });

    mapInstance.on("mouseleave", "unclustered-point", () => {
      mapInstance.getCanvas().style.cursor = "";
    });
  }, [mapLoaded, locations]);

  // Fonctions de formatage (reprises du composant MissionSubmission)
  // Fonction pour rendre une réponse selon son type
  const renderResponseByType = (type: string, answer: any) => {
    switch (type) {
      case "boolean":
        return formatBoolean(answer);
      case "rating":
        return (
          <div className="flex items-center mt-1">
            {renderStars(Number(answer))}
            <span className="ml-2 text-orange-800 font-medium">{answer}/5</span>
          </div>
        );
      case "text":
      case "comment":
        return renderDetailedTextResponse(String(answer));
      case "checkbox":
        if (Array.isArray(answer)) {
          return formatCheckboxArray(answer);
        }
        return formatCheckbox(String(answer));
      case "dropdown":
        return formatDropdown(String(answer));
      case "file":
        return formatFile(String(answer));
      case "multiple":
        if (Array.isArray(answer)) {
          return formatMultipleChoiceArray(answer);
        }
        return formatMultipleChoice(String(answer));
      case "date":
        return (
          <div className="mt-1 text-orange-800">
            {formatDate(String(answer))}
          </div>
        );
      default:
        return renderDetailedTextResponse(String(answer));
    }
  };

  // Nouvelle fonction pour formater les checkbox en array
  const formatCheckboxArray = (choices: string[]) => {
    if (!choices || choices.length === 0) return null;

    return (
      <div className="mt-2 space-y-2">
        {choices.map((choice, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-orange-50 p-2 rounded-md border border-orange-200"
          >
            <CheckSquare className="h-4 w-4 text-orange-500" />
            <span className="text-orange-900">{choice}</span>
          </div>
        ))}
      </div>
    );
  };

  // Nouvelle fonction pour formater les choix multiples en array
  const formatMultipleChoiceArray = (choices: string[]) => {
    if (!choices || choices.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1">
        {choices.map((choice, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="bg-orange-100 text-orange-800"
          >
            {choice}
          </Badge>
        ))}
      </div>
    );
  };

  // Fonction pour obtenir l'icône du type de question
  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "boolean":
        return <Check className="h-3 w-3 text-orange-500" />;
      case "rating":
        return <Star className="h-3 w-3 text-orange-500" />;
      case "date":
        return <Calendar className="h-3 w-3 text-orange-500" />;
      case "file":
        return <FileText className="h-3 w-3 text-orange-500" />;
      case "multiple":
      case "checkbox":
        return <CheckSquare className="h-3 w-3 text-orange-500" />;
      case "dropdown":
        return <ChevronDown className="h-3 w-3 text-orange-500" />;
      case "comment":
        return <MessageSquare className="h-3 w-3 text-orange-500" />;
      case "text":
      default:
        return <FileText className="h-3 w-3 text-orange-500" />;
    }
  };

  // Fonction pour obtenir les informations d'identité
  const getIdentityInfo = (row: SurveyResponse) => {
    if (!row) return null;

    // Chercher le nom dans les réponses
    const nameResponse =
      row.responses?.["Quel est votre nom ?"]?.answer ||
      row.responses?.["Nom"]?.answer ||
      row.responses?.["Name"]?.answer;

    return (
      <div className="bg-orange-100 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-orange-700" />
          <h3 className="text-lg font-medium text-orange-800">
            {nameResponse || "Utilisateur anonyme"}
          </h3>
        </div>

        <div className="mt-2 space-y-1">
          {/* Âge */}
          {row.age && (
            <p className="text-sm text-orange-700 flex items-center gap-1">
              <span>{row.age}</span>
              <span>ans</span>
            </p>
          )}

          {/* Genre */}
          {row.gender && (
            <p className="text-sm text-orange-700 flex items-center gap-1">
              <span>
                {row.gender === "male"
                  ? "Homme"
                  : row.gender === "female"
                  ? "Femme"
                  : row.gender}
              </span>
            </p>
          )}

          {/* Localisation */}
          {row.location?.label && (
            <p className="text-sm text-orange-700 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-orange-700" />
              <span>{row.location.label}</span>
            </p>
          )}
        </div>
      </div>
    );
  };

  // Fonction pour obtenir les informations de date
  const getDateInfo = (row: SurveyResponse) => {
    if (!row) return null;

    const submittedAt = row.submittedAt || row.createdAt;
    if (!submittedAt) return null;

    return (
      <div className="text-xs text-gray-500 flex items-center gap-1">
        <Clock className="h-3 w-3" />
        <span>Soumis le {formatDate(submittedAt)}</span>
      </div>
    );
  };

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`inline h-4 w-4 ${
            i < rating ? "text-orange-400 fill-orange-400" : "text-gray-300"
          }`}
        />
      ));
  };

  const formatBoolean = (value: any) => {
    const boolValue = value === "true" || value === true;
    return boolValue ? (
      <Badge className="bg-orange-400 hover:bg-orange-500 w-[60px] flex justify-between items-center">
        <Check className="h-3 w-3" /> Oui
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className="text-gray-400 border-gray-500 flex justify-between w-[60px] items-center"
      >
        <X className="h-3 w-3" /> Non
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  const formatMultipleChoice = (value: string) => {
    if (!value) return "-";

    const choices = value?.split(",")?.map((choice) => choice?.trim()) || [];

    return (
      <div className="flex flex-wrap gap-1">
        {choices.map((choice, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="bg-orange-100 text-orange-800"
          >
            {choice}
          </Badge>
        ))}
      </div>
    );
  };

  const formatCheckbox = (value: string) => {
    if (!value) return null;

    const choices = value?.split(",")?.map((choice) => choice?.trim()) || [];

    return (
      <div className="mt-2 space-y-2">
        {choices.map((choice, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-orange-50 p-2 rounded-md border border-orange-200"
          >
            <CheckSquare className="h-4 w-4 text-orange-500" />
            <span className="text-orange-900">{choice}</span>
          </div>
        ))}
      </div>
    );
  };

  const formatDropdown = (value: string) => {
    if (!value) return null;

    return (
      <div className="mt-2 bg-orange-50 p-3 rounded-md border border-orange-200 inline-block">
        <div className="flex items-center gap-2">
          <ChevronDown className="h-4 w-4 text-orange-500" />
          <span className="text-orange-900 font-medium">{value}</span>
        </div>
      </div>
    );
  };

  const formatFile = (value: string) => {
    if (!value) return "-";

    const files = value?.split(",")?.map((file) => file?.trim()) || [];

    const isImage = (filename: string) => {
      const ext = filename.split(".").pop()?.toLowerCase();
      return ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(
        ext || ""
      );
    };

    const getFileName = (filepath: string) => {
      return filepath.split("/").pop() || filepath;
    };

    return (
      <div className="flex flex-wrap gap-3">
        {files.map((file, index) => (
          <div
            key={index}
            className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-2 hover:shadow-md transition-shadow max-w-[200px]"
          >
            {/* Miniature */}
            <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
              {isImage(file) ? (
                <img
                  src={`/placeholder.svg?height=48&width=48`}
                  alt={getFileName(file)}
                  className="w-full h-full object-cover rounded-md"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove(
                      "hidden"
                    );
                  }}
                />
              ) : null}
            </div>

            {/* Nom du fichier */}
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium text-gray-900 truncate"
                title={getFileName(file)}
              >
                {getFileName(file)}
              </p>
              <p className="text-xs text-gray-500">
                {file.split(".").pop()?.toUpperCase() || "Fichier"}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };
  const renderDetailedTextResponse = (text: string) => {
    if (!text || text === "-") return null;

    const segments =
      text
        ?.split(/(?<=\.)(?=\s)|(?<=\?)(?=\s)|(?<=!)(?=\s)/)
        ?.filter((segment) => segment?.trim()?.length > 0) || [];

    return (
      <div className="space-y-2 mt-2">
        {segments.map((segment, index) => (
          <div
            key={index}
            className="bg-orange-50 text-orange-900 p-3 rounded-2xl inline-block max-w-[85%]"
            style={{
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {segment?.trim()}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div style={{ width, height, borderRadius: "8px", overflow: "hidden" }}>
        <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Sheet pour afficher les détails des réponses */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="border-b pb-4 mb-6">
            <div className="flex justify-between items-center">
              <SheetTitle className="text-orange-800 font-bold">
                Réponses - {selectedLocation?.location}
                {selectedResponse && getDateInfo(selectedResponse)}
              </SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSheetOpen(false)}
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          {selectedLocation && selectedResponse && (
            <div className="space-y-6">
              {getIdentityInfo(selectedResponse)}

              {selectedLocation?.responses?.length > 1 && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Réponse{" "}
                      {(selectedLocation?.responses?.indexOf(
                        selectedResponse
                      ) || 0) + 1}{" "}
                      sur {selectedLocation?.responses?.length || 0}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentIndex =
                            selectedLocation?.responses?.indexOf(
                              selectedResponse
                            ) || 0;
                          if (currentIndex > 0) {
                            setSelectedResponse(
                              selectedLocation?.responses?.[currentIndex - 1] ||
                                null
                            );
                          }
                        }}
                        disabled={
                          (selectedLocation?.responses?.indexOf(
                            selectedResponse
                          ) || 0) === 0
                        }
                      >
                        Précédent
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentIndex =
                            selectedLocation?.responses?.indexOf(
                              selectedResponse
                            ) || 0;
                          if (
                            currentIndex <
                            (selectedLocation?.responses?.length || 0) - 1
                          ) {
                            setSelectedResponse(
                              selectedLocation?.responses?.[currentIndex + 1] ||
                                null
                            );
                          }
                        }}
                        disabled={
                          (selectedLocation?.responses?.indexOf(
                            selectedResponse
                          ) || 0) ===
                          (selectedLocation?.responses?.length || 0) - 1
                        }
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {selectedResponse?.responses &&
                  Object.entries(selectedResponse.responses).map(
                    ([question, responseData]) => {
                      const { type, answer } = responseData as {
                        type: string;
                        answer: any;
                      };

                      if (
                        answer === undefined ||
                        answer === null ||
                        answer === ""
                      ) {
                        return null;
                      }

                      return (
                        <div
                          key={question}
                          className="border-b border-gray-100 pb-4"
                        >
                          <div className="flex items-center gap-1">
                            {getQuestionTypeIcon(type) && (
                              <span className="text-orange-500">
                                {getQuestionTypeIcon(type)}
                              </span>
                            )}
                            <h4 className="text-sm font-medium text-gray-500">
                              {question}
                            </h4>
                          </div>

                          {renderResponseByType(type, answer)}
                        </div>
                      );
                    }
                  )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
