import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  UtensilsCrossed,
  Star,
  Clock,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Flame,
  Menu,
  X,
  Leaf,
  Drumstick,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { MenuItem } from "@/types/menu";
import heroBg from "@/assets/hero-bg.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const heroImgY = useTransform(scrollY, [0, 800], [0, 200]);
  const heroImgScale = useTransform(scrollY, [0, 800], [1, 1.15]);
  const heroWordsY = useTransform(scrollY, [0, 800], [0, -80]);

  const { data: featuredItems } = useQuery({
    queryKey: ["featured-menu"],
    queryFn: async () => {
      const { data } = await supabase.from("menu").select("*").limit(6);
      return (data as MenuItem[]) || [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("name").order("name");
      return (data?.map((c: any) => c.name) as string[]) || [];
    },
  });

  const categoryIcons: Record<string, string> = {
    Burgers: "🍔", Pizza: "🍕", Drinks: "🥤", Desserts: "🍰",
    Momos: "🥟", Chinese: "🍜", Rolls: "🌯", Shakes: "🥤",
    Noodles: "🍝", Rice: "🍚", Combo: "🍱", Snacks: "🍟",
    Sandwich: "🥪", Wraps: "🌮", Pasta: "🍝",
  };

  const heroWords = ["SMASHED", "FRESH", "BOLD FLAVOR", "HOT", "JUICY"];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden text-foreground">
      {/* ───────────── NAV ───────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground border-b border-primary-foreground/10">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2 group">
            <Flame className="h-6 w-6 group-hover:rotate-12 transition-transform" />
            <span className="font-stamp text-base sm:text-lg tracking-wider">FRIED&amp;CRISPY</span>
          </Link>

          <div className="hidden md:flex items-center gap-1 font-stamp text-xs tracking-widest">
            <Link to="/menu" className="px-3 py-2 hover:opacity-70 transition-opacity">MENU</Link>
            <Link to="/track" className="px-3 py-2 hover:opacity-70 transition-opacity">TRACK</Link>
            <Link to="/admin" className="px-3 py-2 hover:opacity-70 transition-opacity">ADMIN</Link>
            <ThemeToggle />
            <Link to="/menu">
              <Button variant="secondary" className="ml-2 rounded-none font-stamp text-xs tracking-widest h-9 px-5 bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                ORDER NOW
              </Button>
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-1">
            <ThemeToggle />
            <button
              aria-label="Toggle menu"
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-primary border-t border-primary-foreground/10 px-4 py-3 space-y-1 font-stamp text-sm tracking-widest"
          >
            {[
              { to: "/menu", label: "MENU" },
              { to: "/track", label: "TRACK ORDER" },
              { to: "/admin", label: "ADMIN" },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 hover:opacity-70"
              >
                {l.label}
              </Link>
            ))}
            <Link to="/menu" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full rounded-none font-stamp text-xs tracking-widest bg-primary-foreground text-primary hover:bg-primary-foreground/90 mt-2">
                ORDER NOW
              </Button>
            </Link>
          </motion.div>
        )}
      </nav>

      {/* ───────────── HERO ───────────── */}
      <section className="relative bg-primary text-primary-foreground pt-14 overflow-hidden">
        {/* Background ticker words */}
        <motion.div
          style={{ y: heroWordsY }}
          className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-2 opacity-15 select-none"
        >
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex whitespace-nowrap animate-ticker font-mega text-[18vw] sm:text-[14vw]">
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} className="px-8">
                  {heroWords[(row + i) % heroWords.length]} •
                </span>
              ))}
            </div>
          ))}
        </motion.div>

        <div className="relative container mx-auto px-4 pt-10 pb-0 min-h-[92svh] flex flex-col">
          {/* Top labels */}
          <div className="flex justify-between items-start font-stamp text-[10px] sm:text-xs tracking-widest opacity-80">
            <div>
              <p>EST. GORAKHPUR</p>
              <p className="mt-1">SINCE — '24</p>
            </div>
            <div className="text-right">
              <p>FRIED &amp; CRISPY</p>
              <p className="mt-1">N° 001 / SERIES</p>
            </div>
          </div>

          {/* Big stacked headline */}
          <div className="relative flex-1 flex flex-col justify-center py-10">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="font-mega text-[22vw] sm:text-[18vw] md:text-[15vw] leading-[0.82] text-center"
            >
              <span className="block">THE</span>
              <span className="block text-outline">CHICKEN</span>
            </motion.h1>

            {/* Hero image floating in the middle */}
            <motion.img
              style={{ y: heroImgY, scale: heroImgScale }}
              src={heroBg}
              alt="Hot crispy fried chicken"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[58%] sm:w-[44%] md:w-[36%] max-w-[520px] aspect-square object-cover rounded-full shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)] ring-8 ring-primary-foreground/10"
            />
          </div>

          {/* Bottom CTA row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10 items-end">
            <p className="font-body text-sm md:text-base leading-relaxed opacity-90 max-w-xs">
              Smashed hot, fried golden — our crispy birds lock in juiciness under a shattering crust. Built bold since day one.
            </p>
            <div className="flex md:justify-center">
              <Link to="/menu">
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-full px-8 h-14 font-stamp tracking-widest text-sm bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-2xl"
                >
                  ORDER NOW <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="md:text-right font-stamp text-[10px] sm:text-xs tracking-widest opacity-80 space-y-1">
              <p>FRESH • HOT • 30 MIN</p>
              <p>FREE DELIVERY ABOVE ₹299</p>
              <p>WHATSAPP — INSTANT CONFIRM</p>
            </div>
          </div>
        </div>

        {/* Ticker strip at bottom of hero */}
        <div className="bg-foreground text-background border-y border-foreground/20 overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee py-3 font-stamp text-xs sm:text-sm tracking-widest">
            {Array.from({ length: 2 }).map((_, d) => (
              <div key={d} className="flex shrink-0 items-center gap-8 px-8">
                <span>★ FRESH BATCH HOURLY</span><span>—</span>
                <span>★ HAND-BREADED</span><span>—</span>
                <span>★ 1000+ HAPPY EATERS</span><span>—</span>
                <span>★ CODE: CRISPY10 — 10% OFF</span><span>—</span>
                <span>★ DELIVERED IN 30 MIN</span><span>—</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── ABOUT / JUICY CHEESY ───────────── */}
      <section className="bg-background py-20 md:py-32 relative overflow-hidden">
        <div className="container mx-auto px-4 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7 space-y-6">
            <p className="font-stamp text-xs tracking-[0.3em] text-primary">— TOP CLASSIC</p>
            <h2 className="font-mega text-[14vw] md:text-[7vw] leading-[0.85] text-foreground">
              juicy <span className="text-primary">crispy</span><br />
              fully <span className="text-outline-dark">loaded</span>
            </h2>
            <p className="font-body text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed">
              Fried&amp;Crispy is back and bolder than ever. Honouring our rich roots, we bring you the
              ultimate crispy experience — fully loaded, hot, and crafted fresh, every single time.
            </p>
            <Link to="/menu">
              <Button size="lg" className="rounded-full font-stamp tracking-widest text-xs h-12 px-7">
                EXPLORE MENU <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="md:col-span-5 grid grid-cols-2 gap-4">
            {[
              { icon: Drumstick, label: "Hand Breaded", bg: "bg-primary text-primary-foreground" },
              { icon: Leaf, label: "Fresh Daily", bg: "bg-foreground text-background" },
              { icon: Flame, label: "Fire Fried", bg: "bg-accent text-accent-foreground" },
              { icon: Sparkles, label: "Crispy Crust", bg: "bg-background text-foreground border-2 border-foreground" },
            ].map((b, i) => (
              <motion.div
                key={b.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className={`${b.bg} aspect-square rounded-3xl p-5 flex flex-col justify-between`}
              >
                <b.icon className="h-7 w-7" />
                <p className="font-stamp text-base sm:text-lg tracking-wider leading-tight">{b.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── FOOD THAT FEELS GOOD ───────────── */}
      <section className="bg-foreground text-background py-20 md:py-28 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <p className="font-stamp text-xs tracking-[0.3em] text-primary mb-4">— EXPERIENCE</p>
          <h2 className="font-mega text-[12vw] md:text-[7vw] leading-[0.85] mb-12">
            food that <span className="text-primary">feels</span> good
          </h2>

          <div className="grid grid-cols-3 gap-4 md:gap-10 max-w-4xl mx-auto">
            {[
              { value: "30", unit: "MIN", label: "Hot Delivery" },
              { value: "100%", unit: "FRESH", label: "Daily Prep" },
              { value: "2K+", unit: "FANS", label: "In Gorakhpur" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="border-t-2 border-background/30 pt-4 text-left"
              >
                <p className="font-mega text-5xl md:text-7xl leading-none">{s.value}</p>
                <p className="font-stamp text-[10px] tracking-[0.2em] opacity-70 mt-2">{s.unit}</p>
                <p className="font-body text-sm mt-1 opacity-80">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── CATEGORIES ───────────── */}
      {categories.length > 0 && (
        <section className="bg-background py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
              <div>
                <p className="font-stamp text-xs tracking-[0.3em] text-primary mb-3">— EXPLORE</p>
                <h2 className="font-mega text-5xl md:text-7xl text-foreground">categories</h2>
              </div>
              <Link to="/menu" className="font-stamp text-xs tracking-widest text-foreground hover:text-primary inline-flex items-center gap-2">
                ALL CATEGORIES <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {categories.slice(0, 8).map((cat, i) => (
                <motion.div
                  key={cat}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                >
                  <Link
                    to={`/menu?category=${cat}`}
                    className="group relative block aspect-[4/5] bg-foreground text-background overflow-hidden rounded-2xl"
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-7xl md:text-8xl opacity-90 group-hover:scale-110 transition-transform duration-500">
                      {categoryIcons[cat] || "🍽️"}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="font-stamp text-sm md:text-base tracking-wider">{cat}</p>
                    </div>
                    <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-90 transition-opacity flex items-center justify-center">
                      <span className="font-stamp text-primary-foreground text-sm tracking-widest inline-flex items-center gap-2">
                        ORDER <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────────── FEATURED ───────────── */}
      {featuredItems && featuredItems.length > 0 && (
        <section className="bg-secondary py-20 md:py-28 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <p className="font-stamp text-xs tracking-[0.3em] text-primary mb-3">— SIGNATURE</p>
              <h2 className="font-mega text-5xl md:text-8xl text-foreground">
                every layer<br /><span className="text-primary">packed</span> with flavor
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {featuredItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="group bg-background rounded-3xl overflow-hidden border border-border hover:border-primary/40 hover:shadow-2xl hover:-translate-y-1 transition-all"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UtensilsCrossed className="h-14 w-14 text-muted-foreground" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground font-stamp text-[10px] tracking-widest shadow-lg">
                      <Flame className="h-3 w-3" /> HOT
                    </span>
                  </div>
                  <div className="p-5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-stamp text-[10px] tracking-widest text-primary">{item.category}</p>
                      <h3 className="font-display text-xl text-foreground mt-1 truncate">{item.name}</h3>
                      <p className="font-mega text-2xl text-foreground mt-1">₹{item.price.toFixed(0)}</p>
                    </div>
                    <Link to="/menu">
                      <Button size="icon" className="rounded-full h-12 w-12 shrink-0">
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-14">
              <Link to="/menu">
                <Button size="lg" variant="outline" className="rounded-full font-stamp tracking-widest text-xs h-12 px-8 border-2 border-foreground hover:bg-foreground hover:text-background">
                  SEE FULL MENU <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ───────────── BIG CTA ───────────── */}
      <section className="bg-primary text-primary-foreground py-24 md:py-36 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <p className="font-mega text-[30vw] leading-none">FEEL IT</p>
        </div>
        <div className="relative container mx-auto px-4 text-center max-w-3xl">
          <p className="font-stamp text-xs tracking-[0.3em] mb-4 opacity-80">— FEEL THE CRUNCH</p>
          <h2 className="font-mega text-6xl md:text-9xl leading-[0.85] mb-6">
            feel the<br />change
          </h2>
          <p className="font-body text-base md:text-lg opacity-90 mb-10 max-w-xl mx-auto">
            Fried for the bold, built for the hungry. Dive into a legendary crispy experience —
            every shattering edge and juicy bite rules.
          </p>
          <Link to="/menu">
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full h-14 px-10 font-stamp tracking-widest text-sm bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-2xl"
            >
              ORDER NOW <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ───────────── FOOTER ───────────── */}
      <footer className="bg-foreground text-background">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Flame className="h-7 w-7 text-primary" />
                <span className="font-stamp text-lg tracking-wider">FRIED&amp;CRISPY</span>
              </div>
              <p className="font-body text-sm opacity-70 leading-relaxed max-w-xs">
                Crispy, bold &amp; delicious — your favourite crispy chicken destination in Gorakhpur.
              </p>
            </div>
            <div>
              <p className="font-stamp text-xs tracking-widest opacity-50 mb-4">— EXPLORE</p>
              <div className="space-y-2 font-body text-sm">
                <Link to="/menu" className="block hover:text-primary transition-colors">Menu</Link>
                <Link to="/track" className="block hover:text-primary transition-colors">Track Order</Link>
                <Link to="/admin" className="block hover:text-primary transition-colors">Admin Panel</Link>
              </div>
            </div>
            <div>
              <p className="font-stamp text-xs tracking-widest opacity-50 mb-4">— CONTACT</p>
              <div className="space-y-3 font-body text-sm opacity-90">
                <p className="flex items-start gap-2"><MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /> Koni Jagdishpur Bypass, Gorakhpur</p>
                <a href="tel:+918005040580" className="flex items-center gap-2 hover:text-primary"><Phone className="h-4 w-4 text-primary flex-shrink-0" /> 8005040580</a>
                <a href="mailto:info@friedandcrispy.com" className="flex items-center gap-2 hover:text-primary"><Mail className="h-4 w-4 text-primary flex-shrink-0" /> info@friedandcrispy.com</a>
              </div>
            </div>
          </div>

          {/* Massive footer wordmark */}
          <div className="border-t border-background/20 pt-10">
            <p className="font-mega text-[22vw] md:text-[16vw] leading-[0.8] text-center opacity-95">
              FRIED&amp;CRISPY
            </p>
          </div>
          <p className="text-center font-stamp text-[10px] tracking-widest opacity-50 mt-6">
            © {new Date().getFullYear()} — ALL RIGHTS RESERVED
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
