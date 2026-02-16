import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminCourses from "@/components/admin/AdminCourses";

export default function AdminCursosPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCourses = async () => {
    const { data } = await supabase.from("courses").select("*");
    setCourses(data || []);
    setLoading(false);
  };

  useEffect(() => { loadCourses(); }, []);

  if (loading) return <p className="text-center text-muted-foreground py-8">Carregando...</p>;
  return <AdminCourses courses={courses} onRefresh={loadCourses} />;
}
