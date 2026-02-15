import { useState, useEffect } from "react";
import { Check, X, Eye, Download, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { getPaymentProofSignedUrl } from "@/lib/storage";
import { toast } from "sonner";

interface PaymentOrder {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  created_at: string;
  payment_provider: string | null;
  profile?: { display_name: string | null; email: string | null };
  proofs?: { id: string; file_path: string; review_status: string; uploaded_at: string; note: string | null }[];
  items?: { product_name: string; quantity: number; price: number }[];
}

const statusLabels: Record<string, string> = {
  pending_payment: "Aguardando Pagamento",
  payment_submitted: "Comprovante Enviado",
  paid: "Pago",
  rejected: "Rejeitado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
  pending: "Pendente",
};

const statusColors: Record<string, string> = {
  pending_payment: "bg-yellow-500/20 text-yellow-400",
  payment_submitted: "bg-orange-500/20 text-orange-400",
  paid: "bg-emerald-500/20 text-emerald-400",
  rejected: "bg-destructive/20 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
  refunded: "bg-blue-500/20 text-blue-400",
  pending: "bg-yellow-500/20 text-yellow-400",
};

export default function AdminPayments({ onRefresh }: { onRefresh: () => void }) {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<PaymentOrder | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    setLoading(true);
    const { data: ordersData } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!ordersData) { setLoading(false); return; }

    const enriched: PaymentOrder[] = [];
    for (const o of ordersData) {
      const [profileRes, proofsRes, itemsRes] = await Promise.all([
        supabase.from("profiles").select("display_name, email").eq("user_id", o.user_id).single(),
        supabase.from("payment_proofs").select("*").eq("order_id", o.id).order("uploaded_at", { ascending: false }),
        supabase.from("order_items").select("product_name, quantity, price").eq("order_id", o.id),
      ]);
      enriched.push({
        ...o,
        profile: profileRes.data || undefined,
        proofs: proofsRes.data || [],
        items: itemsRes.data || [],
      });
    }
    setOrders(enriched);
    setLoading(false);
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const openDetails = async (order: PaymentOrder) => {
    setSelectedOrder(order);
    setReviewNote("");
    setProofUrl(null);
    if (order.proofs && order.proofs.length > 0) {
      try {
        const url = await getPaymentProofSignedUrl(order.proofs[0].file_path);
        setProofUrl(url);
      } catch { /* ignore */ }
    }
  };

  const handleApprove = async () => {
    if (!selectedOrder) return;
    setProcessing(true);
    try {
      // Update order status
      await supabase.from("orders").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", selectedOrder.id);

      // Update proof status
      if (selectedOrder.proofs && selectedOrder.proofs.length > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from("payment_proofs").update({
          review_status: "approved",
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          note: reviewNote || null,
        }).eq("order_id", selectedOrder.id);
      }

      // Update payment transaction
      await supabase.from("payment_transactions").update({ status: "paid" }).eq("order_id", selectedOrder.id);

      toast.success("Pagamento aprovado! Acesso liberado automaticamente.");
      setSelectedOrder(null);
      loadOrders();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Erro ao aprovar");
    } finally { setProcessing(false); }
  };

  const handleReject = async () => {
    if (!selectedOrder) return;
    setProcessing(true);
    try {
      await supabase.from("orders").update({ status: "rejected" }).eq("id", selectedOrder.id);

      if (selectedOrder.proofs && selectedOrder.proofs.length > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from("payment_proofs").update({
          review_status: "rejected",
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          note: reviewNote || null,
        }).eq("order_id", selectedOrder.id);
      }

      await supabase.from("payment_transactions").update({ status: "rejected" }).eq("order_id", selectedOrder.id);

      toast.success("Pagamento rejeitado.");
      setSelectedOrder(null);
      loadOrders();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Erro ao rejeitar");
    } finally { setProcessing(false); }
  };

  return (
    <Card className="bg-card/80 border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
        <CardTitle>Pagamentos</CardTitle>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filtrar por status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending_payment">Aguardando Pagamento</SelectItem>
            <SelectItem value="payment_submitted">Comprovante Enviado</SelectItem>
            <SelectItem value="paid">Pagos</SelectItem>
            <SelectItem value="rejected">Rejeitados</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-foreground/50 py-8">Carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-foreground/50 py-8">Nenhum pedido encontrado.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Comprovante</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.id.slice(0, 8)}</TableCell>
                  <TableCell>{o.profile?.display_name || o.profile?.email || "—"}</TableCell>
                  <TableCell>R$ {Number(o.total_amount).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[o.status] || ""}>{statusLabels[o.status] || o.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {o.proofs && o.proofs.length > 0 ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400">
                        <CheckCircle2 className="w-3 h-3 mr-1" />Enviado
                      </Badge>
                    ) : (
                      <Badge className="bg-muted text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />Pendente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{new Date(o.created_at).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => openDetails(o)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-foreground/60">ID:</span> <span className="font-mono">{selectedOrder.id.slice(0, 12)}</span></div>
                <div><span className="text-foreground/60">Status:</span> <Badge className={statusColors[selectedOrder.status] || ""}>{statusLabels[selectedOrder.status] || selectedOrder.status}</Badge></div>
                <div><span className="text-foreground/60">Usuário:</span> {selectedOrder.profile?.display_name || selectedOrder.profile?.email}</div>
                <div><span className="text-foreground/60">Valor:</span> <span className="font-bold text-primary">R$ {Number(selectedOrder.total_amount).toFixed(2)}</span></div>
              </div>

              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <Label className="text-foreground/60 text-xs">Itens do pedido</Label>
                  <div className="mt-1 space-y-1">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm p-2 rounded bg-secondary/30">
                        <span>{item.product_name} x{item.quantity}</span>
                        <span>R$ {Number(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {proofUrl && (
                <div>
                  <Label className="text-foreground/60 text-xs">Comprovante</Label>
                  <div className="mt-1 rounded-lg overflow-hidden border border-primary/20">
                    <img src={proofUrl} alt="Comprovante" className="w-full max-h-64 object-contain bg-black/20" />
                  </div>
                  <a href={proofUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="mt-2">
                      <Download className="w-3 h-3 mr-1" /> Abrir em nova aba
                    </Button>
                  </a>
                </div>
              )}

              {(selectedOrder.status === "payment_submitted" || selectedOrder.status === "pending_payment") && (
                <>
                  <div>
                    <Label>Nota (opcional)</Label>
                    <Textarea value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="Observação sobre o pagamento..." rows={2} />
                  </div>
                  <DialogFooter className="flex gap-2">
                    <Button variant="outline" onClick={handleReject} disabled={processing} className="border-destructive/30 text-destructive hover:bg-destructive/10">
                      <X className="w-4 h-4 mr-1" /> Reprovar
                    </Button>
                    <Button onClick={handleApprove} disabled={processing} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Check className="w-4 h-4 mr-1" /> Aprovar Pagamento
                    </Button>
                  </DialogFooter>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
