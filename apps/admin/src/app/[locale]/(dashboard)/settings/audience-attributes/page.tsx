"use client";

import { useState, useEffect } from "react";
import { Button } from "@tada/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tada/ui/components/card";
import { Plus, Settings, Filter } from "lucide-react";
import { AttributeManager } from "@/components/settings/attribute-manager";
import { AttributeList } from "@/components/settings/attribute-list";

export default function AudienceAttributesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [attributes, setAttributes] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeAttributes: 0,
    enrichedProfiles: 0,
    totalContributors: 0,
    completionRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Charger les attributs et calculer les statistiques
  const fetchAttributes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/audience-attributes");
      if (response.ok) {
        const attributesData = await response.json();
        setAttributes(attributesData);
        
        // Calculer les statistiques
        const activeCount = attributesData.filter((attr: any) => attr.active).length;
        const totalValues = attributesData.reduce((sum: number, attr: any) => sum + (attr._count?.values || 0), 0);
        
        setStats({
          activeAttributes: activeCount,
          enrichedProfiles: totalValues,
          totalContributors: 2500, // TODO: Récupérer depuis l'API
          completionRate: totalValues > 0 ? Math.round((totalValues / 2500) * 100 * 10) / 10 : 0,
        });
      }
    } catch (error) {
      console.error("Error fetching attributes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  const handleRefresh = () => {
    fetchAttributes();
  };

  const handleAttributeCreated = (newAttribute: any) => {
    console.log("Nouvel attribut créé:", newAttribute);
    
    // Ajouter les propriétés manquantes pour l'affichage
    const attributeWithCount = {
      ...newAttribute,
      _count: {
        values: 0
      }
    };
    
    // Ajouter le nouvel attribut à la fin de la liste
    setAttributes(prevAttributes => {
      console.log("Ajout du nouvel attribut à la liste");
      return [...prevAttributes, attributeWithCount];
    });
    
    // Mettre à jour les statistiques
    const newActiveCount = newAttribute.active ? stats.activeAttributes + 1 : stats.activeAttributes;
    setStats(prevStats => ({
      ...prevStats,
      activeAttributes: newActiveCount,
    }));
  };

  const handleAttributeUpdated = (updatedAttribute: any) => {
    // Mettre à jour l'attribut dans la liste
    setAttributes(prevAttributes => 
      prevAttributes.map(attr => 
        attr.id === updatedAttribute.id ? updatedAttribute : attr
      )
    );
    
    // Recalculer les statistiques
    fetchAttributes();
  };

  const handleAttributeDeleted = (deletedId: string) => {
    // Supprimer l'attribut de la liste
    setAttributes(prevAttributes => 
      prevAttributes.filter(attr => attr.id !== deletedId)
    );
    
    // Recalculer les statistiques
    fetchAttributes();
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Attributs d'audience
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez les attributs personnalisés pour filtrer et enrichir les profils des contributeurs
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel attribut
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-3 lg:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Attributs actifs
            </CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <div className="text-2xl font-bold tabular-nums mt-2 pl-8">{stats.activeAttributes}</div>
              <p className="text-xs text-muted-foreground pl-8">
                Attributs configurés
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Profils enrichis
            </CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <div className="text-2xl font-bold tabular-nums mt-2 pl-8">{stats.enrichedProfiles.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground pl-8">
                Valeurs enregistrées
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taux de complétion
            </CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <div className="text-2xl font-bold tabular-nums mt-2 pl-8">{stats.completionRate}%</div>
              <p className="text-xs text-muted-foreground pl-8">
                Taux d'enrichissement
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des attributs */}
      <Card>
        <CardHeader>
          <CardTitle>Attributs configurés</CardTitle>
          <CardDescription>
            Gérez les attributs utilisés pour filtrer et enrichir les profils
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AttributeList 
            initialAttributes={attributes}
            onRefresh={handleRefresh}
            onAttributeUpdated={handleAttributeUpdated}
            onAttributeDeleted={handleAttributeDeleted}
          />
        </CardContent>
      </Card>

      {/* Modal de création/édition */}
      <AttributeManager
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
        }}
        onAttributeCreated={handleAttributeCreated}
      />
    </div>
  );
}
