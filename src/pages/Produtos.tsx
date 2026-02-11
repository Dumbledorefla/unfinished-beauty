import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import heroBg from "@/assets/hero-bg.jpg";

interface Product {
  id: string;
  name: string;
  short_description: string | null;
  category: string;
  price: number;
  original_price: number | null;
  image_url: string | null;
  is_combo: boolean | null;
  is_featured: boolean | null;
}

export default function Produtos() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("products").select("*").eq("is_active", true).then(({ data }) => {
      setProducts(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 to-background" />
      </div>
      <Header />
      <main className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/40 mb-4">
            <ShoppingBag className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary">Loja Mística</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Produtos</h1>
          <p className="text-foreground/70 max-w-2xl mx-auto">Produtos esotéricos e espirituais para sua jornada</p>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <div key={i} className="h-64 rounded-xl shimmer" />)}
          </div>
        ) : products.length === 0 ? (
          <Card className="bg-card/80 backdrop-blur-md border-primary/20 text-center py-12">
            <CardContent>
              <ShoppingBag className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Em breve</h3>
              <p className="text-foreground/60">Nossos produtos estarão disponíveis em breve.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="bg-card/80 backdrop-blur-md border-primary/20 hover:border-primary/50 transition-all overflow-hidden">
                  {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-48 object-cover" />}
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">{p.category}</span>
                      {p.is_featured && <span className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-accent/20 text-accent"><Sparkles className="w-3 h-3" />Destaque</span>}
                      {p.is_combo && <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-400">Combo</span>}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-foreground mb-1">{p.name}</h3>
                    {p.short_description && <p className="text-foreground/60 text-sm mb-3">{p.short_description}</p>}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-primary font-bold text-xl">R$ {Number(p.price).toFixed(2)}</span>
                      {p.original_price && <span className="text-foreground/40 line-through text-sm">R$ {Number(p.original_price).toFixed(2)}</span>}
                    </div>
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Comprar</Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
