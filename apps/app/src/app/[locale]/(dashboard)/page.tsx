import { HomeCardsSlider } from "@/components/home/HomeCardsSlider";
import { HomeQuickActionsSection } from "@/components/home/HomeQuickActionsSection";
import { GreetingSectionServer } from "./GreetingSection.server";

export default async function Home() {
  const slides = [
    {
      title: "Get ready for effortless consumer research",
      description:
        "Reach out to book a free demo or chat with our experts to get to know the platform and make the most out of it.",
      ctaLabel: "Book a free demo",
      ctaHref: "https://www.tadaiq.com/schedule-a-demo",
      imageSrc: "/images/close-up-people-back-office.jpg",
      imageAlt: "Team members collage",
    },
    {
      title: "More powerful filtering options when programming surveys",
      description:
        "We updated our filters allowing for even more flexibility (HAS/HAS NOT, AND/OR, up to 3 filter groups). Existing drafts retain old filter logic until duplicated.",
      imageSrc:
        "https://images.ctfassets.net/59y9bw5aqpl9/3yl93ygCRbbKjeK20NEr8L/0c3ede0c5d591d346c52f3f5a37ea4a3/Card__1_.jpg",
      imageAlt: "Filtering options card",
    },
    {
      title: "Get ready for effortless consumer research",
      description:
        "Reach out to book a free demo or chat with our experts to get to know the platform and make the most out of it.",
      ctaLabel: "Book a free demo",
      ctaHref: "https://www.tadaiq.com/schedule-a-demo",
      imageSrc:
        "/images/local-market-scene-with-happy-traders-selling-one-using-his-phone-make-video-call.jpg",
      imageAlt: "Local market",
    },
    {
      title: "Get ready for effortless consumer research",
      description:
        "Reach out to book a free demo or chat with our experts to get to know the platform and make the most out of it.",
      ctaLabel: "Book a free demo",
      ctaHref: "https://www.tadaiq.com/schedule-a-demo",
      imageSrc: "/images/woman-checking-covid-19-mobile-application.jpg",
      imageAlt: "Mobile application",
    },
    {
      title: "Get ready for effortless consumer research",
      description:
        "Reach out to book a free demo or chat with our experts to get to know the platform and make the most out of it.",
      ctaLabel: "Book a free demo",
      ctaHref: "https://www.tadaiq.com/schedule-a-demo",
      imageSrc: "/images/3.jpg",
      imageAlt: "Generic visual",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="p-6 md:p-8 bg-white rounded-xl">
          <GreetingSectionServer />

          <HomeQuickActionsSection />

          <HomeCardsSlider slides={slides} />
        </div>
      </div>
    </div>
  );
}
