import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminSettings from "@/components/admin/AdminSettings";

export default function AdminConfigPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    const { data } = await supabase.from("site_settings").select("*");
    setSettings(data || []);
    setLoading(false);
  };

  useEffect(() => { loadSettings(); }, []);

  if (loading) return <p className="text-center text-muted-foreground py-8">Carregando...</p>;
  return <AdminSettings settings={settings} onRefresh={loadSettings} />;
}
