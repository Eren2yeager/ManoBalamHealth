import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "../api/auth.api";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch {
      toast.error("Unable to process the password reset request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-violet-50/40 px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-violet-100 bg-white p-8 shadow-xl">
        <BrandLogo className="mx-auto" />
        <h1 className="mt-8 text-center text-2xl font-black">Reset your password</h1>
        {sent ? (
          <div className="mt-6 rounded-2xl bg-emerald-50 p-5 text-center text-sm leading-6 text-emerald-800">
            If an active account exists for that email, a secure reset link has been sent.
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 grid gap-4">
            <p className="text-center text-sm leading-6 text-slate-500">Enter your verified email address. The link expires after 15 minutes.</p>
            <div className="relative"><Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email@example.com" className="h-12 pl-10" /></div>
            <Button disabled={loading} className="h-12 rounded-xl">{loading ? "Sending..." : "Send reset link"}</Button>
          </form>
        )}
        <Link to="/login" className="mt-6 block text-center text-sm font-bold text-primary hover:underline">Back to login</Link>
      </section>
    </main>
  );
}
