import { MissionsSection } from "@/components/contributors/missions-completed";
import ProfileCard from "@/components/contributors/profile-card";
import ProfileDetails from "@/components/contributors/profile-details";
import { prisma } from "@/lib/prisma";
import { getI18n } from "@/locales/server";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@tada/ui/components/avatar";
import { Button } from "@tada/ui/components/button";
import Link from "next/link";
import { Edit, ChevronLeft } from "lucide-react";


export const metadata = {
  title: "Contributeur | Tada",
};

export default async function ContributorPage({
  params,
}: {
  params: { id: string };
}) {
    const t = await getI18n();

    const contributor = await prisma.user.findUnique({
        where: {
        id: params.id,
        },
        select: {
        id: true,
        name: true,
        email: true,
        role: true,
        sector: true,
        position: true,
        kyc_status: true,
        image: true,
        location: true,
        country: true,
        job: true,
        banned: true,
        },
    });

    if (!contributor) return <div>{t("contributors.detail.notFound")}</div>;

    const infos = [
        {
            label: "Email",
            value: contributor.email,
        },
        {
            label: t("user.infos.data.role"),
            value: contributor.role,
        },
        {
            label: t("user.infos.data.job"),
            value: contributor.job,
        },
        {
            label: t("user.infos.data.sector"),
            value: contributor.sector,
        },
        {
            label: t("user.infos.data.position"),
            value: contributor.position,
        },
        {
            label: t("user.infos.data.location"),
            value: contributor.location,
        },
        {
            label: t("user.infos.data.country"),
            value: contributor.country,
        },
    ];
    
    return (
        <div className="p-5 text-gray-800">
            <div className="mb-6">
                <Button variant="ghost" asChild>
                    <Link href="/users">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                        {t("user.infos.goBack")}
                    </Link>
                </Button>
            </div>
            <div className="w-full rounded-lg border border-gray-100 bg-white shadow-sm">
                <div className="grid md:grid-cols-5">
                    <div className="md:col-span-2 flex flex-col items-center justify-center">
                        {/* Section avatar et infos personnelles */}
                        <div className="flex flex-col items-center p-6 pb-0">
                            <Avatar className="md:h-32 md:w-32 mr-3">
                                {contributor.image && (
                                <AvatarImage src={contributor.image} alt="User avatar" />
                                )}
                                <AvatarFallback>
                                {contributor.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                
                            <h2 className="mt-4 text-2xl font-medium text-gray-800">
                                {contributor.name}
                            </h2>
                            <p className="mt-1 mb-6 text-lg text-gray-500">{contributor.job}</p>
                        </div>
                        {/* Section bouton mobile */}
                        <div className="p-6 hidden md:block">
                            <Button
                                className="w-full"
                                variant="default"
                            >
                                <Link
                                href={`/contributors/edit/${contributor.id}`}
                                className="flex items-center gap-2"
                                >
                                <Edit className="h-4 w-4 text-white" />
                                {t("contributors.detail.actions.edit")}
                                </Link>
                            </Button>
                        </div>
                    </div>
            
                    {/* Section statistiques */}
                    <div className="md:col-span-3 divide-y">
                        <h1 className="text-2xl font-medium text-gray-800 my-6 hidden md:block">{t("user.infos.title")}</h1>
                        
                        {infos.map((info, index) => (
                            <div
                                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                                key={index}
                                className="flex items-center justify-between px-6 py-4"
                            >
                                <span className="text-gray-700">{info.label}</span>
                                <span className="font-medium text-gray-900">{info.value}</span>
                            </div>
                        ))}
                    </div>
            
                    {/* Section bouton desktop */}
                    <div className="p-6 md:hidden">
                        <Button
                            className="w-full"
                            variant="default"
                        >
                            <Link
                            href={`/contributors/edit/${contributor.id}`}
                            className="flex items-center gap-2"
                            >
                            <Edit className="h-4 w-4 text-white" />
                            {t("contributors.detail.actions.edit")}
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
