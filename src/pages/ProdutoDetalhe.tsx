import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import { usePageSEO } from "@/hooks/usePageSEO";
import heroBg from "@/assets/hero-bg.jpg";

export default function ProdutoDetalhe() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  usePageSEO({
    title: product ? `${product.name} — Chave do Oráculo` : "Produto — Chave do Oráculo",
    description: product?.short_description || product?.description?.slice(0, 155) || "Conheça nossos produtos esotéricos exclusivos.",
    path: `/produto/${slug}`,
  });

  useEffect(() => {
    if (!slug) return;
    supabase.from("products").select("*").eq("slug", slug).eq("is_active", true).single()
      .then(({ data }) => { setProduct(data); setLoading(false); });
  }, [slug]);

  const handleAdd = () => {
    if (!product) return;
    addItem({ id: product.id, name: product.name, price: product.price, original_price: product.original_price, image_url: product.image_url, category: product.category });
    toast({ title: "Adicionado ao carrinho!", description: product.name });
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 to-background" />
      </div>
      <Header />
      <main className="relative z-10 container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        <Link to="/produtos" className="inline-flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar para Produtos
        </Link>

        {loading ? (
          <div className="h-96 rounded-xl shimmer" />
        ) : !product ? (
          <Card className="bg-card/80 backdrop-blur-md border-primary/20 text-center py-12">
            <CardContent>
              <h3 className="text-lg font-semibold text-foreground mb-2">Produto não encontrado</h3>
              <Link to="/produtos"><Button variant="outline">Ver todos os produtos</Button></Link>
            </CardContent>
          </Card>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-card/80 backdrop-blur-md border-primary/20 overflow-hidden">
              <div className="md:flex">
                {product.image_url && (
                  <div className="md:w-1/2">
                    <img src={product.image_url} alt={product.name} className="w-full h-64 md:h-full object-cover" />
                  </div>
                )}
                <CardContent className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">{product.category}</span>
                    {product.is_featured && <span className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-accent/20 text-accent"><Sparkles className="w-3 h-3" />Destaque</span>}
                    {product.is_combo && <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-400">Combo</span>}
                  </div>
                  <h1 className="font-serif text-3xl font-bold text-foreground mb-2">{product.name}</h1>
                  {product.short_description && <p className="text-foreground/60 mb-4">{product.short_description}</p>}
                  {product.description && <p className="text-foreground/70 text-sm mb-6 whitespace-pre-line">{product.description}</p>}

                  {product.has_sample && product.sample_description && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                      <h4 className="text-sm font-semibold text-primary mb-1">Amostra Grátis</h4>
                      <p className="text-foreground/60 text-sm">{product.sample_description}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-primary font-bold text-2xl">R$ {Number(product.price).toFixed(2)}</span>
                    {product.original_price && <span className="text-foreground/40 line-through">R$ {Number(product.original_price).toFixed(2)}</span>}
                  </div>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg" onClick={handleAdd}>
                    <ShoppingBag className="w-5 h-5 mr-2" /> Adicionar ao Carrinho
                  </Button>
                </CardContent>
              </div>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}
