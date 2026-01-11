"use client";

import { useVeltAuth } from "@/hooks/use-velt-auth";
import { VeltProvider, VeltCommentTool } from "@veltdev/react";

type VeltUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  organizationId?: string | null;
};

export const ClientVeltWrapper = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user: VeltUser;
}) => {
  const isVeltReady = useVeltAuth(user);

  return (
    <VeltProvider
      apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY!}
      style={{
        color: "#000",
        backgroundColor: "#fff",
      }}
    >
      {children}

      {/* {isVeltReady && (
        <div className="fixed bottom-24 flex items-center justify-center h-12 w-12 rounded-full bg-primary right-4 z-50">
          <VeltCommentTool />
        </div>
      )} */}
    </VeltProvider>
  );
};
