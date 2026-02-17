import { prisma } from "@/lib/prisma";

import { HomeCardsSlider } from "@/components/home/HomeCardsSlider";
import { HomeQuickActionsSection } from "@/components/home/HomeQuickActionsSection";
import { GreetingSectionServer } from "./GreetingSection.server";
import { getPublicUrlForPath } from "@/lib/uploads.public";
import { HomeTemplatesSection } from "@/components/home/HomeTemplatesSection";
import { HomeScheduleCallSection } from "@/components/home/HomeScheduleCallSection";

export default async function Home() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
    take: 10,
    include: { topic: true },
  });

  const slides = posts.map((p) => ({
    title: p.title,
    description: p.excerpt ?? p.content.slice(0, 140) + "...",
    ctaLabel: "Read more",
    ctaHref: `/blog/${p.slug}`,
    imageSrc:
      getPublicUrlForPath({
        category: "blogCover",
        pathOrUrl: p.coverPath,
      }) ?? "/images/placeholder.jpg",
    imageAlt: p.title,
  }));

  console.log(slides.length);
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-8xl mx-auto px-4">
        <div className="p-6 md:p-8 bg-white rounded-xl">
          <GreetingSectionServer />

          <HomeQuickActionsSection />

          <HomeCardsSlider slides={slides} />

          <HomeTemplatesSection />

          <HomeScheduleCallSection />
        </div>
      </div>
    </div>
  );
}
