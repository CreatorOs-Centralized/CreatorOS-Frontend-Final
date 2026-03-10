import { useEffect } from "react";
import { Link, useNavigationType } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Zap,
  BarChart3,
  Video,
  Send,
  Users,
  ArrowRight,
  Star,
  CheckCircle,
} from "lucide-react";
import heroImg from "@/assets/hero-landing.jpg";
import featureAnalytics from "@/assets/feature-analytics.jpg";
import featurePublish from "@/assets/feature-publish.jpg";
import featureConnect from "@/assets/feature-connect.jpg";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  {
    icon: Video,
    title: "Upload & Manage",
    desc: "Upload videos, organize content, and manage your entire library in one place.",
    image: featurePublish,
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    desc: "Track views, engagement, and growth across YouTube & Instagram with real-time charts.",
    image: featureAnalytics,
  },
  {
    icon: Send,
    title: "Cross-Platform Publishing",
    desc: "Publish to YouTube and Instagram simultaneously. Schedule posts for optimal times.",
    image: featureConnect,
  },
];

const stats = [
  { value: "10K+", label: "Creators" },
  { value: "1M+", label: "Videos Published" },
  { value: "50M+", label: "Views Tracked" },
  { value: "99.9%", label: "Uptime" },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "YouTube Creator",
    text: "CreatorOS completely transformed how I manage my content pipeline. I've doubled my output!",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Instagram Influencer",
    text: "The cross-platform publishing saves me hours every week. Absolutely essential for creators.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Tech Educator",
    text: "The analytics dashboard gives me insights I never had before. My engagement is up 3x.",
    rating: 5,
  },
];

const Landing = () => {
  const navigationType = useNavigationType();
  const { isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    let hasSeenLanding = false;
    try {
      hasSeenLanding = sessionStorage.getItem("creatoros.landing.seen") === "1";
      sessionStorage.setItem("creatoros.landing.seen", "1");
    } catch {
      // ignore (storage might be unavailable)
    }

    // If the user navigated back/forward to landing (i.e., POP) and they've been here before
    // in this tab session, clear session. This prevents "silent" auth when they click Sign In/Get Started.
    if (navigationType !== "POP") return;
    if (!hasSeenLanding) return;
    if (!isAuthenticated) return;
    void logout();
  }, [isAuthenticated, isLoading, logout, navigationType]);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">CreatorOS</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#stats"
              className="hover:text-foreground transition-colors"
            >
              Stats
            </a>
            <a
              href="#testimonials"
              className="hover:text-foreground transition-colors"
            >
              Testimonials
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="gradient-primary border-0">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] animate-[pulse_4s_ease-in-out_infinite]" />
          <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-pink-500/10 rounded-full blur-[100px] animate-[pulse_5s_ease-in-out_infinite]" />
        </div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium animate-fade-in">
              <Zap className="w-3.5 h-3.5" /> The OS for Modern Creators
            </div>
            <h1
              className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] animate-fade-in"
              style={{ animationDelay: "100ms", animationFillMode: "both" }}
            >
              Create. Publish. <span className="gradient-text">Grow.</span>
            </h1>
            <p
              className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto animate-fade-in"
              style={{ animationDelay: "200ms", animationFillMode: "both" }}
            >
              The all-in-one platform for content creators to upload, schedule,
              publish across platforms, and track performance — all from one
              dashboard.
            </p>
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in"
              style={{ animationDelay: "300ms", animationFillMode: "both" }}
            >
              <Link to="/register">
                <Button
                  size="lg"
                  className="gradient-primary border-0 text-base px-8 h-12"
                >
                  Start Free <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8 h-12"
                >
                  See Features
                </Button>
              </a>
            </div>
          </div>

          <div
            className="relative max-w-5xl mx-auto animate-scale-in"
            style={{ animationDelay: "400ms", animationFillMode: "both" }}
          >
            <div className="absolute -inset-4 bg-gradient-to-b from-primary/20 to-transparent rounded-2xl blur-2xl" />
            <img
              src={heroImg}
              alt="CreatorOS Dashboard"
              className="relative rounded-xl border border-border shadow-2xl w-full"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section
        id="stats"
        className="py-20 px-4 sm:px-6 border-y border-border bg-card/30"
      >
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="text-center animate-fade-in"
              style={{
                animationDelay: `${i * 100}ms`,
                animationFillMode: "both",
              }}
            >
              <p className="text-3xl sm:text-4xl font-bold gradient-text">
                {s.value}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Everything you need to grow
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Powerful tools designed for creators who want to focus on what
              matters — creating great content.
            </p>
          </div>
          <div className="space-y-24">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`flex flex-col ${i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12`}
              >
                <div className="flex-1 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <f.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">{f.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {f.desc}
                  </p>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                  >
                    Get started <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="flex-1">
                  <div className="relative group">
                    <div className="absolute -inset-2 bg-primary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <img
                      src={f.image}
                      alt={f.title}
                      className="relative rounded-xl border border-border shadow-xl w-full hover:scale-[1.02] transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* More Features Grid */}
      <section className="py-20 px-4 sm:px-6 bg-card/30 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl font-bold">And so much more</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Video,
                title: "Video Upload",
                desc: "Drag & drop upload with format support",
              },
              {
                icon: Send,
                title: "Multi-Platform",
                desc: "Publish to YouTube & Instagram at once",
              },
              {
                icon: BarChart3,
                title: "Analytics",
                desc: "Charts, graphs, and engagement metrics",
              },
              {
                icon: Users,
                title: "Audience Insights",
                desc: "Understand your viewers and followers",
              },
              {
                icon: CheckCircle,
                title: "Workflow States",
                desc: "Draft, scheduled, published tracking",
              },
              {
                icon: Zap,
                title: "Notifications",
                desc: "Real-time alerts for publish status",
              },
            ].map((f, i) => (
              <div
                key={f.title}
                className="glass rounded-xl p-6 hover:glow-primary transition-shadow duration-300 group animate-fade-in"
                style={{
                  animationDelay: `${i * 80}ms`,
                  animationFillMode: "both",
                }}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Loved by creators
            </h2>
            <p className="text-muted-foreground">
              Join thousands of creators who trust CreatorOS
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className="glass rounded-xl p-6 space-y-4 hover:glow-primary transition-shadow duration-300 animate-fade-in"
                style={{
                  animationDelay: `${i * 100}ms`,
                  animationFillMode: "both",
                }}
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 fill-yellow-500 text-yellow-500"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "{t.text}"
                </p>
                <div>
                  <p className="font-medium text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center glass rounded-2xl p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-pink-500/5" />
          <div className="relative space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Ready to level up your content?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Join CreatorOS today and start managing your creator career like a
              pro.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/register">
                <Button
                  size="lg"
                  className="gradient-primary border-0 px-8 h-12"
                >
                  Create Free Account
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="px-8 h-12">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded gradient-primary flex items-center justify-center">
              <Zap className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">CreatorOS</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 CreatorOS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
