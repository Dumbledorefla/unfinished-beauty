import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminTaromantes from "@/components/admin/AdminTaromantes";

export default function AdminTaromantesPage() {
  const [taromantes, setTaromantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTaromantes = async () => {
    const { data } = await supabase.from("taromantes").select("*");
    setTaromantes(data || []);
    setLoading(false);
  };

  useEffect(() => { loadTaromantes(); }, []);

  if (loading) return <p className="text-center text-muted-foreground py-8">Carregando...</p>;
  return <AdminTaromantes taromantes={taromantes} onRefresh={loadTaromantes} />;
}
