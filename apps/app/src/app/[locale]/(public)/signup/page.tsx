import SignUp from "@/components/auth/signup-card";

export const metadata = {
  title: "Créer un compte | Tada",
};

export default function Page() {
  return (
    <div className="min-h-screen flex">
      <SignUp />
    </div>
  );
}
