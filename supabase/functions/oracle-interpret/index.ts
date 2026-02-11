const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();
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
      userPrompt = `Consulente: ${data.userName || 'Anônimo'}, nascido em ${data.birthDate || 'data não informada'}.
Carta sorteada: ${data.card.name} (${data.card.upright ? 'posição normal' : 'invertida'}).
Faça uma interpretação completa e detalhada desta carta para o dia de hoje.`;
    } else if (type === 'tarot-amor') {
      systemPrompt = `Você é uma taromante especialista em questões amorosas. Interprete as 3 cartas de tarot sorteadas para o consulente.
Use linguagem mística, poética e acolhedora em português do Brasil.
As 3 cartas representam: Passado, Presente e Futuro do amor.`;
      userPrompt = `Consulente: ${data.userName || 'Anônimo'}, nascido em ${data.birthDate || 'data não informada'}.
Cartas sorteadas:
- Passado: ${data.cards[0].name} (${data.cards[0].upright ? 'normal' : 'invertida'})
- Presente: ${data.cards[1].name} (${data.cards[1].upright ? 'normal' : 'invertida'})
- Futuro: ${data.cards[2].name} (${data.cards[2].upright ? 'normal' : 'invertida'})
Faça uma interpretação profunda sobre a vida amorosa.`;
    } else if (type === 'tarot-completo') {
      systemPrompt = `Você é uma taromante experiente fazendo uma leitura completa de Cruz Celta. Interprete as 6 cartas de tarot sorteadas.
Use linguagem mística, poética e profunda em português do Brasil.
As posições são: 1-Situação Atual, 2-Desafio, 3-Base, 4-Passado Recente, 5-Melhor Resultado Possível, 6-Futuro Próximo.`;
      userPrompt = `Consulente: ${data.userName || 'Anônimo'}, nascido em ${data.birthDate || 'data não informada'}.
Cartas:
${data.cards.map((c: any, i: number) => `- Posição ${i + 1}: ${c.name} (${c.upright ? 'normal' : 'invertida'})`).join('\n')}
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
      userPrompt = `Consulente: ${data.userName || 'Anônimo'}, nascido em ${data.birthDate}.
Signo: ${data.sign}.
Faça o horóscopo detalhado para hoje.`;
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
    console.error('Error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Failed to interpret' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
