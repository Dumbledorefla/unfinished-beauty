import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  confirmed: "bg-emerald-500/20 text-emerald-400",
  completed: "bg-blue-500/20 text-blue-400",
  cancelled: "bg-destructive/20 text-destructive",
};

export default function AdminConsultations({ consultations }: { consultations: any[] }) {
  return (
    <Card className="bg-slate-900 border border-slate-800 rounded-xl">
      <CardHeader><CardTitle className="text-slate-200">Consultas ({consultations.length})</CardTitle></CardHeader>
      <CardContent>
        {consultations.length === 0 ? <p className="text-slate-400 text-center py-8">Nenhuma consulta ainda.</p> : (
          <Table>
            <TableHeader>
              <TableRow><TableHead>Tipo</TableHead><TableHead>Status</TableHead><TableHead>Preço</TableHead><TableHead>Data</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {consultations.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.consultation_type}</TableCell>
                  <TableCell><Badge className={statusColors[c.status] || ""}>{c.status}</Badge></TableCell>
                  <TableCell>R$ {Number(c.price).toFixed(2)}</TableCell>
                  <TableCell>{new Date(c.scheduled_at).toLocaleDateString("pt-BR")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
