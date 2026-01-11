// apps/web/src/components/capabilities/data.ts

export interface Capability {
  id: string;
  icon: string; // Nom d’icône Lucide ou chemin image si tu préfères
  title: string;
  description: string;
  color: string; // Couleur background du screenshot (soft pastel)
}

export const capabilities: Capability[] = [
  {
    id: "explore",
    icon: "Search",
    title: "home.capabilities.items.0.title",
    description: "home.capabilities.items.0.description",
    color: "bg-green-100",
  },
  {
    id: "test",
    icon: "FlaskConical",
    title: "home.capabilities.items.1.title",
    description: "home.capabilities.items.1.description",
    color: "bg-rose-100",
  },
  {
    id: "pulse",
    icon: "Activity",
    title: "home.capabilities.items.2.title",
    description: "home.capabilities.items.2.description",
    color: "bg-orange-100 border border-orange-300",
  },
  {
    id: "capture",
    icon: "Camera",
    title: "home.capabilities.items.3.title",
    description: "home.capabilities.items.3.description",
    color: "bg-blue-100",
  },
  {
    id: "segment",
    icon: "PieChart",
    title: "home.capabilities.items.4.title",
    description: "home.capabilities.items.4.description",
    color: "bg-purple-100",
  },
  {
    id: "track",
    icon: "LineChart",
    title: "home.capabilities.items.5.title",
    description: "home.capabilities.items.5.description",
    color: "bg-indigo-100",
  },
];