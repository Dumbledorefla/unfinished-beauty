import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminOrders from "@/components/admin/AdminOrders";

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <p className="text-center text-muted-foreground py-8">Carregando...</p>;
  return <AdminOrders orders={orders} />;
}
