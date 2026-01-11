"use client";

import { useState, useEffect } from "react";
import {
  checkSubscriptionAccess,
  checkUsageLimits,
} from "../../middleware/subscription";

export function useSubscriptionGuard(organizationId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessInfo, setAccessInfo] = useState<any>(null);
  const [usageLimits, setUsageLimits] = useState<any>(null);

  useEffect(() => {
    checkAccess();
  }, [organizationId]);

  const checkAccess = async () => {
    try {
      setIsLoading(true);

      const [accessResult, limitsResult] = await Promise.all([
        checkSubscriptionAccess(organizationId, "studies_access"),
        checkUsageLimits(organizationId),
      ]);

      setHasAccess(accessResult.hasAccess);
      setAccessInfo(accessResult);
      setUsageLimits(limitsResult);
    } catch (error) {
      console.error("Error checking subscription access:", error);
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    hasAccess,
    accessInfo,
    usageLimits,
    refetch: checkAccess,
  };
}
