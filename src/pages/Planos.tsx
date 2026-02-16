import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Crown, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { usePageSEO } from "@/hooks/usePageSEO";
import { toast } from "sonner";
import heroBg from "@/assets/hero-bg.jpg";

export default function Planos() {
  usePageSEO({
    title: "Planos e Preços — Escolha o Melhor para Você",
    description: "Compare nossos planos: Grátis, Essencial e Premium. Leituras ilimitadas, consultas ao vivo e cursos exclusivos.",
    path: "/planos",
  });

  const { plans, subscription } = useSubscription();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");

  const planIcons: Record<string, any> = { free: Star, essencial: Zap, premium: Crown };
  const planColors: Record<string, string> = {
    free: "border-border/30",
    essencial: "border-primary/40 ring-2 ring-primary/20",
    premium: "border-amber-500/40",
  };

  const handleSubscribe = (planSlug: string) => {
    if (!isAuthenticated) {
      navigate("/auth?redirect=/planos");
      return;
    }
    if (planSlug === "free") {
      toast.info("Você já tem acesso ao plano Grátis!");
      return;
    }
    toast.success("Redirecionando para o pagamento...");
    navigate("/checkout");
  };

  const yearlyDiscount = (monthly: number, yearly: number) => {
    if (!monthly || !yearly) return 0;
    return Math.round((1 - yearly / (monthly * 12)) * 100);
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
      </div>
      <Header />
      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Escolha o plano certo para você
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Comece grátis e evolua quando sentir que é hora. Sem compromisso, cancele quando quiser.
            </p>
            <div className="inline-flex items-center gap-3 bg-secondary/60 rounded-full p-1">
              <button
                onClick={() => setPeriod("monthly")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${period === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                Mensal
              </button>
              <button
                onClick={() => setPeriod("yearly")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${period === "yearly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                Anual <span className="text-xs ml-1 text-emerald-400">Economize até 20%</span>
              </button>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {plans.map((plan, index) => {
              const Icon = planIcons[plan.slug] || Star;
              const isCurrentPlan = subscription?.plan?.slug === plan.slug || (!subscription && plan.slug === "free");
              const price = period === "yearly" && plan.price_yearly ? plan.price_yearly / 12 : plan.price_monthly;
              const discount = yearlyDiscount(plan.price_monthly, plan.price_yearly);

              return (
                <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <Card className={`bg-card/80 backdrop-blur-md ${planColors[plan.slug] || "border-border/30"} relative overflow-hidden h-full`}>
                    {plan.slug === "essencial" && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-semibold">
                        Mais Popular
                      </div>
                    )}
                    <CardContent className="p-4 sm:p-6 flex flex-col h-full">
                      <div className="text-center mb-6">
                        <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${plan.slug === "premium" ? "bg-amber-500/15 border border-amber-500/25" : "bg-primary/15 border border-primary/25"}`}>
                          <Icon className={`w-6 h-6 ${plan.slug === "premium" ? "text-amber-400" : "text-primary"}`} />
                        </div>
                        <h3 className="font-serif text-xl font-bold text-foreground">{plan.name}</h3>
                        <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>
                      </div>
                      <div className="text-center mb-6">
                        {plan.price_monthly === 0 ? (
                          <p className="text-3xl font-bold text-foreground">Grátis</p>
                        ) : (
                          <>
                            <div className="flex items-baseline justify-center gap-1">
                              <span className="text-sm text-muted-foreground">R$</span>
                              <span className="text-4xl font-bold text-foreground">{price.toFixed(2).replace(".", ",")}</span>
                              <span className="text-sm text-muted-foreground">/mês</span>
                            </div>
                            {period === "yearly" && discount > 0 && (
                              <p className="text-xs text-emerald-400 mt-1">
                                Economia de {discount}% — R$ {plan.price_yearly?.toFixed(2).replace(".", ",")} /ano
                              </p>
                            )}
                          </>
                        )}
                      </div>
                      <div className="space-y-3 flex-1 mb-6">
                        {(plan.features as string[]).map((feature, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-foreground/80">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <Button
                        onClick={() => handleSubscribe(plan.slug)}
                        disabled={isCurrentPlan}
                        className={`w-full ${plan.slug === "essencial" ? "bg-primary text-primary-foreground hover:bg-primary/90" : plan.slug === "premium" ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-secondary text-foreground hover:bg-secondary/80"}`}
                      >
                        {isCurrentPlan ? "Plano atual" : plan.price_monthly === 0 ? "Começar grátis" : "Assinar agora"}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-16 max-w-2xl mx-auto">
            <h3 className="font-serif text-2xl font-bold text-foreground text-center mb-8">Perguntas Frequentes</h3>
            <div className="space-y-4">
              {[
                { q: "Posso cancelar a qualquer momento?", a: "Sim! Sem multa, sem burocracia. Você continua com acesso até o fim do período pago." },
                { q: "Como funciona o pagamento?", a: "Aceitamos PIX e cartão de crédito. O pagamento é processado de forma segura." },
                { q: "Posso trocar de plano?", a: "Sim, você pode fazer upgrade ou downgrade a qualquer momento. O valor é ajustado proporcionalmente." },
                { q: "O que acontece quando meu plano expira?", a: "Você volta automaticamente para o plano Grátis, sem perder nenhum dado ou histórico." },
              ].map((faq, i) => (
                <Card key={i} className="bg-card/80 border-primary/10">
                  <CardContent className="p-5">
                    <h4 className="font-semibold text-foreground mb-2">{faq.q}</h4>
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
