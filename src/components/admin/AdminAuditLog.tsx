import { useState, useEffect } from "react";
import { Shield, Search, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface AuditEntry {
  id: string;
  admin_user_id: string;
  admin_name: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: any;
  created_at: string;
}

const actionLabels: Record<string, string> = {
  approve_payment: "Aprovou pagamento",
  reject_payment: "Rejeitou pagamento",
  update_product: "Atualizou produto",
  create_product: "Criou produto",
  delete_product: "Excluiu produto",
  update_user: "Atualizou usuário",
  block_user: "Bloqueou usuário",
  update_setting: "Alterou configuração",
  create_coupon: "Criou cupom",
  update_coupon: "Atualizou cupom",
  delete_coupon: "Excluiu cupom",
  update_taromante: "Atualizou taromante",
  update_course: "Atualizou curso",
  update_consultation: "Atualizou consulta",
};

const entityLabels: Record<string, string> = {
  user: "Usuário",
  product: "Produto",
  order: "Pedido",
  consultation: "Consulta",
  taromante: "Taromante",
  course: "Curso",
  setting: "Configuração",
  coupon: "Cupom",
  payment: "Pagamento",
};

export default function AdminAuditLog() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("admin_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    setLogs((data as AuditEntry[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const filtered = logs.filter((log) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (log.admin_name || "").toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.entity_type.toLowerCase().includes(q) ||
      (log.entity_id || "").toLowerCase().includes(q)
    );
  });

  return (
    <Card className="bg-slate-900 border border-slate-800 rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-slate-200">
          <Shield className="w-5 h-5" /> Log de Auditoria
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="pl-9 w-48"
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchLogs}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-slate-400 text-center py-8">
            {search ? "Nenhum resultado encontrado." : "Nenhuma ação registrada ainda."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs text-foreground/60 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.admin_name || "Admin"}
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs">
                        {actionLabels[log.action] || log.action}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-foreground/70">
                      {entityLabels[log.entity_type] || log.entity_type}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-foreground/50">
                      {log.entity_id?.slice(0, 8) || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-foreground/50 max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details).slice(0, 80) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
