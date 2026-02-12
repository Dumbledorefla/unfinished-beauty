import { supabase } from "@/integrations/supabase/client";

interface SendWhatsAppParams {
  type: "welcome" | "consultation_confirmed" | "consultation_reminder" | "payment_confirmed";
  phone: string;
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

export async function sendWhatsApp({ type, phone, data }: SendWhatsAppParams) {
  const { data: result, error } = await supabase.functions.invoke("send-whatsapp", {
    body: { type, phone, data },
  });

  if (error) {
    console.error("Erro ao enviar WhatsApp:", error);
    throw error;
  }

  return result;
}
