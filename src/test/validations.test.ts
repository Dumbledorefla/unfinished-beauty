import { describe, it, expect } from "vitest";
import { validateForm, loginSchema, signupSchema, sanitize, emailSchema, passwordSchema, birthDateSchema } from "@/lib/validations";

describe("emailSchema", () => {
  it("aceita email válido", () => {
    expect(emailSchema.safeParse("user@example.com").success).toBe(true);
  });
  it("rejeita email vazio", () => {
    expect(emailSchema.safeParse("").success).toBe(false);
  });
  it("rejeita email sem @", () => {
    expect(emailSchema.safeParse("userexample.com").success).toBe(false);
  });
  it("rejeita email muito longo", () => {
    const longEmail = "a".repeat(250) + "@test.com";
    expect(emailSchema.safeParse(longEmail).success).toBe(false);
  });
});

describe("passwordSchema", () => {
  it("aceita senha forte", () => {
    expect(passwordSchema.safeParse("MinhaSenh4").success).toBe(true);
  });
  it("rejeita senha curta", () => {
    expect(passwordSchema.safeParse("Ab1").success).toBe(false);
  });
  it("rejeita senha sem maiúscula", () => {
    expect(passwordSchema.safeParse("minhasenha1").success).toBe(false);
  });
  it("rejeita senha sem número", () => {
    expect(passwordSchema.safeParse("MinhaSenha").success).toBe(false);
  });
  it("rejeita senha sem minúscula", () => {
    expect(passwordSchema.safeParse("MINHASENHA1").success).toBe(false);
  });
});

describe("birthDateSchema", () => {
  it("aceita data válida (adulto)", () => {
    expect(birthDateSchema.safeParse("1990-05-15").success).toBe(true);
  });
  it("rejeita data muito recente (criança)", () => {
    const recentDate = new Date();
    recentDate.setFullYear(recentDate.getFullYear() - 5);
    expect(birthDateSchema.safeParse(recentDate.toISOString().split("T")[0]).success).toBe(false);
  });
  it("rejeita data vazia", () => {
    expect(birthDateSchema.safeParse("").success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("valida login correto", () => {
    const result = validateForm(loginSchema, { email: "user@test.com", password: "123456" });
    expect(result.success).toBe(true);
  });
  it("rejeita email inválido", () => {
    const result = validateForm(loginSchema, { email: "invalid", password: "123456" });
    expect(result.success).toBe(false);
    expect(result.errors?.email).toBeDefined();
  });
  it("rejeita senha vazia", () => {
    const result = validateForm(loginSchema, { email: "user@test.com", password: "" });
    expect(result.success).toBe(false);
    expect(result.errors?.password).toBeDefined();
  });
});

describe("signupSchema", () => {
  it("valida cadastro correto", () => {
    const result = validateForm(signupSchema, { email: "user@test.com", password: "MinhaSenh4", fullName: "João Silva" });
    expect(result.success).toBe(true);
  });
  it("rejeita nome com caracteres especiais", () => {
    const result = validateForm(signupSchema, { email: "user@test.com", password: "MinhaSenh4", fullName: "João <script>alert(1)</script>" });
    expect(result.success).toBe(false);
  });
  it("rejeita nome muito curto", () => {
    const result = validateForm(signupSchema, { email: "user@test.com", password: "MinhaSenh4", fullName: "A" });
    expect(result.success).toBe(false);
  });
});

describe("sanitize", () => {
  it("escapa tags HTML", () => {
    expect(sanitize("<script>alert(1)</script>")).not.toContain("<script>");
  });
  it("escapa aspas", () => {
    expect(sanitize('test"value')).toBe("test&quot;value");
  });
  it("mantém texto normal", () => {
    expect(sanitize("Olá mundo")).toBe("Olá mundo");
  });
  it("escapa caracteres perigosos", () => {
    const input = '<img onerror="alert(1)" src=x>';
    const result = sanitize(input);
    expect(result).not.toContain("<img");
  });
});
