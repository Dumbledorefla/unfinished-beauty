import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminProducts from "@/components/admin/AdminProducts";

export default function AdminProdutosPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    const { data } = await supabase.from("products").select("*");
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { loadProducts(); }, []);

  if (loading) return <p className="text-center text-muted-foreground py-8">Carregando...</p>;
  return <AdminProducts products={products} onRefresh={loadProducts} />;
}
