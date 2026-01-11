"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/locales/client";

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  backgroundImage: string;
  backgroundColor?: string;
  rating: number;
}

export function HeroSection() {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [isHeroAnimating, setIsHeroAnimating] = useState(false);
  const router = useRouter();
  const t = useI18n();

  const heroSlides: HeroSlide[] = [
    {
      id: 1,
      title: t("home.header.hero_section.title_1"),
      subtitle: t("home.header.hero_section.subtitle_1"),
      description: t("home.header.hero_section.description_1"),
      buttonText: t("home.header.hero_section.button_text_1"),
      backgroundImage: "/images/1.jpg",
      backgroundColor: "orange",
      rating: 5,
    },
    {
      id: 2,
      title: t("home.header.hero_section.title_2"),
      subtitle: t("home.header.hero_section.subtitle_2"),
      description: t("home.header.hero_section.description_2"),
      buttonText: t("home.header.hero_section.button_text_2"),
      backgroundImage: "/images/2.jpg",
      backgroundColor: "blue",
      rating: 5,
    },
    {
      id: 3,
      title: t("home.header.hero_section.title_3"),
      subtitle: t("home.header.hero_section.subtitle_3"),
      description: t("home.header.hero_section.description_3"),
      buttonText: t("home.header.hero_section.button_text_3"),
      backgroundImage: "/images/3.jpg",
      backgroundColor: "red",
      rating: 5,
    },
  ];

  // Auto-slide hero section
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHeroAnimating) {
        setIsHeroAnimating(true);
        setTimeout(() => {
          setCurrentHeroIndex((prev) => (prev + 1) % heroSlides.length);
          setIsHeroAnimating(false);
        }, 300);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isHeroAnimating]);

  const goToHeroSlide = (index: number) => {
    if (isHeroAnimating || index === currentHeroIndex) return;
    setIsHeroAnimating(true);
    setTimeout(() => {
      setCurrentHeroIndex(index);
      setIsHeroAnimating(false);
    }, 300);
  };
  const currentHeroSlide = heroSlides[currentHeroIndex];
  return (
    <div className="relative overflow-hidden p-2 sm:p-4 min-h-[500px] sm:min-h-[600px] md:min-h-[650px] lg:min-h-[600px] xl:min-h-[700px]">
      {/* Génération des couleurs du background */}
      <div className="from-orange-400/90 to-orange-400/80"></div>
      <div className="from-blue-400/90 to-blue-400/80"></div>
      <div className="from-red-400/90 to-red-400/80"></div>
      {/* Background Image with Overlay */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${
          isHeroAnimating ? "scale-110" : "scale-100"
        }`}
        style={{ backgroundImage: `url(${currentHeroSlide?.backgroundImage})` }}
      >
        <div className={`absolute inset-0 bg-gradient-to-r from-${currentHeroSlide?.backgroundColor}-400/90 to-${currentHeroSlide?.backgroundColor}-400/80`}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-full flex items-center py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div
              className={`lg:col-span-3 text-white transition-all duration-500 text-center lg:text-left ${
                isHeroAnimating
                  ? "opacity-0 translate-x-8"
                  : "opacity-100 translate-x-0"
              }`}
              >
              {/* Subtitle Badge */}
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 mb-3 sm:mb-4 lg:mb-6">
                <span className="text-[10px] xs:text-xs sm:text-sm lg:text-base font-semibold uppercase tracking-wider leading-none">
                  {currentHeroSlide?.subtitle}
                </span>
              </div>

              {/* Main Title */}
              <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold leading-[1.2] mb-3 sm:mb-4 lg:mb-6 px-1 sm:px-0 break-words hyphens-auto">
                {currentHeroSlide?.title}
              </h2>

              {/* Description */}
              <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-xl leading-relaxed mb-4 sm:mb-6 lg:mb-8 text-white/90 px-1 sm:px-0 max-w-2xl mx-auto lg:mx-0">
                {currentHeroSlide?.description}
              </p>

              {/* CTA Button */}
              <button
                type="button"
                onClick={() => router.push("/schedule-a-demo")}
                className={`inline-flex items-center bg-white text-${currentHeroSlide?.backgroundColor}-600 px-3 xs:px-4 sm:px-6 lg:px-8 py-2 xs:py-2.5 sm:py-3 lg:py-4 rounded-full font-semibold text-xs xs:text-sm sm:text-base lg:text-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-lg min-w-fit whitespace-nowrap`}
              >
                {currentHeroSlide?.buttonText}
              </button>
            </div>

            {/* Right Content - Rating and Visual Elements */}
            <div
              className={`lg:col-span-2 flex justify-center lg:justify-end transition-all duration-500 mt-6 lg:mt-0 ${
                isHeroAnimating
                  ? "opacity-0 translate-x-8"
                  : "opacity-100 translate-x-0"
              }`}
              >
              <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 xl:p-8 border border-white/20 w-full max-w-[240px] xs:max-w-[280px] sm:max-w-xs lg:max-w-none lg:w-auto mx-auto lg:mx-0">
                {/* Rating Stars */}
                <div className="flex items-center justify-center mb-2 sm:mb-3 lg:mb-4 gap-0.5 sm:gap-1">
                  {[...Array(currentHeroSlide?.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <div className="text-center text-white">
                  <div className="text-base xs:text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-1 leading-none">
                    4.9/5
                  </div>
                  <div className="text-[9px] xs:text-[10px] sm:text-xs opacity-90 leading-tight">
                    Customer Rating
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Navigation Dots */}
      <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-2 sm:space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToHeroSlide(index)}
              className={`w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                index === currentHeroIndex
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              disabled={isHeroAnimating}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
