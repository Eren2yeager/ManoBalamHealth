import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BrainCircuit, Users, MessageSquare, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="px-4 py-20 md:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <BrainCircuit className="h-12 w-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">ManoBalam</h1>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Your mental wellness, our priority. Connect with licensed psychologists for secure, confidential consultations anytime, anywhere.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="rounded-full text-base" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
            <Button variant="secondary" size="lg" className="rounded-full text-base" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 md:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose ManoBalam?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, title: "Licensed Experts", description: "Connect with verified, experienced psychologists" },
              { icon: MessageSquare, title: "Multiple Modes", description: "Chat, audio, or video consultations - your choice" },
              { icon: ShieldCheck, title: "Secure & Private", description: "End-to-end encrypted, confidential sessions" },
              { icon: BrainCircuit, title: "Wellness Tools", description: "Self-assessments and resources for your journey" },
            ].map((feature, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 text-center text-muted-foreground border-t">
        <p>© 2025 ManoBalam. All rights reserved.</p>
      </footer>
    </div>
  );
}
