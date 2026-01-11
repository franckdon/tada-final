import { Img } from "@react-email/components";
import * as React from "react";

export function Logo({ baseUrl }: { baseUrl: string }) {
  return (
    <Img
      src={`${baseUrl}/logo.png`}
      alt="Logo"
      className="my-0 mx-auto text-center"
      width={70}
      height={70}
    />
  );
}
