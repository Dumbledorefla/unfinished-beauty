export interface TarotCard {
  id: number;
  name: string;
  arcana: 'major' | 'minor';
  image: string;
  upright: boolean;
  keywords: string[];
}

export const majorArcana: Omit<TarotCard, 'upright'>[] = [
  { id: 0, name: "O Louco", arcana: "major", image: "/tarot-cards/00-o-louco.jpg", keywords: ["liberdade", "aventura", "novos começos"] },
  { id: 1, name: "O Mago", arcana: "major", image: "/tarot-cards/01-o-mago.jpg", keywords: ["poder", "habilidade", "manifestação"] },
  { id: 2, name: "A Sacerdotisa", arcana: "major", image: "/tarot-cards/02-a-sacerdotisa.jpg", keywords: ["intuição", "mistério", "sabedoria"] },
  { id: 3, name: "A Imperatriz", arcana: "major", image: "/tarot-cards/03-a-imperatriz.jpg", keywords: ["fertilidade", "abundância", "natureza"] },
  { id: 4, name: "O Imperador", arcana: "major", image: "/tarot-cards/04-o-imperador.jpg", keywords: ["autoridade", "estrutura", "estabilidade"] },
  { id: 5, name: "O Hierofante", arcana: "major", image: "/tarot-cards/05-o-hierofante.jpg", keywords: ["tradição", "espiritualidade", "orientação"] },
  { id: 6, name: "Os Amantes", arcana: "major", image: "/tarot-cards/06-os-amantes.jpg", keywords: ["amor", "escolhas", "união"] },
  { id: 7, name: "O Carro", arcana: "major", image: "/tarot-cards/07-o-carro.jpg", keywords: ["determinação", "vitória", "controle"] },
  { id: 8, name: "A Força", arcana: "major", image: "/tarot-cards/08-a-forca.jpg", keywords: ["coragem", "paciência", "compaixão"] },
  { id: 9, name: "O Eremita", arcana: "major", image: "/tarot-cards/09-o-eremita.jpg", keywords: ["introspecção", "sabedoria", "solidão"] },
  { id: 10, name: "A Roda da Fortuna", arcana: "major", image: "/tarot-cards/10-a-roda-da-fortuna.jpg", keywords: ["destino", "ciclos", "sorte"] },
  { id: 11, name: "A Justiça", arcana: "major", image: "/tarot-cards/11-a-justica.jpg", keywords: ["equilíbrio", "verdade", "consequências"] },
  { id: 12, name: "O Enforcado", arcana: "major", image: "/tarot-cards/12-o-enforcado.jpg", keywords: ["sacrifício", "perspectiva", "rendição"] },
  { id: 13, name: "A Morte", arcana: "major", image: "/tarot-cards/13-a-morte.jpg", keywords: ["transformação", "fim", "renovação"] },
  { id: 14, name: "A Temperança", arcana: "major", image: "/tarot-cards/14-a-temperanca.jpg", keywords: ["equilíbrio", "paciência", "moderação"] },
  { id: 15, name: "O Diabo", arcana: "major", image: "/tarot-cards/15-o-diabo.jpg", keywords: ["tentação", "vícios", "materialismo"] },
  { id: 16, name: "A Torre", arcana: "major", image: "/tarot-cards/16-a-torre.jpg", keywords: ["mudança súbita", "revelação", "libertação"] },
  { id: 17, name: "A Estrela", arcana: "major", image: "/tarot-cards/17-a-estrela.jpg", keywords: ["esperança", "inspiração", "renovação"] },
  { id: 18, name: "A Lua", arcana: "major", image: "/tarot-cards/18-a-lua.jpg", keywords: ["ilusão", "intuição", "inconsciente"] },
  { id: 19, name: "O Sol", arcana: "major", image: "/tarot-cards/19-o-sol.jpg", keywords: ["sucesso", "alegria", "vitalidade"] },
  { id: 20, name: "O Julgamento", arcana: "major", image: "/tarot-cards/20-o-julgamento.jpg", keywords: ["renascimento", "chamado", "absolvição"] },
  { id: 21, name: "O Mundo", arcana: "major", image: "/tarot-cards/21-o-mundo.jpg", keywords: ["realização", "completude", "integração"] },
];

export function drawCards(count: number): TarotCard[] {
  const shuffled = [...majorArcana].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((card) => ({
    ...card,
    upright: Math.random() > 0.3,
  }));
}

export function getZodiacSign(birthDate: string): string {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Áries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Touro";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gêmeos";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Câncer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leão";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgem";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Escorpião";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagitário";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricórnio";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquário";
  return "Peixes";
}

export const zodiacEmojis: Record<string, string> = {
  "Áries": "♈", "Touro": "♉", "Gêmeos": "♊", "Câncer": "♋",
  "Leão": "♌", "Virgem": "♍", "Libra": "♎", "Escorpião": "♏",
  "Sagitário": "♐", "Capricórnio": "♑", "Aquário": "♒", "Peixes": "♓",
};
