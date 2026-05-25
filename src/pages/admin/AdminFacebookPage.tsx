import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Facebook, CheckCircle2, AlertCircle } from "lucide-react";

const CAPI_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/facebook-capi`;

// Pre-fill options matching /atendimentos products
const PRODUCT_PRESETS = [
  { name: "1 pergunta objetiva", value: 13 },
  { name: "2 perguntas objetivas", value: 26 },
  { name: "3 perguntas objetivas", value: 29 },
  { name: "Carta Canalizada", value: 25 },
  { name: "Adoçamento", value: 300 },
  { name: "Corte de Laços", value: 500 },
  { name: "Auto estima e amor próprio", value: 350 },
];

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "ev_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
}

export default function AdminFacebookPage() {
  const [eventName, setEventName] = useState<"Purchase" | "Lead" | "Contact">("Purchase");
  const [contentName, setContentName] = useState("");
  const [value, setValue] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [testCode, setTestCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const applyPreset = (preset: typeof PRODUCT_PRESETS[number]) => {
    setContentName(preset.name);
    setValue(String(preset.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentName.trim()) { toast.error("Informe o nome do produto/serviço"); return; }
    if (eventName === "Purchase" && !value) { toast.error("Informe o valor da compra"); return; }
    if (!phone.trim() && !email.trim()) { toast.error("Informe ao menos telefone ou email"); return; }

    setSubmitting(true);
    setLastResult(null);
    try {
      const res = await fetch(CAPI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_name: eventName,
          event_id: uuid(),
          event_source_url: "https://chavedooraculo.com/atendimentos",
          action_source: "chat", // venda fechada via WhatsApp
          value: value ? parseFloat(value) : undefined,
          currency: "BRL",
          content_name: contentName,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          first_name: firstName.trim() || undefined,
          test_event_code: testCode.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

      setLastResult({ ok: true, msg: `Evento '${eventName}' enviado com sucesso ao Meta.` });
      toast.success(`${eventName} registrado no Facebook!`);

      // Limpa só os campos do cliente (mantém produto pra envios em sequência)
      setPhone(""); setEmail(""); setFirstName("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setLastResult({ ok: false, msg });
      toast.error(`Falha ao enviar: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="bg-slate-900 border border-slate-800 rounded-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
              <Facebook className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-slate-100">Conversões do Facebook</CardTitle>
              <p className="text-xs text-slate-400 mt-1">
                Registre vendas fechadas no WhatsApp para atribuição correta da campanha (Purchase server-side via Conversions API).
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tipo de evento */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Tipo de evento</Label>
                <Select value={eventName} onValueChange={(v) => setEventName(v as typeof eventName)}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100 mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Purchase">Purchase (compra confirmada)</SelectItem>
                    <SelectItem value="Lead">Lead (novo lead qualificado)</SelectItem>
                    <SelectItem value="Contact">Contact (cliente respondeu no WA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300">Test Event Code (opcional)</Label>
                <Input
                  placeholder="TEST12345"
                  value={testCode}
                  onChange={(e) => setTestCode(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-slate-100 mt-1.5"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Use para validar na aba "Testar eventos" do Gerenciador de Eventos. Deixe vazio em produção.
                </p>
              </div>
            </div>

            {/* Presets */}
            <div>
              <Label className="text-slate-300 mb-2 block">Atalhos de produto</Label>
              <div className="flex flex-wrap gap-2">
                {PRODUCT_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="text-xs px-3 py-1.5 rounded-full border border-slate-700 bg-slate-800 text-slate-300 hover:border-amber-500/50 hover:text-amber-300 transition"
                  >
                    {p.name} · R$ {p.value}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Nome do produto/serviço *</Label>
                <Input value={contentName} onChange={(e) => setContentName(e.target.value)}
                       className="bg-slate-800 border-slate-700 text-slate-100 mt-1.5" />
              </div>
              <div>
                <Label className="text-slate-300">Valor (R$) {eventName === "Purchase" && "*"}</Label>
                <Input type="number" step="0.01" value={value} onChange={(e) => setValue(e.target.value)}
                       className="bg-slate-800 border-slate-700 text-slate-100 mt-1.5" />
              </div>
            </div>

            <div className="border-t border-slate-800 pt-5">
              <p className="text-xs text-slate-400 mb-3">
                Dados do cliente (hasheados antes de enviar ao Meta — informe ao menos um identificador).
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-slate-300">Telefone (com DDI)</Label>
                  <Input placeholder="5581995827762" value={phone} onChange={(e) => setPhone(e.target.value)}
                         className="bg-slate-800 border-slate-700 text-slate-100 mt-1.5" />
                  <p className="text-[10px] text-slate-500 mt-1">Apenas dígitos. Ex: 5581995827762</p>
                </div>
                <div>
                  <Label className="text-slate-300">Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                         className="bg-slate-800 border-slate-700 text-slate-100 mt-1.5" />
                </div>
                <div>
                  <Label className="text-slate-300">Primeiro nome</Label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)}
                         className="bg-slate-800 border-slate-700 text-slate-100 mt-1.5" />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-500 text-white">
              {submitting ? "Enviando..." : `Enviar ${eventName} ao Facebook`}
            </Button>

            {lastResult && (
              <div className={`flex items-start gap-2 p-3 rounded-lg border text-sm ${
                lastResult.ok ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                              : "bg-red-500/10 border-red-500/30 text-red-300"
              }`}>
                {lastResult.ok ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                <span>{lastResult.msg}</span>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border border-slate-800 rounded-xl">
        <CardContent className="pt-6 text-sm text-slate-400 space-y-2">
          <p className="text-slate-200 font-semibold">Como funciona</p>
          <p>O Pixel já está instalado na página <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">/atendimentos</code> e dispara <strong>Lead</strong> automaticamente em cada clique nos botões de WhatsApp.</p>
          <p>Quando você fechar uma venda pelo WhatsApp, volte aqui, selecione o produto, cole o <strong>telefone do cliente</strong> (mesmo número que ele usou pra te chamar) e clique em enviar. O Facebook cruza o telefone hasheado com o Lead anterior e atribui a compra à campanha correta.</p>
          <p className="text-amber-300/80">💡 Match rate aumenta quanto mais dados (telefone + email + nome). Telefone sozinho já funciona, mas combinar é melhor.</p>
        </CardContent>
      </Card>
    </div>
  );
}
