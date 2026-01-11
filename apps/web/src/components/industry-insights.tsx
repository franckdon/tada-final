"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const industries = [
  {
    title: "Consumer Packaged Goods",
    description: "Get real-time insights on product placement, pricing, and competitor activity across your retail network.",
    icon: "/images/cpg-icon.svg"
  },
  {
    title: "International Development",
    description: "Monitor program implementations and measure impact with reliable data from local communities.",
    icon: "/images/international-dev-icon.svg"
  },
  {
    title: "Retail",
    description: "Track inventory, merchandising compliance, and consumer behavior to optimize your retail strategy.",
    icon: "/images/retail-icon.svg"
  },
  {
    title: "Public Sector",
    description: "Gather accurate, timely intelligence to inform policy decisions and monitor societal trends.",
    icon: "/images/public-sector-icon.svg"
  }
];

export function IndustryInsights() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Insights for Any Industry
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our platform delivers tailored data solutions across sectors, providing actionable intelligence precisely when and where you need it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((industry, index) => (
            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-primary"
                    >
                      {index === 0 && (
                        <>
                          <path d="M20.91 8.84 8.56 2.23a1.93 1.93 0 0 0-1.81 0L3.1 4.13a2.12 2.12 0 0 0-.05 3.69l12.22 6.93a2 2 0 0 0 1.94 0L21 12.51a2.12 2.12 0 0 0-.09-3.67Z" />
                          <path d="m3.09 8.84 12.35-6.61a1.93 1.93 0 0 1 1.81 0l3.65 1.9a2.12 2.12 0 0 1 .1 3.69L8.73 14.75a2 2 0 0 1-1.94 0L3 12.51a2.12 2.12 0 0 1 .09-3.67Z" />
                          <line x1="12" y1="22" x2="12" y2="13" />
                          <path d="M20 13.5v3.37a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13.5" />
                        </>
                      )}
                      {index === 1 && (
                        <>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </>
                      )}
                      {index === 2 && (
                        <>
                          <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                          <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
                          <path d="M12 3v6" />
                        </>
                      )}
                      {index === 3 && (
                        <>
                          <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
                          <path d="m9 16 .348-.24c1.465-1.013 3.84-1.013 5.304 0L15 16" />
                          <path d="M8 7h.01" />
                          <path d="M16 7h.01" />
                          <path d="M12 7h.01" />
                          <path d="M12 11h.01" />
                          <path d="M16 11h.01" />
                          <path d="M8 11h.01" />
                        </>
                      )}
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {industry.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {industry.description}
                </p>
                <Link
                  href={`/solutions/${industry.title.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-primary font-medium hover:underline inline-flex items-center"
                >
                  Learn More
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-1 h-4 w-4"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
