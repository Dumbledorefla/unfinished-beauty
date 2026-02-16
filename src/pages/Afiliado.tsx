import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, DollarSign, TrendingUp, Copy, Share2, Wallet,
  Link2, UserPlus, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAffiliate } from "@/hooks/useAffiliate";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import heroBg from "@/assets/hero-bg.jpg";

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovada",
  paid: "Paga",
  cancelled: "Cancelada",
  rejected: "Rejeitada",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  approved: "bg-blue-500/20 text-blue-400",
  paid: "bg-emerald-500/20 text-emerald-400",
  cancelled: "bg-red-500/20 text-red-400",
  rejected: "bg-red-500/20 text-red-400",
};

export default function Afiliado() {
  const { isAuthenticated } = useAuth();
  const {
    affiliate, commissions, withdrawals, loading,
    becomeAffiliate, updatePixKey, requestWithdrawal, getShareLink
  } = useAffiliate();
  const [pixKey, setPixKey] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [joining, setJoining] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareLink());
    toast.success("Link copiado!");
  };

  const handleCopyCode = () => {
    if (affiliate) {
      navigator.clipboard.writeText(affiliate.code);
      toast.success("Código copiado!");
    }
  };

  const handleJoin = async () => {
    setJoining(true);
    await becomeAffiliate();
    setJoining(false);
  };

  const handleSavePixKey = () => {
    if (pixKey.trim()) {
      updatePixKey(pixKey.trim());
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }
    const success = await requestWithdrawal(amount);
    if (success) {
      setShowWithdrawDialog(false);
      setWithdrawAmount("");
    }
  };

  const availableBalance = affiliate
    ? affiliate.total_earned - affiliate.total_withdrawn
    : 0;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 z-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
        </div>
        <Header />
        <main className="relative z-10 pt-24 pb-16">
          {/* Hero */}
          <section className="container mx-auto px-4 max-w-4xl text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 mb-6">
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-400 font-medium">Programa de Afiliados</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-5">
                Ganhe dinheiro indicando o{" "}
                <span className="text-primary">Chave do Oráculo</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
                Compartilhe seu link exclusivo e receba <strong className="text-emerald-400">10% de comissão</strong> em cada venda gerada pelas suas indicações. Sem limite de ganhos.
              </p>
              <Link to="/auth?redirect=/afiliado">
                <Button size="lg" className="bg-emerald-600 text-white hover:bg-emerald-700 px-8 py-5 text-base">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Quero ser afiliado
                </Button>
              </Link>
            </motion.div>
          </section>

          {/* Como funciona */}
          <section className="container mx-auto px-4 max-w-4xl mb-16">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">Como funciona</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: "1", title: "Cadastre-se", desc: "Crie sua conta grátis e acesse seu painel de afiliado com link exclusivo.", icon: UserPlus },
                { step: "2", title: "Compartilhe", desc: "Envie seu link para amigos, seguidores e redes sociais. Cada clique é rastreado.", icon: Share2 },
                { step: "3", title: "Receba", desc: "Ganhe 10% de comissão em cada venda. Saque via PIX quando quiser.", icon: DollarSign },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Card className="bg-card/80 backdrop-blur-md border-primary/20 text-center p-6 h-full">
                    <CardContent className="p-0">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-xs text-primary font-semibold mb-2">PASSO {item.step}</div>
                      <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Benefícios */}
          <section className="container mx-auto px-4 max-w-4xl mb-16">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">Por que ser afiliado?</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: "10% de comissão", desc: "Em cada venda gerada pelo seu link" },
                { title: "Sem investimento", desc: "Cadastro 100% gratuito, sem taxa" },
                { title: "Saque via PIX", desc: "Receba direto na sua conta quando quiser" },
                { title: "Painel completo", desc: "Acompanhe cliques, vendas e comissões em tempo real" },
                { title: "Link rastreado", desc: "Cada indicação é registrada automaticamente" },
                { title: "Sem limite", desc: "Quanto mais indicar, mais ganha" },
              ].map((b, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-secondary/40 border border-border/20"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{b.title}</p>
                    <p className="text-xs text-muted-foreground">{b.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="container mx-auto px-4 max-w-2xl mb-16">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">Perguntas Frequentes</h2>
            <div className="space-y-4">
              {[
                { q: "Preciso pagar algo para ser afiliado?", a: "Não! O programa é 100% gratuito." },
                { q: "Qual é a comissão?", a: "Você recebe 10% do valor de cada venda gerada pelo seu link." },
                { q: "Como recebo meus ganhos?", a: "Via PIX. Basta solicitar o saque no painel de afiliado." },
                { q: "Tem limite de ganhos?", a: "Não! Quanto mais indicar, mais ganha. Sem teto." },
              ].map((faq, i) => (
                <Card key={i} className="bg-card/80 backdrop-blur-md border-primary/10">
                  <CardContent className="p-5">
                    <p className="font-semibold text-foreground mb-1">{faq.q}</p>
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA Final */}
          <section className="container mx-auto px-4 max-w-2xl text-center">
            <Card className="bg-gradient-to-r from-emerald-500/10 to-primary/10 border-emerald-500/20 p-8">
              <CardContent className="p-0">
                <h3 className="text-2xl font-bold text-foreground mb-3">Pronto para começar a ganhar?</h3>
                <p className="text-muted-foreground mb-6">Crie sua conta e comece a compartilhar seu link agora mesmo.</p>
                <Link to="/auth?redirect=/afiliado">
                  <Button size="lg" className="bg-emerald-600 text-white hover:bg-emerald-700 px-8">
                    Criar minha conta de afiliado
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <Header />
        <main className="relative z-10 container mx-auto px-4 pt-24 pb-16">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-2xl shimmer" />)}
          </div>
        </main>
      </div>
    );
  }

  // Não é afiliado ainda — tela de convite
  if (!affiliate) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 z-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
        </div>
        <Header />
        <main className="relative z-10 container mx-auto px-4 pt-24 pb-16 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-card/80 backdrop-blur-md border-primary/20 text-center">
              <CardContent className="py-12 space-y-6">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                  <Share2 className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h1 className="font-serif text-3xl font-bold text-foreground mb-3">
                    Programa de Afiliados
                  </h1>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Indique amigos para o Chave do Oráculo e ganhe comissão em cada compra que eles fizerem.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <Link2 className="w-6 h-6 text-primary mb-2" />
                    <h3 className="font-semibold text-foreground text-sm">1. Compartilhe</h3>
                    <p className="text-xs text-muted-foreground mt-1">Envie seu link único para amigos e seguidores.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <Users className="w-6 h-6 text-primary mb-2" />
                    <h3 className="font-semibold text-foreground text-sm">2. Eles compram</h3>
                    <p className="text-xs text-muted-foreground mt-1">Quando seus indicados fazem uma compra, você ganha.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <DollarSign className="w-6 h-6 text-primary mb-2" />
                    <h3 className="font-semibold text-foreground text-sm">3. Receba</h3>
                    <p className="text-xs text-muted-foreground mt-1">Comissão de 10% em cada venda, direto no seu PIX.</p>
                  </div>
                </div>
                <Button
                  onClick={handleJoin}
                  disabled={joining}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-5 text-base pulse-glow"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  {joining ? "Ativando..." : "Quero ser Afiliado"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  // Dashboard do afiliado
  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
      </div>
      <Header />
      <main className="relative z-10 container mx-auto px-4 pt-24 pb-16 max-w-4xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-6">
            Painel do Afiliado
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-card/80 border-primary/20">
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 text-primary mx-auto mb-1" />
                <p className="text-2xl font-bold text-foreground">{affiliate.total_referrals}</p>
                <p className="text-xs text-muted-foreground">Indicados</p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border-primary/20">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-foreground">{affiliate.total_conversions}</p>
                <p className="text-xs text-muted-foreground">Conversões</p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border-primary/20">
              <CardContent className="p-4 text-center">
                <DollarSign className="w-6 h-6 text-accent mx-auto mb-1" />
                <p className="text-2xl font-bold text-foreground">R$ {affiliate.total_earned.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Total Ganho</p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border-primary/20">
              <CardContent className="p-4 text-center">
                <Wallet className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-foreground">R$ {availableBalance.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Disponível</p>
              </CardContent>
            </Card>
          </div>

          {/* Share Link */}
          <Card className="bg-card/80 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Link2 className="w-5 h-5" /> Seu Link de Indicação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={getShareLink()}
                  readOnly
                  className="bg-background/50 font-mono text-sm"
                />
                <Button variant="outline" onClick={handleCopyLink}>
                  <Copy className="w-4 h-4 mr-1" /> Copiar
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Código: <strong className="text-primary">{affiliate.code}</strong></span>
                <button onClick={handleCopyCode} className="text-primary hover:underline text-xs">
                  Copiar código
                </button>
                <span>•</span>
                <span>Comissão: <strong className="text-foreground">{affiliate.commission_rate}%</strong></span>
              </div>
            </CardContent>
          </Card>

          {/* PIX Key + Withdraw */}
          <Card className="bg-card/80 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wallet className="w-5 h-5" /> Dados para Saque
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="pixKey" className="text-sm text-muted-foreground">Chave PIX</Label>
                  <Input
                    id="pixKey"
                    value={pixKey || affiliate.pix_key || ""}
                    onChange={(e) => setPixKey(e.target.value)}
                    placeholder="CPF, email, telefone ou chave aleatória"
                    className="bg-background/50"
                  />
                </div>
                <Button variant="outline" onClick={handleSavePixKey} className="mt-auto">
                  Salvar
                </Button>
              </div>
              {availableBalance >= 20 && (
                <Button onClick={() => setShowWithdrawDialog(true)} className="bg-emerald-600 hover:bg-emerald-700">
                  <DollarSign className="w-4 h-4 mr-1" /> Solicitar Saque
                </Button>
              )}
              {availableBalance > 0 && availableBalance < 20 && (
                <p className="text-xs text-muted-foreground">Mínimo para saque: R$ 20,00</p>
              )}
            </CardContent>
          </Card>

          {/* Commissions Table */}
          <Card className="bg-card/80 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Comissões</CardTitle>
            </CardHeader>
            <CardContent>
              {commissions.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">
                  Nenhuma comissão ainda. Compartilhe seu link para começar a ganhar!
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Venda</TableHead>
                        <TableHead>Taxa</TableHead>
                        <TableHead>Comissão</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissions.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="text-sm">
                            {new Date(c.created_at).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell className="text-sm">R$ {c.order_amount.toFixed(2)}</TableCell>
                          <TableCell className="text-sm">{c.commission_rate}%</TableCell>
                          <TableCell className="text-sm font-medium text-emerald-400">
                            R$ {c.commission_amount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[c.status] || ""}>
                              {statusLabels[c.status] || c.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Withdrawals Table */}
          {withdrawals.length > 0 && (
            <Card className="bg-card/80 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Saques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>PIX</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals.map((w) => (
                        <TableRow key={w.id}>
                          <TableCell className="text-sm">
                            {new Date(w.created_at).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell className="text-sm font-medium">R$ {w.amount.toFixed(2)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{w.pix_key}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[w.status] || ""}>
                              {statusLabels[w.status] || w.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Withdraw Dialog */}
        <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
          <DialogContent className="bg-card border-primary/20">
            <DialogHeader>
              <DialogTitle>Solicitar Saque</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Saldo disponível: <strong className="text-foreground">R$ {availableBalance.toFixed(2)}</strong>
              </p>
              <div>
                <Label htmlFor="withdrawAmount">Valor do saque (R$)</Label>
                <Input
                  id="withdrawAmount"
                  type="number"
                  min="20"
                  max={availableBalance}
                  step="0.01"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Mínimo R$ 20,00"
                  className="bg-background/50"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                PIX: {affiliate?.pix_key || "Não configurado"}
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>Cancelar</Button>
              <Button onClick={handleWithdraw} className="bg-emerald-600 hover:bg-emerald-700">
                Confirmar Saque
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
