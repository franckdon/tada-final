"use client";

import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { useI18n } from "@/locales/client";

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  title: string;
  company: string;
  logo: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "home.testimonials.items.0.quote",
    author: "Sarah Diop",
    title: "home.testimonials.items.0.title",
    company: "Coca-Cola",
    logo: "/images/cocacola.png",
  },
  {
    id: 2,
    quote: "home.testimonials.items.1.quote",
    author: "Paul Mensah",
    title: "home.testimonials.items.1.title",
    company: "PepsiCo",
    logo: "/images/pepsico.png",
  },
  {
    id: 3,
    quote: "home.testimonials.items.2.quote",
    author: "Fatou Bamba",
    title: "home.testimonials.items.2.title",
    company: "Glovo",
    logo: "/images/glovo.png",
  },
  {
    id: 4,
    quote: "home.testimonials.items.3.quote",
    author: "Jean-Benoît Koffi",
    title: "home.testimonials.items.3.title",
    company: "Glovo",
    logo: "/images/glovo.png",
  },
  {
    id: 5,
    quote: "home.testimonials.items.4.quote",
    author: "Nadine El Moctar",
    title: "home.testimonials.items.4.title",
    company: "Glovo",
    logo: "/images/glovo.png",
  },
  {
    id: 6,
    quote: "home.testimonials.items.5.quote",
    author: "Alex Owusu",
    title: "home.testimonials.items.5.title",
    company: "Glovo",
    logo: "/images/glovo.png",
  },
  {
    id: 7,
    quote: "home.testimonials.items.6.quote",
    author: "Hassan Traoré",
    title: "home.testimonials.items.6.title",
    company: "Glovo",
    logo: "/images/glovo.png",
  },
  {
    id: 8,
    quote: "home.testimonials.items.7.quote",
    author: "Dr. Laila Bensouda",
    title: "home.testimonials.items.7.title",
    company: "Glovo",
    logo: "/images/glovo.png",
  },
  {
    id: 9,
    quote: "home.testimonials.items.8.quote",
    author: "Issaka Coulibaly",
    title: "home.testimonials.items.8.title",
    company: "Glovo",
    logo: "/images/glovo.png",
  },
  {
    id: 10,
    quote: "home.testimonials.items.9.quote",
    author: "Cynthia Ewusi",
    title: "home.testimonials.items.9.title",
    company: "Glovo",
    logo: "/images/glovo.png",
  },
];

// Default testimonial
export function DefaultTestimonial() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const nextTestimonial = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      setIsAnimating(false);
    }, 150);
  };

  const prevTestimonial = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(
        (prev) => (prev - 1 + testimonials.length) % testimonials.length
      );
      setIsAnimating(false);
    }, 150);
  };

  const goToTestimonial = (index: number) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsAnimating(false);
    }, 150);
  };

  const currentTestimonial = testimonials[currentIndex];
  const t = useI18n();
  return (
    <div className="relative">
        {/* Navigation Arrows */}
        <button
          onClick={prevTestimonial}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 hover:shadow-xl transition-all duration-300 hover:scale-110 z-10"
          disabled={isAnimating}
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={nextTestimonial}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 hover:shadow-xl transition-all duration-300 hover:scale-110 z-10"
          disabled={isAnimating}
        >
          <ChevronRight size={20} />
        </button>

      <div className="bg-white rounded-3xl shadow-2xl sm:mx-20 p-8 md:py-12 md:px-16 relative overflow-hidden">
        {/* Background Pattern */}
        {/* <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div> */}
        {/* <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-100 to-yellow-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div> */}

        {/* Quote Icon */}
        <div className="absolute top-6 left-6 text-blue-200">
          <Quote size={32} />
        </div>

        {/* Content */}
        <div
          className={`transition-all duration-300 ${
            isAnimating
              ? "opacity-0 transform translate-y-4"
              : "opacity-100 transform translate-y-0"
          }`}
        >
          {/* Quote */}
          <blockquote className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8 relative z-10 font-medium">
            {t(currentTestimonial?.quote as any, {})}
          </blockquote>

          {/* Author Info */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <div className="font-bold text-gray-900 text-lg mb-1">
                {currentTestimonial?.author}
              </div>
              <div className="text-gray-600 text-sm">
                {t(currentTestimonial?.title as any, {})}
              </div>
            </div>

            {/* Company Logo */}
            {/* <div className="flex items-center">
              <Image
                src={currentTestimonial?.logo || ""}
                alt={currentTestimonial?.company || ""}
                width={120}
                height={60}
                className="h-12 w-auto"
              />
            </div> */}
          </div>
        </div>
      </div>
      {/* Pagination Dots */}
      <div className="flex justify-center mt-8 space-x-3">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => goToTestimonial(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-primary scale-125"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
            disabled={isAnimating}
          />
        ))}
      </div>
    </div>
  );
}
