import { PermissionBoundary, UnauthorizedMessage } from "@/components/auth/permission-boundary";
import { PERMISSIONS } from "@/lib/rbac/roles";
import {
  ADMIN_SUB_ROLES,
  ADMIN_SUB_ROLE_METADATA,
  ADMIN_SUB_ROLE_PERMISSIONS,
} from "@/lib/rbac/roles";
import { Badge } from "@tada/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@tada/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tada/ui/components/table";
import { Shield, Settings, Users, CheckCircle, DollarSign, FileSearch } from "lucide-react";

export const metadata = {
  title: "Gestion des Permissions | Tada",
  description: "Vue d'ensemble des permissions par sous-rôle administrateur",
};

const iconMap = {
  Shield: Shield,
  Settings: Settings,
  Users: Users,
  CheckCircle: CheckCircle,
  DollarSign: DollarSign,
  FileSearch: FileSearch,
};

const colorMap: Record<string, string> = {
  red: "bg-red-100 text-red-800",
  blue: "bg-blue-100 text-blue-800",
  green: "bg-green-100 text-green-800",
  orange: "bg-orange-100 text-orange-800",
  purple: "bg-purple-100 text-purple-800",
  gray: "bg-gray-100 text-gray-800",
};

export default async function PermissionsPage() {
  return (
    <PermissionBoundary
      permission={PERMISSIONS.SETTINGS_READ}
      fallback={<UnauthorizedMessage />}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Gestion des Permissions
          </h1>
          <p className="text-gray-600 mt-2">
            Vue d'ensemble des sous-rôles administrateurs et leurs permissions
          </p>
        </div>

        {/* Sous-rôles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(ADMIN_SUB_ROLES).map((subRole) => {
            const metadata = ADMIN_SUB_ROLE_METADATA[subRole];
            const permissions = ADMIN_SUB_ROLE_PERMISSIONS[subRole];
            const IconComponent = iconMap[metadata.icon as keyof typeof iconMap];

            return (
              <Card key={subRole}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {IconComponent && <IconComponent className="h-6 w-6" />}
                      <div>
                        <CardTitle className="text-lg">{metadata.label}</CardTitle>
                        <Badge className={`mt-1 ${colorMap[metadata.color]}`}>
                          {permissions.length} permissions
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-2">
                    {metadata.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase">
                      Équipe concernée
                    </p>
                    <p className="text-sm text-gray-700">{metadata.team}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Matrice des permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Matrice des Permissions</CardTitle>
            <CardDescription>
              Détail des permissions par sous-rôle administrateur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Sous-rôle</TableHead>
                    <TableHead>Utilisateurs</TableHead>
                    <TableHead>Organisations</TableHead>
                    <TableHead>Missions</TableHead>
                    <TableHead>Finances</TableHead>
                    <TableHead>Modération</TableHead>
                    <TableHead>Système</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(ADMIN_SUB_ROLES).map((subRole) => {
                    const metadata = ADMIN_SUB_ROLE_METADATA[subRole];
                    const permissions = ADMIN_SUB_ROLE_PERMISSIONS[subRole];

                    const hasUserPerms = permissions.some((p) => p.startsWith("users:"));
                    const hasOrgPerms = permissions.some((p) => p.startsWith("organizations:"));
                    const hasMissionPerms = permissions.some((p) => p.startsWith("missions:"));
                    const hasFinancePerms = permissions.some(
                      (p) => p.startsWith("payments:") || p.startsWith("billing:") || p.startsWith("financial:")
                    );
                    const hasContentPerms = permissions.some(
                      (p) => p.startsWith("content:") || p.startsWith("submissions:") || p.startsWith("fraud:")
                    );
                    const hasSystemPerms = permissions.some(
                      (p) => p.startsWith("system:") || p.startsWith("security:") || p.startsWith("settings:")
                    );

                    return (
                      <TableRow key={subRole}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Badge className={colorMap[metadata.color]}>
                              {metadata.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {hasUserPerms ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {hasOrgPerms ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {hasMissionPerms ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {hasFinancePerms ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {hasContentPerms ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {hasSystemPerms ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Liste détaillée des permissions par sous-rôle */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.values(ADMIN_SUB_ROLES).map((subRole) => {
            const metadata = ADMIN_SUB_ROLE_METADATA[subRole];
            const permissions = ADMIN_SUB_ROLE_PERMISSIONS[subRole];

            return (
              <Card key={subRole}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Badge className={colorMap[metadata.color]}>
                      {metadata.label}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{metadata.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {permissions.map((permission) => (
                      <div
                        key={permission}
                        className="text-xs font-mono bg-gray-50 px-2 py-1 rounded"
                      >
                        {permission}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </PermissionBoundary>
  );
}
