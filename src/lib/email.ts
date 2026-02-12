import { supabase } from "@/integrations/supabase/client";

interface SendEmailParams {
  type: "welcome" | "consultation_confirmed" | "consultation_reminder" | "payment_confirmed";
  to: string;
  data?: {
    userName?: string;
    consultationDate?: string;
    consultationType?: string;
    taromanteName?: string;
    amount?: string;
    orderId?: string;
    hoursUntil?: number;
  };
}

export async function sendEmail({ type, to, data }: SendEmailParams) {
  const { data: result, error } = await supabase.functions.invoke("send-email", {
    body: { type, to, data },
  });

  if (error) {
    console.error("Erro ao enviar e-mail:", error);
    throw error;
  }

  return result;
}
