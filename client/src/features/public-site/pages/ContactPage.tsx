import { useState, type FormEvent } from "react";
import { Clock3, Mail, MapPin, MessageSquareText, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PublicFooter } from "../components/PublicFooter";
import { PublicPageHero } from "../components/PublicPageHero";
import { submitContactRequest, type ContactRequest } from "../api/contact.api";

const initialForm: ContactRequest = { name: "", email: "", phone: "", subject: "", message: "", consent: false };

export function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await submitContactRequest(form);
      toast.success("Your message has been received.");
      setForm(initialForm);
    } catch {
      toast.error("We could not send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field: keyof ContactRequest, value: string | boolean) => setForm((current) => ({ ...current, [field]: value }));

  return (
    <div className="min-h-screen bg-[#fcfbff]">
      <PublicPageHero eyebrow="Contact ManoBalamHealthCare" title="Let us help you find the right next step" summary="Contact us for platform questions, professional onboarding, partnerships, or general support. Do not use this form for emergencies." icon={MessageSquareText} section="Contact" highlights={["General support", "Professional enquiries", "Partnerships"]} />
      <main className="px-4 py-14 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[.72fr_1.28fr]">
          <aside className="rounded-[2rem] bg-[#111631] p-7 text-white shadow-2xl md:p-9">
            <p className="text-xs font-black uppercase tracking-[.18em] text-violet-300">Contact details</p>
            <h2 className="mt-3 text-2xl font-black">We are listening</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">Share enough detail for our team to understand your request, but avoid including highly sensitive medical information.</p>
            <div className="mt-8 grid gap-5 text-sm">
              <p className="flex gap-3"><Mail className="mt-0.5 size-5 text-violet-300" /><span><strong className="block text-white">Email</strong>support@manobalam.org</span></p>
              <p className="flex gap-3"><MapPin className="mt-0.5 size-5 text-violet-300" /><span><strong className="block text-white">Availability</strong>Online services across India</span></p>
              <p className="flex gap-3"><Clock3 className="mt-0.5 size-5 text-violet-300" /><span><strong className="block text-white">Response time</strong>Usually within two working days</span></p>
              <p className="flex gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4"><Phone className="mt-0.5 size-5 text-rose-300" /><span><strong className="block text-white">Immediate danger</strong>Call emergency services. In India, dial 112.</span></p>
            </div>
          </aside>
          <form onSubmit={submit} className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50 md:p-9">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-slate-700">Full name<input required value={form.name} onChange={(e) => update("name", e.target.value)} className="h-12 rounded-xl border border-slate-200 px-4 font-normal outline-none transition focus:border-primary focus:ring-4 focus:ring-violet-100" /></label>
              <label className="grid gap-2 text-sm font-bold text-slate-700">Email address<input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="h-12 rounded-xl border border-slate-200 px-4 font-normal outline-none transition focus:border-primary focus:ring-4 focus:ring-violet-100" /></label>
              <label className="grid gap-2 text-sm font-bold text-slate-700">Phone (Optional)<input value={form.phone} onChange={(e) => update("phone", e.target.value)} className="h-12 rounded-xl border border-slate-200 px-4 font-normal outline-none transition focus:border-primary focus:ring-4 focus:ring-violet-100" /></label>
              <label className="grid gap-2 text-sm font-bold text-slate-700">Subject<input required value={form.subject} onChange={(e) => update("subject", e.target.value)} className="h-12 rounded-xl border border-slate-200 px-4 font-normal outline-none transition focus:border-primary focus:ring-4 focus:ring-violet-100" /></label>
            </div>
            <label className="mt-5 grid gap-2 text-sm font-bold text-slate-700">Message<textarea required rows={6} value={form.message} onChange={(e) => update("message", e.target.value)} className="resize-none rounded-xl border border-slate-200 p-4 font-normal outline-none transition focus:border-primary focus:ring-4 focus:ring-violet-100" /></label>
            <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-slate-600"><input required type="checkbox" checked={form.consent} onChange={(e) => update("consent", e.target.checked)} className="mt-1 size-4 accent-violet-600" /><span>I consent to ManoBalamHealthCare storing this enquiry to respond to my request.</span></label>
            <Button type="submit" disabled={submitting} className="mt-6 h-12 rounded-xl bg-gradient-to-r from-primary to-violet-600 px-7 font-bold shadow-lg shadow-primary/20">
              {submitting ? "Sending..." : "Send message"} <Send className="ml-1 size-4" />
            </Button>
          </form>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
