import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://esm.sh/zod@3.23.8';
import { checkRateLimit, rateLimitResponse, getClientIP } from '../_shared/rate-limit.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const cardSchema = z.object({
  name: z.string().max(100),
  upright: z.boolean(),
});

const requestSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('tarot-dia'),
    data: z.object({
      userName: z.string().max(100).optional().default('Anônimo'),
      birthDate: z.string().max(20).optional().default('data não informada'),
      card: cardSchema,
    }),
  }),
  z.object({
    type: z.literal('tarot-amor'),
    data: z.object({
      userName: z.string().max(100).optional().default('Anônimo'),
      birthDate: z.string().max(20).optional().default('data não informada'),
      cards: z.array(cardSchema).length(3),
    }),
  }),
  z.object({
    type: z.literal('tarot-completo'),
    data: z.object({
      userName: z.string().max(100).optional().default('Anônimo'),
      birthDate: z.string().max(20).optional().default('data não informada'),
      cards: z.array(cardSchema).length(6),
    }),
  }),
  z.object({
    type: z.literal('numerologia'),
    data: z.object({
      userName: z.string().max(100),
      birthDate: z.string().max(20),
    }),
  }),
  z.object({
    type: z.literal('horoscopo'),
    data: z.object({
      userName: z.string().max(100).optional().default('Anônimo'),
      birthDate: z.string().max(20),
      sign: z.string().max(30),
    }),
  }),
  z.object({
    type: z.literal('mapa-astral'),
    data: z.object({
      userName: z.string().max(100),
      birthDate: z.string().max(20),
      birthTime: z.string().max(10),
      birthPlace: z.string().max(200),
    }),
  }),
]);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting: 5 requests per minute per IP
    const clientIP = getClientIP(req);
    const allowed = await checkRateLimit({ key: `oracle-interpret:${clientIP}`, limit: 5, windowSeconds: 60 });
    if (!allowed) return rateLimitResponse();

    // Authenticate the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate input
    const body = await req.json();
    const parseResult = requestSchema.safeParse(body);
    if (!parseResult.success) {
      return new Response(JSON.stringify({ error: 'Invalid input', details: parseResult.error.flatten() }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { type, data } = parseResult.data;

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'tarot-dia') {
      systemPrompt = `Você é uma taromante mística experiente. Interprete a carta de tarot sorteada para o consulente. 
Use linguagem mística, poética e acolhedora em português do Brasil. 
Estruture a resposta com: Significado Geral, Amor, Trabalho, Saúde e Conselho do Dia.
Personalize usando o nome e data de nascimento quando fornecidos.`;
      userPrompt = `Consulente: ${data.userName}, nascido em ${data.birthDate}.
Carta sorteada: ${data.card.name} (${data.card.upright ? 'posição normal' : 'invertida'}).
Faça uma interpretação completa e detalhada desta carta para o dia de hoje.`;
    } else if (type === 'tarot-amor') {
      systemPrompt = `Você é uma taromante especialista em questões amorosas. Interprete as 3 cartas de tarot sorteadas para o consulente.
Use linguagem mística, poética e acolhedora em português do Brasil.
As 3 cartas representam: Passado, Presente e Futuro do amor.`;
      userPrompt = `Consulente: ${data.userName}, nascido em ${data.birthDate}.
Cartas sorteadas:
- Passado: ${data.cards[0].name} (${data.cards[0].upright ? 'normal' : 'invertida'})
- Presente: ${data.cards[1].name} (${data.cards[1].upright ? 'normal' : 'invertida'})
- Futuro: ${data.cards[2].name} (${data.cards[2].upright ? 'normal' : 'invertida'})
Faça uma interpretação profunda sobre a vida amorosa.`;
    } else if (type === 'tarot-completo') {
      systemPrompt = `Você é uma taromante experiente fazendo uma leitura completa de Cruz Celta. Interprete as 6 cartas de tarot sorteadas.
Use linguagem mística, poética e profunda em português do Brasil.
As posições são: 1-Situação Atual, 2-Desafio, 3-Base, 4-Passado Recente, 5-Melhor Resultado Possível, 6-Futuro Próximo.`;
      userPrompt = `Consulente: ${data.userName}, nascido em ${data.birthDate}.
Cartas:
${data.cards.map((c, i) => `- Posição ${i + 1}: ${c.name} (${c.upright ? 'normal' : 'invertida'})`).join('\n')}
Faça uma leitura profunda e completa.`;
    } else if (type === 'numerologia') {
      systemPrompt = `Você é um numerólogo experiente. Calcule e interprete o mapa numerológico completo do consulente.
Use linguagem mística e esclarecedora em português do Brasil.
Inclua: Número do Destino, Número da Alma, Número da Personalidade, Número da Expressão e Ano Pessoal.`;
      userPrompt = `Nome completo: ${data.userName}. Data de nascimento: ${data.birthDate}.
Calcule todos os números e faça uma interpretação completa e personalizada.`;
    } else if (type === 'horoscopo') {
      systemPrompt = `Você é um astrólogo experiente. Faça o horóscopo do dia para o signo do consulente.
Use linguagem mística e acolhedora em português do Brasil.
Inclua previsões para: Amor, Trabalho, Saúde e Dica do Dia.
Data de hoje: ${new Date().toLocaleDateString('pt-BR')}.`;
      userPrompt = `Consulente: ${data.userName}, nascido em ${data.birthDate}.
Signo: ${data.sign}.
Faça o horóscopo detalhado para hoje.`;
    } else if (type === 'mapa-astral') {
      systemPrompt = `Você é um astrólogo profissional e experiente. Calcule e interprete o mapa astral completo do consulente com base nos dados de nascimento fornecidos.
Use linguagem mística, profunda e esclarecedora em português do Brasil.
Estruture a resposta com as seguintes seções:
1. **Signo Solar** - Personalidade e essência
2. **Ascendente** (calcule com base na hora e local) - Como se apresenta ao mundo
3. **Lua** - Emoções e mundo interior
4. **Mercúrio** - Comunicação e intelecto
5. **Vênus** - Amor e relacionamentos
6. **Marte** - Energia, ação e paixão
7. **Júpiter** - Expansão e sorte
8. **Saturno** - Lições e responsabilidades
9. **Síntese Geral** - Visão integrada do mapa
Seja detalhado e personalizado. Considere as posições planetárias aproximadas para a data, hora e local fornecidos.`;
      userPrompt = `Nome: ${data.userName}
Data de nascimento: ${data.birthDate}
Hora de nascimento: ${data.birthTime}
Local de nascimento: ${data.birthPlace}
Faça o mapa astral completo e detalhado.`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 2000,
        temperature: 0.8,
      }),
    });

    const result = await response.json();
    const interpretation = result.choices?.[0]?.message?.content || 'Não foi possível gerar a interpretação.';

    return new Response(JSON.stringify({ success: true, interpretation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: 'Failed to interpret' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
