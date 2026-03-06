"use client";

import { useMemo, useState } from "react";
import { useCurrentLocale } from "@/locales/client";
import { useCurrency } from "@/hooks/use-currency";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@tada/ui/components/select";
import { Label } from "@tada/ui/components/label";
import { Switch } from "@tada/ui/components/switch";
import { Badge } from "@tada/ui/components/badge";
import { Bell, Coins, Languages, Settings2 } from "lucide-react";

const languages = [
  { code: "fr", name: "Français", emoji: "🇫🇷" },
  { code: "en", name: "English", emoji: "🇬🇧" },
] as const;

type NotificationState = {
  productUpdates: boolean;
  missionActivity: boolean;
  reportsAndInsights: boolean;
  billingAndInvoices: boolean;
  securityAlerts: boolean;
  marketingEmails: boolean;
};

export function PreferencesSection() {
  const locale = useCurrentLocale();
  const { currencies, selectedCurrency, setSelectedCurrency, hydrated } =
    useCurrency();

  const [notifications, setNotifications] = useState<NotificationState>({
    productUpdates: true,
    missionActivity: true,
    reportsAndInsights: true,
    billingAndInvoices: true,
    securityAlerts: true,
    marketingEmails: false,
  });

  const previewAmount = useMemo(() => {
    const amount = 12500;

    try {
      return new Intl.NumberFormat(locale === "en" ? "en-US" : "fr-FR", {
        style: "currency",
        currency: selectedCurrency.code,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `${selectedCurrency.symbol} ${amount}`;
    }
  }, [locale, selectedCurrency]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
          <Settings2 className="h-5 w-5 text-blue-600" />
          Preferences
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Customize your display preferences and notification settings.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Display preferences
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage the language and currency used across the interface.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-gray-500" />
              Language
            </Label>

            <Select value={locale} disabled>
              <SelectTrigger>
                <SelectValue placeholder="Choose a language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span>{lang.emoji}</span>
                      <span>{lang.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <p className="text-xs text-gray-500">
              Language is currently managed by the app locale switcher.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-gray-500" />
              Currency
            </Label>

            <Select
              value={selectedCurrency.code}
              onValueChange={(value: string) => {
                const currency = currencies.find((c) => c.code === value);
                if (currency) setSelectedCurrency(currency);
              }}
              disabled={!hydrated}
            >
              <SelectTrigger>
                <SelectValue>
                  {selectedCurrency.symbol} - {selectedCurrency.name}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <p className="text-xs text-gray-500">
              This currency is used to display prices, estimates and reports in
              the interface.
            </p>

            <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              Preview:{" "}
              <span className="font-semibold text-gray-900">
                {previewAmount}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-gray-500" />
            <h2 className="text-base font-semibold text-gray-900">
              Notifications
            </h2>
            <Badge variant="outline">Coming soon</Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Choose which types of notifications you want to receive. These
            preferences are not functional yet.
          </p>
        </div>

        <div className="space-y-4 p-6">
          <NotificationRow
            title="Product updates"
            description="Announcements about new features and platform improvements."
            checked={notifications.productUpdates}
            onCheckedChange={(value) =>
              setNotifications((prev) => ({
                ...prev,
                productUpdates: value,
              }))
            }
          />

          <NotificationRow
            title="Mission activity"
            description="Updates about mission creation, assignment and progress."
            checked={notifications.missionActivity}
            onCheckedChange={(value) =>
              setNotifications((prev) => ({
                ...prev,
                missionActivity: value,
              }))
            }
          />

          <NotificationRow
            title="Reports & insights"
            description="Get notified when reports, dashboards or analysis are available."
            checked={notifications.reportsAndInsights}
            onCheckedChange={(value) =>
              setNotifications((prev) => ({
                ...prev,
                reportsAndInsights: value,
              }))
            }
          />

          <NotificationRow
            title="Billing & invoices"
            description="Notifications related to subscription, payments and invoices."
            checked={notifications.billingAndInvoices}
            onCheckedChange={(value) =>
              setNotifications((prev) => ({
                ...prev,
                billingAndInvoices: value,
              }))
            }
          />

          <NotificationRow
            title="Security alerts"
            description="Important account access and security-related notifications."
            checked={notifications.securityAlerts}
            onCheckedChange={(value) =>
              setNotifications((prev) => ({
                ...prev,
                securityAlerts: value,
              }))
            }
          />

          <NotificationRow
            title="Marketing emails"
            description="Optional newsletters, tips and promotional communications."
            checked={notifications.marketingEmails}
            onCheckedChange={(value) =>
              setNotifications((prev) => ({
                ...prev,
                marketingEmails: value,
              }))
            }
          />
        </div>
      </div>
    </div>
  );
}

function NotificationRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 p-4">
      <div className="min-w-0">
        <div className="text-sm font-medium text-gray-900">{title}</div>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>

      <div className="pt-1">
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
      </div>
    </div>
  );
}
