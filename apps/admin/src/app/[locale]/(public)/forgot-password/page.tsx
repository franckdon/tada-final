import ForgotPasswordCard from "@/components/auth/forgot-password-card";

export const metadata = {
  title: "Mot de passe oublié | Tada",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex">
      <ForgotPasswordCard />
    </div>
  );
}
