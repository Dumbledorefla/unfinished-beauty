import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  paid: "bg-emerald-500/20 text-emerald-400",
  completed: "bg-blue-500/20 text-blue-400",
  cancelled: "bg-destructive/20 text-destructive",
};

export default function AdminOrders({ orders }: { orders: any[] }) {
  return (
    <Card className="bg-slate-900 border border-slate-800 rounded-xl">
      <CardHeader><CardTitle className="text-slate-200">Pedidos ({orders.length})</CardTitle></CardHeader>
      <CardContent>
        {orders.length === 0 ? <p className="text-slate-400 text-center py-8">Nenhum pedido ainda.</p> : (
          <Table>
            <TableHeader>
              <TableRow><TableHead>ID</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Data</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.id.slice(0, 8)}</TableCell>
                  <TableCell>R$ {Number(o.total_amount).toFixed(2)}</TableCell>
                  <TableCell><Badge className={statusColors[o.status] || ""}>{o.status}</Badge></TableCell>
                  <TableCell>{new Date(o.created_at).toLocaleDateString("pt-BR")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
