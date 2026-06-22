import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPassword } from "../api/auth.api";

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      toast.success("Password reset successfully. Please log in.");
      navigate("/login");
    } catch {
      toast.error("This reset link is invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <main className="grid min-h-screen place-items-center px-4"><div className="text-center"><p className="font-bold">Invalid password reset link.</p><Link to="/forgot-password" className="mt-3 inline-block text-primary underline">Request a new link</Link></div></main>;
  }

  return (
    <main className="grid min-h-screen place-items-center bg-violet-50/40 px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-violet-100 bg-white p-8 shadow-xl">
        <BrandLogo className="mx-auto" />
        <h1 className="mt-8 text-center text-2xl font-black">Create a new password</h1>
        <p className="mt-2 text-center text-sm text-slate-500">Use at least eight characters, one uppercase letter, and one number.</p>
        <form onSubmit={submit} className="mt-6 grid gap-4">
          <Input type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password" className="h-12" />
          <Input type="password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm new password" className="h-12" />
          <Button disabled={loading} className="h-12 rounded-xl">{loading ? "Updating..." : "Update password"}</Button>
        </form>
      </section>
    </main>
  );
}
