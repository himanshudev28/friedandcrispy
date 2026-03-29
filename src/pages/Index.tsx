import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Star, Clock, MapPin, Phone, Mail, ArrowRight, Flame, Menu, X } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { MenuItem } from "@/types/menu";
import heroBg from "@/assets/hero-bg.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.6 } }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({ opacity: 1, scale: 1, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Index = () => {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 1.1]);

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
    "Burgers": "🍔", "Pizza": "🍕", "Drinks": "🥤", "Desserts": "🍰",
    "Momos": "🥟", "Chinese": "🍜", "Rolls": "🌯", "Shakes": "🥤",
    "Noodles": "🍝", "Rice": "🍚", "Combo": "🍱", "Snacks": "🍟",
    "Sandwich": "🥪", "Wraps": "🌮", "Pasta": "🍝",
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2 group">
            <Flame className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xl font-display font-bold text-foreground">Fried&Crispy</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-2">
            <ThemeToggle />
            <Link to="/track">
              <Button variant="ghost" className="font-body text-foreground hover:text-foreground">Track Order</Button>
            </Link>
            <Link to="/menu">
              <Button variant="ghost" className="font-body text-foreground hover:text-foreground">Menu</Button>
            </Link>
            <Link to="/admin">
              <Button variant="ghost" className="font-body text-foreground hover:text-foreground">Admin</Button>
            </Link>
            <Link to="/menu">
              <Button className="font-body rounded-full px-5 shadow-md">
                Order Now <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="sm:hidden bg-background/95 backdrop-blur-xl border-b border-border/50 px-4 pb-4 space-y-2"
          >
            <Link to="/track" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start font-body text-foreground">Track Order</Button>
            </Link>
            <Link to="/menu" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start font-body text-foreground">Menu</Button>
            </Link>
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start font-body text-foreground">Admin</Button>
            </Link>
            <Link to="/menu" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full font-body rounded-full shadow-md">
                Order Now <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative h-[100svh] min-h-[600px] flex items-center overflow-hidden">
        <motion.div className="absolute inset-0" style={{ opacity: heroOpacity, scale: heroScale }}>
          <img
            src={heroBg}
            alt="Delicious fried chicken and burgers"
            className="w-full h-full object-cover"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full px-4 py-1.5 mb-6"
            >
              <Flame className="h-4 w-4 text-primary" />
              <span className="text-sm font-body text-primary-foreground/90">Freshly Made with Love</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold text-white leading-[1.05] mb-6"
            >
              Taste the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Crunch
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
              className="text-lg md:text-xl text-white/70 mb-10 font-body max-w-lg leading-relaxed"
            >
              Crispy fried chicken, loaded burgers & bold flavors — crafted fresh daily at Fried&Crispy, Gorakhpur.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.7 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/menu">
                <Button size="lg" className="text-lg px-8 py-6 rounded-full font-body shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-105">
                  <UtensilsCrossed className="h-5 w-5 mr-2" /> View Menu
                </Button>
              </Link>
              <a href="tel:+917007835915">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-full font-body border-primary/50 text-primary-foreground bg-primary/20 hover:bg-primary/30 backdrop-blur-sm">
                  <Phone className="h-5 w-5 mr-2" /> Call Us
                </Button>
              </a>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5">
            <motion.div className="w-1.5 h-1.5 rounded-full bg-white/60" animate={{ y: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} />
          </div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="relative -mt-16 z-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="bg-card/80 backdrop-blur-xl border rounded-2xl shadow-2xl p-6 md:p-8 grid grid-cols-3 gap-4 md:gap-8"
          >
            {[
              { icon: Star, label: "Happy Customers", value: "2K+" },
              { icon: UtensilsCrossed, label: "Menu Items", value: "80+" },
              { icon: Clock, label: "Fast Delivery", value: "30min" },
            ].map((stat, i) => (
              <motion.div key={stat.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn}
                className="text-center space-y-1"
              >
                <stat.icon className="h-6 w-6 md:h-8 md:w-8 text-primary mx-auto" />
                <p className="text-xl md:text-3xl font-bold font-display text-foreground">{stat.value}</p>
                <p className="text-xs md:text-sm text-muted-foreground font-body">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-14">
              <span className="text-primary font-body font-semibold uppercase tracking-widest text-sm">Explore</span>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mt-2 mb-3">Our Categories</h2>
              <p className="text-muted-foreground font-body max-w-md mx-auto">Something delicious for every craving</p>
            </motion.div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {categories.slice(0, 8).map((cat, i) => (
                <motion.div key={cat} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                  <Link to={`/menu?category=${cat}`}
                    className="block p-6 md:p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 text-center group hover:-translate-y-1"
                  >
                    <span className="text-4xl md:text-5xl block mb-3 group-hover:scale-110 transition-transform duration-300">
                      {categoryIcons[cat] || "🍽️"}
                    </span>
                    <h3 className="font-display font-semibold text-base md:text-lg text-foreground group-hover:text-primary transition-colors">{cat}</h3>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Items */}
      {featuredItems && featuredItems.length > 0 && (
        <section className="py-20 md:py-28 bg-gradient-to-b from-card/50 to-background border-y border-border/50">
          <div className="container mx-auto px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-14">
              <span className="text-primary font-body font-semibold uppercase tracking-widest text-sm">Popular</span>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mt-2 mb-3">Featured Dishes</h2>
              <p className="text-muted-foreground font-body max-w-md mx-auto">Our most loved creations, crafted to perfection</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {featuredItems.map((item, i) => (
                <motion.div key={item.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                  className="rounded-2xl bg-card border border-border/50 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 group hover:-translate-y-1"
                >
                  {item.image_url ? (
                    <div className="aspect-[4/3] overflow-hidden">
                      <img src={item.image_url} alt={item.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                      <UtensilsCrossed className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-5">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider font-body">{item.category}</span>
                    <h3 className="font-display font-semibold text-lg text-foreground mt-1 group-hover:text-primary transition-colors">{item.name}</h3>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-2xl font-bold text-primary font-body">₹{item.price.toFixed(0)}</p>
                      <Link to="/menu">
                        <Button size="sm" className="rounded-full font-body shadow-md">
                          Order <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={3} className="text-center mt-12">
              <Link to="/menu">
                <Button size="lg" variant="outline" className="rounded-full px-10 font-body text-base hover:scale-105 transition-transform">
                  See Full Menu <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-accent" />
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
            <div className="relative px-8 py-16 md:px-16 md:py-24 text-center">
              <motion.h2 custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-4"
              >
                Hungry? Order Now!
              </motion.h2>
              <motion.p custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="text-primary-foreground/80 font-body text-lg max-w-lg mx-auto mb-8"
              >
                Skip the wait. Browse our menu and place your order directly via WhatsApp. Hot & fresh, delivered to your door.
              </motion.p>
              <motion.div custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Link to="/menu">
                  <Button size="lg" variant="secondary" className="text-lg px-10 py-6 rounded-full font-body shadow-2xl hover:scale-105 transition-transform">
                    <UtensilsCrossed className="h-5 w-5 mr-2" /> Browse Menu
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Flame className="h-7 w-7 text-primary" />
                <span className="text-xl font-display font-bold text-foreground">Fried&Crispy</span>
              </div>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">
                Crispy, bold & delicious — your favourite fast food destination in Gorakhpur.
              </p>
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground mb-4">Quick Links</h4>
              <div className="space-y-2 font-body text-sm">
                <Link to="/menu" className="block text-muted-foreground hover:text-primary transition-colors">Menu</Link>
                <Link to="/admin" className="block text-muted-foreground hover:text-primary transition-colors">Admin Panel</Link>
              </div>
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground mb-4">Contact</h4>
              <div className="space-y-3 font-body text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary flex-shrink-0" /> Koni Jagdishpur Bypass, Gorakhpur</p>
                <a href="tel:+918005040580" className="flex items-center gap-2 hover:text-primary transition-colors"><Phone className="h-4 w-4 text-primary flex-shrink-0" /> 8005040580</a>
                <a href="mailto:info@friedandcrispy.com" className="flex items-center gap-2 hover:text-primary transition-colors"><Mail className="h-4 w-4 text-primary flex-shrink-0" /> info@friedandcrispy.com</a>
              </div>
            </div>
          </div>
          <div className="border-t mt-10 pt-6 text-center">
            <p className="text-xs text-muted-foreground font-body">© {new Date().getFullYear()} Fried&Crispy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
