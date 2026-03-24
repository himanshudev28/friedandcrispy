import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MenuItem } from "@/types/menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Search, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const MenuPage = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [search, setSearch] = useState("");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      const { data } = await supabase.from("menu").select("*").order("created_at", { ascending: false });
      return (data as MenuItem[]) || [];
    },
  });

  const categories = ["All", ...Array.from(new Set(items.map((i) => i.category)))];

  const filtered = items.filter((item) => {
    const matchCat = selectedCategory === "All" || item.category === selectedCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <UtensilsCrossed className="h-6 w-6 text-primary" />
            <span className="text-xl font-display font-bold">FlameGrill</span>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-display font-bold mb-2">Our Menu</h1>
        <p className="text-muted-foreground font-body mb-8">Discover flavors crafted with passion</p>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 font-body" />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" className="rounded-full font-body"
                onClick={() => setSelectedCategory(cat)}>
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-xl bg-muted animate-pulse aspect-[4/5]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <UtensilsCrossed className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground font-body">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-xl bg-card border overflow-hidden hover:shadow-lg transition-shadow group">
                {item.image_url ? (
                  <div className="aspect-video overflow-hidden">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <UtensilsCrossed className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
                <div className="p-4">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider font-body">{item.category}</span>
                  <h3 className="font-display font-semibold text-lg mt-1">{item.name}</h3>
                  <p className="text-xl font-bold text-primary mt-2 font-body">₹{item.price.toFixed(2)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
