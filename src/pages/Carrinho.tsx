import { motion } from "framer-motion";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

export default function Carrinho() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();

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
            <ShoppingCart className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary">Seu Carrinho</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Seu Carrinho</h1>
        </motion.div>

        {items.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="bg-card/80 backdrop-blur-md border-primary/20 text-center py-12">
              <CardContent>
                <ShoppingBag className="w-16 h-16 mx-auto text-foreground/20 mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Seu carrinho está vazio</h3>
                <p className="text-foreground/60 mb-6">Explore nossa loja e encontre algo especial para você.</p>
                <Link to="/produtos">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Ver Produtos
                  </Button>
                </Link>
                <div className="mt-8 grid sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
                  <Link to="/tarot/dia" className="p-4 rounded-xl bg-secondary/40 border border-border/20 hover:border-primary/30 transition-all">
                    <p className="font-semibold text-foreground text-sm">🔮 Tarot do Dia</p>
                    <p className="text-xs text-muted-foreground">Tire sua carta grátis</p>
                  </Link>
                  <Link to="/planos" className="p-4 rounded-xl bg-secondary/40 border border-border/20 hover:border-primary/30 transition-all">
                    <p className="font-semibold text-foreground text-sm">⭐ Planos Premium</p>
                    <p className="text-xs text-muted-foreground">Leituras ilimitadas</p>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items list */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="bg-card/80 backdrop-blur-md border-primary/20">
                    <CardContent className="p-4 flex items-center gap-4">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <ShoppingBag className="w-8 h-8 text-primary/40" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">{item.category}</span>
                        <h3 className="font-serif font-bold text-foreground mt-1 truncate">{item.name}</h3>
                        <p className="text-primary font-bold">R$ {Number(item.price).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button size="icon" variant="outline" className="h-8 w-8 border-primary/30" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-foreground font-semibold w-6 text-center">{item.quantity}</span>
                        <Button size="icon" variant="outline" className="h-8 w-8 border-primary/30" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10 flex-shrink-0" onClick={() => removeItem(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={clearCart}>
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar Carrinho
              </Button>
            </div>

            {/* Summary */}
            <div>
              <Card className="bg-card/80 backdrop-blur-md border-primary/20 sticky top-24">
                <CardContent className="p-6">
                  <h3 className="font-serif text-xl font-bold text-foreground mb-6">Resumo do Pedido</h3>
                  <div className="space-y-3 mb-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-foreground/70 truncate mr-2">{item.name} x{item.quantity}</span>
                        <span className="text-foreground font-medium">R$ {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-primary/20 pt-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-foreground font-bold text-lg">Total</span>
                      <span className="text-primary font-bold text-xl">R$ {totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  <Link to="/checkout">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base">
                      Ir para o pagamento
                    </Button>
                  </Link>
                  <Link to="/produtos" className="block mt-3">
                    <Button variant="outline" className="w-full border-primary/30">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Continuar explorando
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
