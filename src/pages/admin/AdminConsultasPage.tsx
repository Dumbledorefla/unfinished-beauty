import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminConsultations from "@/components/admin/AdminConsultations";

export default function AdminConsultasPage() {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("consultations").select("*").order("created_at", { ascending: false });
      setConsultations(data || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <p className="text-center text-muted-foreground py-8">Carregando...</p>;
  return <AdminConsultations consultations={consultations} />;
}
