export interface TarotCard {
  id: number;
  name: string;
  arcana: 'major' | 'minor';
  image: string;
  upright: boolean;
  keywords: string[];
}

export const majorArcana: Omit<TarotCard, 'upright'>[] = [
  { id: 0, name: "O Louco", arcana: "major", image: "🃏", keywords: ["liberdade", "aventura", "novos começos"] },
  { id: 1, name: "O Mago", arcana: "major", image: "🎩", keywords: ["poder", "habilidade", "manifestação"] },
  { id: 2, name: "A Sacerdotisa", arcana: "major", image: "🌙", keywords: ["intuição", "mistério", "sabedoria"] },
  { id: 3, name: "A Imperatriz", arcana: "major", image: "👑", keywords: ["fertilidade", "abundância", "natureza"] },
  { id: 4, name: "O Imperador", arcana: "major", image: "🏛️", keywords: ["autoridade", "estrutura", "estabilidade"] },
  { id: 5, name: "O Hierofante", arcana: "major", image: "📿", keywords: ["tradição", "espiritualidade", "orientação"] },
  { id: 6, name: "Os Amantes", arcana: "major", image: "💕", keywords: ["amor", "escolhas", "união"] },
  { id: 7, name: "O Carro", arcana: "major", image: "🏆", keywords: ["determinação", "vitória", "controle"] },
  { id: 8, name: "A Força", arcana: "major", image: "🦁", keywords: ["coragem", "paciência", "compaixão"] },
  { id: 9, name: "O Eremita", arcana: "major", image: "🏔️", keywords: ["introspecção", "sabedoria", "solidão"] },
  { id: 10, name: "A Roda da Fortuna", arcana: "major", image: "🎡", keywords: ["destino", "ciclos", "sorte"] },
  { id: 11, name: "A Justiça", arcana: "major", image: "⚖️", keywords: ["equilíbrio", "verdade", "consequências"] },
  { id: 12, name: "O Enforcado", arcana: "major", image: "🔄", keywords: ["sacrifício", "perspectiva", "rendição"] },
  { id: 13, name: "A Morte", arcana: "major", image: "🦋", keywords: ["transformação", "fim", "renovação"] },
  { id: 14, name: "A Temperança", arcana: "major", image: "🌊", keywords: ["equilíbrio", "paciência", "moderação"] },
  { id: 15, name: "O Diabo", arcana: "major", image: "⛓️", keywords: ["tentação", "vícios", "materialismo"] },
  { id: 16, name: "A Torre", arcana: "major", image: "⚡", keywords: ["mudança súbita", "revelação", "libertação"] },
  { id: 17, name: "A Estrela", arcana: "major", image: "⭐", keywords: ["esperança", "inspiração", "renovação"] },
  { id: 18, name: "A Lua", arcana: "major", image: "🌕", keywords: ["ilusão", "intuição", "inconsciente"] },
  { id: 19, name: "O Sol", arcana: "major", image: "☀️", keywords: ["sucesso", "alegria", "vitalidade"] },
  { id: 20, name: "O Julgamento", arcana: "major", image: "📯", keywords: ["renascimento", "chamado", "absolvição"] },
  { id: 21, name: "O Mundo", arcana: "major", image: "🌍", keywords: ["realização", "completude", "integração"] },
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
