import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_readings_per_day: number;
  includes_consultations: boolean;
  includes_courses: boolean;
}

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  plan?: Plan;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
    if (user) loadSubscription();
    else setLoading(false);
  }, [user]);

  const loadPlans = async () => {
    const { data } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (data) setPlans(data.map((p: any) => ({ ...p, features: p.features || [] })));
  };

  const loadSubscription = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_subscriptions")
      .select("*, plan:subscription_plans(*)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();
    if (data) setSubscription(data as any);
    setLoading(false);
  };

  const isPremium = !!subscription && subscription.status === "active";
  const currentPlan = subscription?.plan || plans.find((p) => p.slug === "free") || null;

  const canAccessFeature = (feature: "readings" | "consultations" | "courses") => {
    if (!currentPlan) return feature === "readings";
    switch (feature) {
      case "readings": return currentPlan.max_readings_per_day === -1 || currentPlan.max_readings_per_day > 0;
      case "consultations": return currentPlan.includes_consultations;
      case "courses": return currentPlan.includes_courses;
      default: return false;
    }
  };

  const cancelSubscription = async () => {
    if (!subscription) return;
    await supabase
      .from("user_subscriptions")
      .update({ cancel_at_period_end: true })
      .eq("id", subscription.id);
    loadSubscription();
  };

  return {
    subscription, plans, loading, isPremium, currentPlan,
    canAccessFeature, cancelSubscription, refresh: loadSubscription,
  };
}
