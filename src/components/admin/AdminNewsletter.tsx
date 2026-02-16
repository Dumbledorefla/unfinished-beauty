import { useEffect, useState } from "react";
import { Download, Mail, Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  source: string;
  is_active: boolean;
  subscribed_at: string;
}

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0 });

  useEffect(() => { loadSubscribers(); }, []);

  const loadSubscribers = async () => {
    const { data, count } = await supabase
      .from("newsletter_subscribers")
      .select("*", { count: "exact" })
      .order("subscribed_at", { ascending: false });
    if (data) {
      setSubscribers(data as any);
      setStats({
        total: count || data.length,
        active: data.filter((s: any) => s.is_active).length,
      });
    }
  };

  const removeSubscriber = async (id: string) => {
    await supabase.from("newsletter_subscribers").update({ is_active: false }).eq("id", id);
    loadSubscribers();
    toast({ title: "Inscrição desativada" });
  };

  const exportCSV = () => {
    const active = subscribers.filter((s) => s.is_active);
    const csv = "Nome,Email,Fonte,Data\n" + active.map((s) =>
      `"${s.name || ""}","${s.email}","${s.source}","${new Date(s.subscribed_at).toLocaleDateString("pt-BR")}"`
    ).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter_subscribers.csv";
    a.click();
    toast({ title: "CSV exportado!" });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-slate-900 border border-slate-800 rounded-xl">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-100">{stats.total}</p>
            <p className="text-xs text-slate-400">Total de inscritos</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border border-slate-800 rounded-xl">
          <CardContent className="p-4 text-center">
            <Mail className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-100">{stats.active}</p>
            <p className="text-xs text-slate-400">Ativos</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={exportCSV} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      <div className="space-y-2">
        {subscribers.map((sub) => (
          <Card key={sub.id} className={`bg-slate-900 border border-slate-800 rounded-xl ${!sub.is_active ? "opacity-50" : ""}`}>
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground text-sm">{sub.email}</p>
                <p className="text-xs text-muted-foreground">
                  {sub.name || "Sem nome"} • {sub.source} • {new Date(sub.subscribed_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
              {sub.is_active && (
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeSubscriber(sub.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
