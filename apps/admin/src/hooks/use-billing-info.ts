"use client";

import { getOneBillingInfo } from "@/actions/biling/get-one-billing-action";
import { useAction } from "next-safe-action/hooks";

export const useBillingInfo = () => {
  return useAction(getOneBillingInfo);
};
