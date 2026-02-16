import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, DollarSign, TrendingUp, Copy, Share2, Wallet,
  Link2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Header from "@/components/Header";
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
        <Header />
        <main className="relative z-10 container mx-auto px-4 pt-24 pb-16 text-center">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-4">Programa de Afiliados</h1>
          <p className="text-muted-foreground mb-6">Faça login para participar do programa de afiliados.</p>
          <Button onClick={() => window.location.href = "/auth?redirect=/afiliado"}>
            Entrar para Participar
          </Button>
        </main>
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
