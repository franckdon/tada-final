"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@tada/ui/components/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/locales/client";
import React from "react";

export default function ScrollingTextHero() {
  const [index, setIndex] = useState(0);
  const t = useI18n();

  const texts = [
    t("home.hero.scrollTexts.one"),
    t("home.hero.scrollTexts.two"),
    t("home.hero.scrollTexts.three"),
    t("home.hero.scrollTexts.four"),
    t("home.hero.scrollTexts.five"),
    t("home.hero.scrollTexts.six"),
    t("home.hero.scrollTexts.seven"),
    t("home.hero.scrollTexts.eight"),
    t("home.hero.scrollTexts.nine"),
    t("home.hero.scrollTexts.ten"),
    t("home.hero.scrollTexts.eleven"),
    t("home.hero.scrollTexts.twelve"),
    t("home.hero.scrollTexts.thirteen"),
    t("home.hero.scrollTexts.fourteen"),
    t("home.hero.scrollTexts.fiveteen"),
    t("home.hero.scrollTexts.sixteen"),
    t("home.hero.scrollTexts.seventeen"),
    t("home.hero.scrollTexts.eighteen"),
    t("home.hero.scrollTexts.nineteen"),
    t("home.hero.scrollTexts.twenty"),
  ];
  
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="container-custom space-y-12">
      <div className="container-custom text-center">
        <h3 className="mt-2 text-2xl md:text-5xl font-bold mb-4">
          {t("home.hero.title")
            .split("\n")
            .map((line, index) => (
              <React.Fragment key={index}>
                {/* Ajouter un saut de ligne seulement après la 1ère ligne */}
                {line}
                {index === 0 && <br className="hidden md:block" />}
              </React.Fragment>
          ))}
        </h3>
        <p className="text-lg/8 text-gray-600">
          {t("home.hero.description")}
        </p>
      </div>

      <div className="relative flex items-center justify-center h-[70vh] bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}>
        {/* Overlay sombre */}
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-8 px-6">
          <div className="relative flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-start text-white text-center md:text-left">
            <p className="text-2xl md:text-3xl font-light flex-shrink-0">{t("home.hero.prefix")}</p>

            {/* Zone de texte animée */}
            <div className="sm:relative h-[50px] sm:h-[500px] overflow-hidden w-full min-w-[270px] md:min-w-[600px] flex items-center justify-center sm:justify-start sm:ps-8">
              {texts.map((text, i) => {
                // Distance circulaire entre i et l'index actif
                const distance = ((i - index + texts.length) % texts.length);
                
                // Convertir pour obtenir une plage centrée autour de 0
                const offset = distance > texts.length / 2 ? distance - texts.length : distance;

                // On n'affiche que les 5 précédents et 5 suivants
                if (Math.abs(offset) > 5) return null;

                // Position verticale (chaque élément décale de 40px)
                const y = offset * 40;

                // Opacité NON progressive
                const opacity = offset === 0 ? 1 : 0.3;

                // Scale optionnel (tu peux remettre 1 partout si tu veux)
                const scale = offset === 0 ? 1.1 : 0.9;

                return (
                  <motion.p
                    key={text}
                    animate={{ y, opacity, scale }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute md:text-2xl font-semibold leading-tight !whitespace-normal !sm:whitespace-nowrap px-4 sm:px-0"
                    style={{
                      filter: opacity < 1 ? "blur(1.2px)" : "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {text}
                  </motion.p>
                );
              })}
            </div>
          </div>

          {/* Bouton d’action */}
          <div className="relative mt-8 md:mt-0">
            <Button
              asChild
              className="flex items-center justify-center group"
            >
              <Link href="/book-a-demo">
                {t("home.hero.bookDemo")}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}