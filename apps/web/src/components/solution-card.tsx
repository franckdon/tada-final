"use client";
import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/locales/client";

export default function SolutionCard({
  title,
  description,
  image,
  link,
  solutionFamily,
}: {
  title: string;
  description: string;
  image: string;
  link: string;
  solutionFamily?: string;
}) {
  const t = useI18n();

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="h-48 bg-gray-100 flex items-center justify-center">
        <Image
          src={image}
          alt={title}
          width={64}
          height={64}
          className={
            solutionFamily === "industry"
              ? "w-full h-full object-cover"
              : "w-20 h-20"
          }
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-rational-bold mb-3">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <Link
          href={link}
          className="text-premise-blue font-rational-medium flex items-center"
        >
          {t("solutions.learn_more")}
          <svg
            className="w-4 h-4 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
