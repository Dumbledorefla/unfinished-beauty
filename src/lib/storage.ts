import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export async function uploadProductImage(file: File): Promise<{ path: string; url: string }> {
  const ext = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const path = `products/${fileName}`;

  const { error } = await supabase.storage.from("product-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const url = `${SUPABASE_URL}/storage/v1/object/public/product-images/${path}`;
  return { path, url };
}

export async function deleteProductImage(path: string): Promise<void> {
  const { error } = await supabase.storage.from("product-images").remove([path]);
  if (error) throw error;
}

export async function uploadPaymentProof(file: File, userId: string, orderId: string): Promise<string> {
  const ext = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const path = `${userId}/${orderId}/${fileName}`;

  const { error } = await supabase.storage.from("payment-proofs").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export function getPaymentProofUrl(path: string): string {
  const { data } = supabase.storage.from("payment-proofs").getPublicUrl(path);
  return data.publicUrl;
}

export async function getPaymentProofSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from("payment-proofs").createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}
