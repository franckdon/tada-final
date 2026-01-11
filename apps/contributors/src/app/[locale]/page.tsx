import { HeroSection } from "@/components/HeroSection";
import { PartnersSection } from "@/components/PartnersSection";
import { ThreeStepsSection } from "@/components/ThreeStepsSection";
import { GlobalDemandSection } from "@/components/GlobalDemandSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { CTASection } from "@/components/CTASection";
import { EarningsSimulator } from "@/components/EarningsSimulator";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <PartnersSection />
      <ThreeStepsSection />
      <GlobalDemandSection />
      <TestimonialsSection />
      <CTASection />
      {/* <EarningsSimulator /> */}
    </div>
  );
}
