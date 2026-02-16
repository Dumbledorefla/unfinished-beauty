import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "E-mail é obrigatório")
  .email("E-mail inválido")
  .max(255, "E-mail muito longo");

export const passwordSchema = z
  .string()
  .min(8, "Senha deve ter no mínimo 8 caracteres")
  .max(128, "Senha muito longa")
  .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
  .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
  .regex(/[0-9]/, "Senha deve conter pelo menos um número");

export const nameSchema = z
  .string()
  .min(2, "Nome deve ter no mínimo 2 caracteres")
  .max(100, "Nome muito longo")
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Nome contém caracteres inválidos");

export const whatsappSchema = z
  .string()
  .regex(/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/, "Formato: (11) 99999-9999")
  .or(z.string().length(0));

export const birthDateSchema = z
  .string()
  .min(1, "Data de nascimento é obrigatória")
  .refine((val) => {
    const date = new Date(val);
    const now = new Date();
    const age = now.getFullYear() - date.getFullYear();
    return age >= 13 && age <= 120;
  }, "Idade deve ser entre 13 e 120 anos");

export const pixKeySchema = z
  .string()
  .min(1, "Chave PIX é obrigatória")
  .max(100, "Chave PIX muito longa");

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: nameSchema,
  whatsapp: whatsappSchema.optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Senha é obrigatória"),
});

export const bookingSchema = z.object({
  date: z.date({ required_error: "Selecione uma data" }),
  time: z.string().min(1, "Selecione um horário"),
  consultationType: z.enum(["video", "chat", "phone"], {
    errorMap: () => ({ message: "Selecione o tipo de consulta" }),
  }),
  duration: z.number().min(15).max(120),
  topic: z.string().max(500, "Tópico muito longo").optional(),
});

export const reviewSchema = z.object({
  rating: z.number().min(1, "Selecione uma nota").max(5),
  comment: z
    .string()
    .min(10, "Comentário deve ter no mínimo 10 caracteres")
    .max(1000, "Comentário muito longo"),
});

export const couponSchema = z.object({
  code: z
    .string()
    .min(3, "Código deve ter no mínimo 3 caracteres")
    .max(20, "Código muito longo")
    .regex(/^[A-Z0-9_-]+$/, "Código deve conter apenas letras maiúsculas, números, - e _"),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().positive("Valor deve ser positivo"),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.string().optional(),
});

export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    if (!errors[path]) errors[path] = issue.message;
  });

  return { success: false, errors };
}

export function sanitize(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}
