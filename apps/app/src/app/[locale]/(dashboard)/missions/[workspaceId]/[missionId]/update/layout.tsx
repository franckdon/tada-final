import { MyRuntimeProvider } from "./my-runtime-provider";

export default function CreateMissionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MyRuntimeProvider>{children} </MyRuntimeProvider>;
}
