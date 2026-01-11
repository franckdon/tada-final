"use client";

import { useEffect, useState } from "react";

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

const currencies: Currency[] = [
  // African Currencies
  { code: "XOF", symbol: "FCFA", name: "Franc CFA" },
  { code: "XAF", symbol: "FCFA", name: "Franc CFA BEAC" },
  { code: "MAD", symbol: "د.م.", name: "Moroccan Dirham" },
  { code: "EGP", symbol: "£", name: "Egyptian Pound" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "GHS", symbol: "₵", name: "Ghanaian Cedi" },
  { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling" },
  { code: "UGX", symbol: "USh", name: "Ugandan Shilling" },

  // European Currencies
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
  { code: "DKK", symbol: "kr", name: "Danish Krone" },
  { code: "PLN", symbol: "zł", name: "Polish Złoty" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble" },
  { code: "HUF", symbol: "Ft", name: "Hungarian Forint" },

  // North American Currencies
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "MXN", symbol: "Mex$", name: "Mexican Peso" },

  // Asian Currencies
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "THB", symbol: "฿", name: "Thai Baht" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso" },

  // Middle Eastern Currencies
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  { code: "QAR", symbol: "﷼", name: "Qatari Riyal" },
  { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar" },
  { code: "BHD", symbol: ".د.ب", name: "Bahraini Dinar" },
  { code: "OMR", symbol: "﷼", name: "Omani Rial" },
  { code: "JOD", symbol: "د.ا", name: "Jordanian Dinar" },
  { code: "LBP", symbol: "ل.ل", name: "Lebanese Pound" },
  { code: "ILS", symbol: "₪", name: "Israeli New Shekel" },
  { code: "EGP", symbol: "£", name: "Egyptian Pound" },

  // South American Currencies
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "ARS", symbol: "$", name: "Argentine Peso" },
  { code: "CLP", symbol: "$", name: "Chilean Peso" },
  { code: "COP", symbol: "$", name: "Colombian Peso" },
  { code: "PEN", symbol: "S/.", name: "Peruvian Sol" },
  { code: "UYU", symbol: "$U", name: "Uruguayan Peso" },
  { code: "VES", symbol: "Bs", name: "Venezuelan Bolívar" },
  { code: "BOB", symbol: "Bs.", name: "Bolivian Boliviano" },
  { code: "PYG", symbol: "₲", name: "Paraguayan Guaraní" },
  { code: "CRC", symbol: "₡", name: "Costa Rican Colón" },

  // Oceanian Currencies
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "FJD", symbol: "FJ$", name: "Fijian Dollar" },
  { code: "PGK", symbol: "K", name: "Papua New Guinean Kina" },
  { code: "WST", symbol: "WS$", name: "Samoan Tala" },
];

const STORAGE_KEY = "selected-currency";

function getDefaultCurrency(): Currency {
  return currencies[0]!;
}

function getStoredCurrency(): Currency {
  if (typeof window === "undefined") return getDefaultCurrency();

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return getDefaultCurrency();

  try {
    const parsed = JSON.parse(stored);
    const found = currencies.find((c) => c.code === parsed.code);
    return found || getDefaultCurrency();
  } catch {
    return getDefaultCurrency();
  }
}

export function useCurrency() {
  const [selectedCurrency, setSelectedCurrency] =
    useState<Currency>(getStoredCurrency);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedCurrency));
  }, [selectedCurrency]);

  return {
    currencies,
    selectedCurrency,
    setSelectedCurrency,
  };
}
