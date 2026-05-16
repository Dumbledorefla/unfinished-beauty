import { useEffect } from "react";

export default function PoliticaPrivacidade() {
  useEffect(() => {
    document.title = "Política de Privacidade — Oráculo Místico";
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.name = name;
        document.head.appendChild(el);
      }
      el.content = content;
    };
    setMeta("description", "Política de Privacidade do Oráculo Místico — como tratamos seus dados pessoais conforme a LGPD.");
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = "https://chavedooraculo.com/politica-de-privacidade";
  }, []);

  return (
    <main style={{ background: "#fdfcf8", color: "#1a1a1a", minHeight: "100vh" }}>
      <article
        style={{
          maxWidth: "780px",
          margin: "0 auto",
          padding: "48px 24px",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "17px",
          lineHeight: 1.7,
        }}
      >
        <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>Política de Privacidade — Oráculo Místico</h1>
        <p style={{ color: "#555", marginBottom: "32px" }}>Última atualização: maio de 2026</p>

        <h2>1. Identificação do Responsável</h2>
        <p>
          Esta Política de Privacidade é aplicável aos serviços prestados pelo Oráculo Místico, negócio de consultoria
          espiritual personalizada, com atendimento realizado por meio de plataforma digital.
        </p>
        <p>Contato: contato@chavedooraculo.com</p>

        <h2>2. Dados Pessoais Coletados</h2>
        <p>Ao utilizar nossos serviços, podemos coletar as seguintes informações:</p>
        <p>a) Número de telefone e nome de perfil fornecidos no momento do contato;</p>
        <p>b) Conteúdo das mensagens trocadas durante o atendimento;</p>
        <p>c) Informações de pagamento, limitadas ao comprovante de transação via PIX;</p>
        <p>d) Data e horário dos atendimentos realizados.</p>
        <p>
          Não coletamos dados de cartão de crédito, senhas, documentos de identidade ou qualquer dado sensível além dos
          listados acima.
        </p>

        <h2>3. Finalidade do Tratamento dos Dados</h2>
        <p>Os dados coletados são utilizados exclusivamente para:</p>
        <p>a) Prestação dos serviços de consultoria espiritual contratados;</p>
        <p>b) Comunicação relacionada ao atendimento em andamento;</p>
        <p>c) Confirmação e registro de pagamentos;</p>
        <p>d) Melhoria contínua da qualidade do atendimento.</p>
        <p>
          Os dados não são utilizados para fins publicitários, não são vendidos a terceiros e não são compartilhados com
          outras empresas para fins comerciais.
        </p>

        <h2>4. Compartilhamento de Dados com Terceiros</h2>
        <p>
          Para a operação dos nossos serviços, utilizamos os seguintes fornecedores de tecnologia, que podem ter acesso
          aos dados estritamente necessários para a prestação de seus serviços:
        </p>
        <p>a) Supabase (supabase.com) — armazenamento seguro de dados;</p>
        <p>b) OpenAI (openai.com) — processamento de linguagem para suporte ao atendimento;</p>
        <p>c) Meta Platforms (meta.com) — plataforma de comunicação via WhatsApp.</p>
        <p>
          Todos os fornecedores listados possuem políticas de privacidade próprias e estão sujeitos às suas respectivas
          regulamentações de proteção de dados.
        </p>

        <h2>5. Armazenamento e Segurança dos Dados</h2>
        <p>
          Os dados são armazenados em servidores seguros com criptografia em trânsito e em repouso. Adotamos medidas
          técnicas e organizacionais adequadas para proteger as informações contra acesso não autorizado, perda ou
          destruição.
        </p>
        <p>
          O período de retenção dos dados é de até 12 meses após o último atendimento, salvo obrigação legal que exija
          prazo diferente.
        </p>

        <h2>6. Direitos do Titular dos Dados</h2>
        <p>Nos termos da Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018), você tem direito a:</p>
        <p>a) Confirmar a existência de tratamento dos seus dados;</p>
        <p>b) Acessar os dados que temos sobre você;</p>
        <p>c) Corrigir dados incompletos, inexatos ou desatualizados;</p>
        <p>d) Solicitar a exclusão dos seus dados pessoais;</p>
        <p>e) Revogar o consentimento a qualquer momento.</p>
        <p>
          Para exercer qualquer desses direitos, entre em contato pelo e-mail contato@chavedooraculo.com com o assunto
          "Direitos LGPD".
        </p>

        <h2>7. Exclusão de Dados</h2>
        <p>
          Para solicitar a exclusão dos seus dados pessoais, acesse nossa página de Exclusão de Dados em:{" "}
          <a href="https://chavedooraculo.com/exclusao-de-dados" style={{ color: "#1a1a1a", textDecoration: "underline" }}>
            https://chavedooraculo.com/exclusao-de-dados
          </a>
        </p>
        <p>
          Ou envie um e-mail para contato@chavedooraculo.com com o assunto "Solicitação de Exclusão de Dados". A
          exclusão será concluída em até 30 dias.
        </p>

        <h2>8. Opt-out de Comunicações</h2>
        <p>
          Para deixar de receber mensagens de atendimento, envie a palavra PARAR a qualquer momento pelo canal de
          comunicação utilizado. O encerramento será processado imediatamente.
        </p>

        <h2>9. Público-Alvo</h2>
        <p>
          Nossos serviços são destinados exclusivamente a maiores de 18 anos. Não coletamos intencionalmente dados de
          menores de idade.
        </p>

        <h2>10. Base Legal para o Tratamento</h2>
        <p>
          O tratamento dos dados pessoais é realizado com base no consentimento do titular, nos termos do Art. 7º,
          inciso I, da Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018), manifestado no momento em que o
          usuário inicia o contato com nossos serviços.
        </p>

        <h2>11. Natureza do Serviço</h2>
        <p>
          Os serviços de consultoria espiritual e leituras de tarot oferecidos pelo Oráculo Místico têm caráter
          interpretativo e simbólico, destinados a reflexão pessoal e orientação. Não constituem aconselhamento médico,
          psicológico, jurídico ou financeiro.
        </p>

        <h2>12. Alterações nesta Política</h2>
        <p>
          Reservamo-nos o direito de atualizar esta Política de Privacidade a qualquer momento. A versão mais recente
          estará sempre disponível nesta página, com a data de atualização indicada no topo.
        </p>

        <h2>13. Contato</h2>
        <p>Para dúvidas, solicitações ou reclamações relacionadas a esta Política de Privacidade:</p>
        <p>E-mail: contato@chavedooraculo.com</p>
        <p>Prazo de resposta: até 5 dias úteis</p>

        <hr style={{ margin: "48px 0 24px", border: "none", borderTop: "1px solid #ddd" }} />
        <p style={{ color: "#666", fontSize: "14px" }}>© 2026 Oráculo Místico. Todos os direitos reservados.</p>
      </article>
    </main>
  );
}
