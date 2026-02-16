import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminUsers from "@/components/admin/AdminUsers";

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    const { data } = await supabase.from("profiles").select("*");
    setUsers(data || []);
    setLoading(false);
  };

  if (loading) return <p className="text-center text-muted-foreground py-8">Carregando...</p>;
  return <AdminUsers users={users} />;
}
