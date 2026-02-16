import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminCoupons from "@/components/admin/AdminCoupons";

export default function AdminCuponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCoupons = async () => {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons(data || []);
    setLoading(false);
  };

  useEffect(() => { loadCoupons(); }, []);

  if (loading) return <p className="text-center text-muted-foreground py-8">Carregando...</p>;
  return <AdminCoupons coupons={coupons} onRefresh={loadCoupons} />;
}
