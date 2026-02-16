import { useState, useEffect } from "react";
import { Users, DollarSign, Check, X, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AffiliateRow {
  id: string;
  code: string;
  commission_rate: number;
  status: string;
  total_earned: number;
  total_withdrawn: number;
  total_referrals: number;
  total_conversions: number;
  pix_key: string | null;
  created_at: string;
  profile?: { display_name: string | null; email: string | null };
}

interface WithdrawalRow {
  id: string;
  amount: number;
  pix_key: string;
  status: string;
  admin_note: string | null;
  created_at: string;
  affiliate?: { code: string };
}

export default function AdminAffiliates() {
  const [affiliates, setAffiliates] = useState<AffiliateRow[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRow | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [tab, setTab] = useState<"affiliates" | "withdrawals">("affiliates");

  const fetchData = async () => {
    setLoading(true);

    const { data: affs } = await supabase
      .from("affiliates")
      .select("*")
      .order("created_at", { ascending: false });

    // Fetch profiles separately for each affiliate
    const mappedAffs: AffiliateRow[] = [];
    if (affs) {
      for (const a of affs) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, email")
          .eq("user_id", a.user_id)
          .single();
        mappedAffs.push({ ...(a as unknown as AffiliateRow), profile: profile || undefined });
      }
    }
    setAffiliates(mappedAffs);

    const { data: withs } = await supabase
      .from("affiliate_withdrawals")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    setWithdrawals((withs as unknown as WithdrawalRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleWithdrawalAction = async (id: string, status: "paid" | "rejected") => {
    const { error } = await supabase
      .from("affiliate_withdrawals")
      .update({
        status,
        admin_note: adminNote || null,
        processed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao processar saque.");
    } else {
      toast.success(status === "paid" ? "Saque marcado como pago!" : "Saque rejeitado.");
      setSelectedWithdrawal(null);
      setAdminNote("");
      fetchData();
    }
  };

  const totalPendingWithdrawals = withdrawals
    .filter((w) => w.status === "pending")
    .reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/80 border-primary/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{affiliates.length}</p>
            <p className="text-xs text-muted-foreground">Total Afiliados</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 border-primary/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {affiliates.reduce((s, a) => s + a.total_referrals, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Total Indicados</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 border-primary/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              R$ {affiliates.reduce((s, a) => s + a.total_earned, 0).toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">Total Comissões</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 border-primary/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-accent">
              R$ {totalPendingWithdrawals.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">Saques Pendentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={tab === "affiliates" ? "default" : "outline"}
          onClick={() => setTab("affiliates")}
          size="sm"
        >
          <Users className="w-4 h-4 mr-1" /> Afiliados
        </Button>
        <Button
          variant={tab === "withdrawals" ? "default" : "outline"}
          onClick={() => setTab("withdrawals")}
          size="sm"
        >
          <DollarSign className="w-4 h-4 mr-1" /> Saques
          {totalPendingWithdrawals > 0 && (
            <span className="ml-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
              {withdrawals.filter((w) => w.status === "pending").length}
            </span>
          )}
        </Button>
      </div>

      {/* Affiliates Table */}
      {tab === "affiliates" && (
        <Card className="bg-card/80 border-primary/20">
          <CardContent className="p-4">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-12 rounded-lg shimmer" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Afiliado</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Taxa</TableHead>
                      <TableHead>Indicados</TableHead>
                      <TableHead>Conversões</TableHead>
                      <TableHead>Ganho</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {affiliates.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="text-sm">
                          {a.profile?.display_name || a.profile?.email || "—"}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-primary">{a.code}</TableCell>
                        <TableCell className="text-sm">{a.commission_rate}%</TableCell>
                        <TableCell className="text-sm">{a.total_referrals}</TableCell>
                        <TableCell className="text-sm">{a.total_conversions}</TableCell>
                        <TableCell className="text-sm font-medium">R$ {a.total_earned.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={a.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}>
                            {a.status === "active" ? "Ativo" : "Inativo"}
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
      )}

      {/* Withdrawals Table */}
      {tab === "withdrawals" && (
        <Card className="bg-card/80 border-primary/20">
          <CardContent className="p-4">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-12 rounded-lg shimmer" />)}
              </div>
            ) : withdrawals.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhum saque solicitado.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>PIX</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((w) => (
                      <TableRow key={w.id}>
                        <TableCell className="text-sm">
                          {new Date(w.created_at).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell className="text-sm font-medium">R$ {w.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">{w.pix_key}</TableCell>
                        <TableCell>
                          <Badge className={
                            w.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                            w.status === "paid" ? "bg-emerald-500/20 text-emerald-400" :
                            "bg-red-500/20 text-red-400"
                          }>
                            {w.status === "pending" ? "Pendente" : w.status === "paid" ? "Pago" : "Rejeitado"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {w.status === "pending" && (
                            <Button size="sm" variant="ghost" onClick={() => { setSelectedWithdrawal(w); setAdminNote(""); }}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Process Withdrawal Dialog */}
      <Dialog open={!!selectedWithdrawal} onOpenChange={() => setSelectedWithdrawal(null)}>
        <DialogContent className="bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle>Processar Saque</DialogTitle>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Valor</p>
                  <p className="font-bold text-lg">R$ {selectedWithdrawal.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Chave PIX</p>
                  <p className="font-mono text-sm">{selectedWithdrawal.pix_key}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Nota do admin (opcional)</p>
                <Textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Comprovante enviado, etc."
                  className="bg-background/50"
                  rows={2}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedWithdrawal(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => selectedWithdrawal && handleWithdrawalAction(selectedWithdrawal.id, "rejected")}
            >
              <X className="w-4 h-4 mr-1" /> Rejeitar
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => selectedWithdrawal && handleWithdrawalAction(selectedWithdrawal.id, "paid")}
            >
              <Check className="w-4 h-4 mr-1" /> Marcar como Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
