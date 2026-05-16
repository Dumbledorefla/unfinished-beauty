import { useEffect } from "react";

export default function ExclusaoDados() {
  useEffect(() => {
    document.title = "Exclusão de Dados do Usuário — Oráculo Místico";
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.name = name;
        document.head.appendChild(el);
      }
      el.content = content;
    };
    setMeta("description", "Como solicitar a exclusão dos seus dados pessoais no Oráculo Místico, conforme a LGPD.");
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = "https://chavedooraculo.com/exclusao-de-dados";
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
        <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>Exclusão de Dados do Usuário</h1>
        <p style={{ color: "#555", marginBottom: "32px" }}>Última atualização: maio de 2026</p>

        <h2>Como solicitar a exclusão dos seus dados</h2>
        <p>
          O Oráculo Místico respeita o seu direito à privacidade e ao controle sobre seus dados pessoais, conforme
          previsto na Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
        </p>

        <h2>Opção 1 — Por e-mail</h2>
        <p>
          Envie um e-mail para contato@chavedooraculo.com com o assunto: "Solicitação de Exclusão de Dados".
        </p>
        <p>Inclua no e-mail:</p>
        <p>- Seu nome</p>
        <p>- O número de telefone associado ao atendimento</p>
        <p>Você receberá uma resposta com um código de confirmação em até 5 dias úteis.</p>

        <h2>Opção 2 — Pelo canal de atendimento</h2>
        <p>
          Envie a mensagem "Quero excluir meus dados" pelo canal de atendimento utilizado. Você receberá um código de
          protocolo e o prazo para conclusão.
        </p>

        <h2>O que será excluído</h2>
        <p>Ao solicitar a exclusão, removeremos permanentemente:</p>
        <p>- Seu número de telefone e nome de perfil</p>
        <p>- O histórico de atendimentos</p>
        <p>- Dados de transações associados ao seu contato</p>

        <h2>Prazo para exclusão</h2>
        <p>A exclusão será concluída em até 30 dias após a confirmação da solicitação.</p>

        <h2>Dúvidas</h2>
        <p>Para qualquer dúvida, entre em contato pelo e-mail contato@chavedooraculo.com</p>

        <hr style={{ margin: "48px 0 24px", border: "none", borderTop: "1px solid #ddd" }} />
        <p style={{ color: "#666", fontSize: "14px" }}>© 2026 Oráculo Místico. Todos os direitos reservados.</p>
      </article>
    </main>
  );
}
