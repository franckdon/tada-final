import type { Metadata } from "next";

interface MetadataProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
}

export function generateMetadata({
  title = "Tada - Data for Every Decision™",
  description = "Harness the power of data-driven intelligence and get actionable insights quickly and cost-effectively with Tada.",
  keywords = "data intelligence, market research, retail execution, insights, data collection",
  ogImage = "https://ext.same-assets.com/829373065/2893821008.svg",
}: MetadataProps): Metadata {
  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
