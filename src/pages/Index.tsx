import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, ChefHat, Star, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { MenuItem } from "@/types/menu";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Index = () => {
  const { data: featuredItems } = useQuery({
    queryKey: ["featured-menu"],
    queryFn: async () => {
      const { data } = await supabase.from("menu").select("*").limit(6);
      return (data as MenuItem[]) || [];
    },
  });

  const categories = [
    { name: "Burgers", icon: "🍔", desc: "Juicy handcrafted burgers" },
    { name: "Pizza", icon: "🍕", desc: "Wood-fired perfection" },
    { name: "Drinks", icon: "🥤", desc: "Refreshing beverages" },
    { name: "Desserts", icon: "🍰", desc: "Sweet indulgence" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <UtensilsCrossed className="h-7 w-7 text-primary" />
            <span className="text-xl font-display font-bold text-foreground">Fried&Crispy</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/menu">
              <Button variant="ghost" className="font-body">Menu</Button>
            </Link>
            <Link to="/admin">
              <Button variant="outline" size="sm" className="font-body">Admin</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
        <div className="container mx-auto px-4 py-24 md:py-36 relative">
          <div className="max-w-2xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-primary font-semibold mb-4 tracking-wider uppercase text-sm font-body"
            >
              Welcome to Fried&Crispy
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-display font-bold text-foreground leading-tight mb-6"
            >
              Taste the <span className="text-primary">Flame</span>,<br />Feel the Flavor
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground mb-8 font-body max-w-lg"
            >
              Experience premium dining with our handcrafted recipes, fresh ingredients, and bold flavors that keep you coming back.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Link to="/menu">
                <Button size="lg" className="text-lg px-8 py-6 rounded-full font-body shadow-lg hover:shadow-xl transition-shadow">
                  View Menu
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-card">
        <div className="container mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
          {[
            { icon: Star, label: "5-Star Reviews", value: "2K+" },
            { icon: UtensilsCrossed, label: "Menu Items", value: "80+" },
            { icon: Clock, label: "Years Serving", value: "15+" },
          ].map((stat, i) => (
            <motion.div key={stat.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="space-y-2">
              <stat.icon className="h-8 w-8 text-primary mx-auto" />
              <p className="text-2xl font-bold font-display text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground font-body">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">Explore Our Categories</h2>
            <p className="text-muted-foreground font-body">Something for every craving</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <motion.div key={cat.name} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Link to={`/menu?category=${cat.name}`} className="block p-6 rounded-xl bg-card border hover:border-primary/50 hover:shadow-lg transition-all text-center group">
                  <span className="text-5xl block mb-3">{cat.icon}</span>
                  <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground font-body mt-1">{cat.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Items */}
      {featuredItems && featuredItems.length > 0 && (
        <section className="py-20 bg-card border-y">
          <div className="container mx-auto px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">Featured Dishes</h2>
              <p className="text-muted-foreground font-body">Our most loved creations</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredItems.map((item, i) => (
                <motion.div key={item.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                  className="rounded-xl bg-background border overflow-hidden hover:shadow-lg transition-shadow group">
                  {item.image_url ? (
                    <div className="aspect-video overflow-hidden">
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <UtensilsCrossed className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-4">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider font-body">{item.category}</span>
                    <h3 className="font-display font-semibold text-lg text-foreground mt-1">{item.name}</h3>
                    <p className="text-xl font-bold text-primary mt-2 font-body">₹{item.price.toFixed(2)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/menu"><Button size="lg" variant="outline" className="rounded-full px-8 font-body">See Full Menu</Button></Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <UtensilsCrossed className="h-6 w-6 text-primary" />
            <span className="text-lg font-display font-bold text-foreground">FlameGrill</span>
          </div>
          <p className="text-sm text-muted-foreground font-body">© 2024 FlameGrill Restaurant. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
