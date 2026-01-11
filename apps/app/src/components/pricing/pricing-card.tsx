import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@tada/ui/components/card";
import { Button } from "@tada/ui/components/button";
import { Check, X } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/locales/client";

interface Feature {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  name: string;
  price: number;
  currency: string;
  duration: string;
  description: string;
  features: Feature[];
  isPopular?: boolean;
  onChoosePlan: () => void;
  isActivePlan: boolean;
  loading?: boolean;
}

export function PricingCard({
  name,
  price,
  currency,
  duration,
  description,
  features,
  isPopular,
  onChoosePlan,
  loading = false,
  isActivePlan,
}: PricingCardProps) {
  const t = useI18n();

  return (
    <Card
      className={`flex flex-col shadow-none justify-between border ${
        isActivePlan ? "border-2 border-orange-500" : "border-gray-200"
      } p-6`}
    >
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-black">{name}</CardTitle>
        <CardDescription className="text-gray-600">
          {description}
        </CardDescription>
        <div className="mt-4">
          <span className="text-3xl font-extrabold text-black">
            {price <= 0 ? "Custom" : `${price} ${currency}`}
          </span>
          <span className="text-lg text-gray-600">
            {price <= 0 ? "" : "/Mois"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {features?.map((feature, index) => (
            <li key={index} className="flex items-center text-gray-800">
              {feature.included ? (
                <Check className="mr-2 h-5 w-5 text-orange-500" />
              ) : (
                <X className="mr-2 h-5 w-5 text-gray-400" />
              )}
              {feature.text}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-6">
        <Button
          onClick={onChoosePlan}
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> {t("common.loading")}
            </span>
          ) : (
            "Choose Plan"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
