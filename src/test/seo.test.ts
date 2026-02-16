import { describe, it, expect } from "vitest";

describe("SEO Utilities", () => {
  const SITE_NAME = "Chave do Oráculo";
  const BASE_URL = "https://chavedooraculo.com.br";

  const buildFullTitle = (title: string) => `${title} | ${SITE_NAME}`;
  const buildCanonical = (path: string) => `${BASE_URL}${path}`;

  it("gera título completo corretamente", () => {
    expect(buildFullTitle("Tarot do Dia")).toBe("Tarot do Dia | Chave do Oráculo");
  });

  it("gera URL canônica corretamente", () => {
    expect(buildCanonical("/tarot/dia")).toBe("https://chavedooraculo.com.br/tarot/dia");
  });

  it("gera URL canônica para home", () => {
    expect(buildCanonical("/")).toBe("https://chavedooraculo.com.br/");
  });

  it("título não deve exceder 70 caracteres", () => {
    const titles = ["Tarot do Dia", "Tarot e o Amor", "Numerologia", "Horóscopo", "Mapa Astral", "Consultas"];
    titles.forEach((title) => {
      expect(buildFullTitle(title).length).toBeLessThanOrEqual(70);
    });
  });
});
