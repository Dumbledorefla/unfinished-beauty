import { useState } from "react";
import {
  Webhook, Plus, Play, Pause, Trash2, Copy,
  CheckCircle2, XCircle, RefreshCw, Code, Zap, Globe, Key, ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  lastTriggered?: string;
  lastStatus?: "success" | "error";
  secret?: string;
}

const availableEvents = [
  { id: "user.created", label: "Novo usuário criado" },
  { id: "reading.completed", label: "Leitura de tarot concluída" },
  { id: "order.created", label: "Novo pedido criado" },
  { id: "order.paid", label: "Pedido pago" },
  { id: "consultation.scheduled", label: "Consulta agendada" },
  { id: "payment.received", label: "Pagamento recebido" },
  { id: "blog.published", label: "Artigo publicado" },
  { id: "newsletter.sent", label: "Newsletter enviada" },
  { id: "course.enrolled", label: "Inscrição em curso" },
];

const integrationTemplates = [
  { name: "WhatsApp Business", description: "Notificações via WhatsApp", icon: "💬", events: ["consultation.scheduled", "order.paid"], docsUrl: "https://developers.facebook.com/docs/whatsapp" },
  { name: "Google Analytics", description: "Rastrear eventos de conversão", icon: "📊", events: ["reading.completed", "order.paid"], docsUrl: "https://developers.google.com/analytics" },
  { name: "Mailchimp", description: "Sincronizar lista de e-mails", icon: "📧", events: ["user.created", "newsletter.sent"], docsUrl: "https://mailchimp.com/developer/" },
  { name: "Stripe", description: "Processar pagamentos", icon: "💳", events: ["payment.received"], docsUrl: "https://stripe.com/docs/api" },
  { name: "Zapier", description: "Conectar com 5000+ apps", icon: "⚡", events: ["user.created", "order.paid", "reading.completed"], docsUrl: "https://zapier.com/developer" },
  { name: "Discord", description: "Notificações para a equipe", icon: "🎮", events: ["order.created", "consultation.scheduled"], docsUrl: "https://discord.com/developers/docs" },
];

export default function AdminIntegracoesPage() {
  const [activeTab, setActiveTab] = useState<"webhooks" | "apis" | "templates">("webhooks");
  const [showNewWebhook, setShowNewWebhook] = useState(false);
  const [testUrl, setTestUrl] = useState("");
  const [testResult, setTestResult] = useState<null | { status: number; body: string; time: number }>(null);
  const [testing, setTesting] = useState(false);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [newWebhook, setNewWebhook] = useState({ name: "", url: "", events: [] as string[] });

  const handleTestEndpoint = async () => {
    if (!testUrl) return;
    setTesting(true);
    setTestResult(null);
    const startTime = Date.now();
    try {
      const response = await fetch(testUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "test.ping", timestamp: new Date().toISOString(), data: { message: "Teste de webhook da Chave do Oráculo" } }),
      });
      const body = await response.text();
      setTestResult({ status: response.status, body: body.substring(0, 500), time: Date.now() - startTime });
    } catch (error: any) {
      setTestResult({ status: 0, body: error.message || "Erro de conexão", time: Date.now() - startTime });
    }
    setTesting(false);
  };

  const toggleWebhook = (id: string) => {
    setWebhooks(prev => prev.map(wh => wh.id === id ? { ...wh, active: !wh.active } : wh));
    toast.success("Webhook atualizado!");
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        Conecte APIs externas, configure webhooks e automatize processos.
      </p>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-primary/20 pb-2">
        {[
          { id: "webhooks" as const, label: "Webhooks", icon: Webhook },
          { id: "apis" as const, label: "Conexões API", icon: Globe },
          { id: "templates" as const, label: "Templates", icon: Zap },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm transition-all ${
              activeTab === tab.id ? "bg-primary/20 text-primary border border-primary/30 border-b-transparent" : "text-muted-foreground hover:text-foreground"
            }`}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Webhooks tab */}
      {activeTab === "webhooks" && (
        <div className="space-y-4">
          <Card className="bg-card/80 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                <Code className="w-4 h-4" /> Testar Endpoint
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input placeholder="https://seu-endpoint.com/webhook" value={testUrl} onChange={(e) => setTestUrl(e.target.value)}
                  className="bg-primary/5 border-primary/20" />
                <Button onClick={handleTestEndpoint} disabled={testing || !testUrl}
                  className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 min-w-[100px]">
                  {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Play className="w-4 h-4 mr-1" /> Testar</>}
                </Button>
              </div>
              {testResult && (
                <div className={`p-3 rounded-lg border ${testResult.status >= 200 && testResult.status < 300 ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {testResult.status >= 200 && testResult.status < 300 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                    <span className="text-sm font-mono text-foreground">Status: {testResult.status || "Erro"} • {testResult.time}ms</span>
                  </div>
                  <pre className="text-xs text-muted-foreground font-mono overflow-x-auto">{testResult.body}</pre>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground/80">Webhooks Configurados</h3>
            <Button onClick={() => setShowNewWebhook(true)} size="sm" className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30">
              <Plus className="w-4 h-4 mr-1" /> Novo Webhook
            </Button>
          </div>

          {webhooks.length === 0 && !showNewWebhook && (
            <div className="text-center py-12 text-muted-foreground">
              <Webhook className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum webhook configurado</p>
              <p className="text-xs mt-1">Crie um webhook para receber notificações em tempo real</p>
            </div>
          )}

          {webhooks.map((webhook) => (
            <Card key={webhook.id} className="bg-card/80 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${webhook.active ? "bg-emerald-400" : "bg-muted-foreground"}`} />
                      <h4 className="text-sm font-medium text-foreground">{webhook.name}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{webhook.url}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {webhook.events.map((event) => (
                        <span key={event} className="text-[10px] bg-primary/10 text-primary/60 px-2 py-0.5 rounded-full">{event}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => toggleWebhook(webhook.id)} className="text-muted-foreground hover:text-foreground">
                      {webhook.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-400/40 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {showNewWebhook && (
            <Card className="bg-card/80 border-accent/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-accent">Novo Webhook</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Nome</label>
                  <Input placeholder="Ex: Notificação de vendas" value={newWebhook.name} onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">URL do Endpoint</label>
                  <Input placeholder="https://..." value={newWebhook.url} onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Eventos</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {availableEvents.map((event) => (
                      <label key={event.id} className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                        <input type="checkbox" checked={newWebhook.events.includes(event.id)}
                          onChange={(e) => {
                            if (e.target.checked) setNewWebhook(prev => ({ ...prev, events: [...prev.events, event.id] }));
                            else setNewWebhook(prev => ({ ...prev, events: prev.events.filter(ev => ev !== event.id) }));
                          }}
                          className="rounded border-primary/30" />
                        {event.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30" onClick={() => {
                    if (newWebhook.name && newWebhook.url) {
                      setWebhooks(prev => [...prev, { ...newWebhook, id: Date.now().toString(), active: true }]);
                      toast.success(`Webhook "${newWebhook.name}" criado!`);
                      setShowNewWebhook(false);
                      setNewWebhook({ name: "", url: "", events: [] });
                    }
                  }}>
                    Criar Webhook
                  </Button>
                  <Button variant="outline" className="text-muted-foreground border-primary/20" onClick={() => setShowNewWebhook(false)}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Templates tab */}
      {activeTab === "templates" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrationTemplates.map((template) => (
            <Card key={template.name} className="bg-card/80 border-primary/20 hover:border-primary/40 transition-all cursor-pointer">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{template.icon}</span>
                  <h4 className="text-sm font-medium text-foreground">{template.name}</h4>
                </div>
                <p className="text-xs text-muted-foreground">{template.description}</p>
                <div className="flex flex-wrap gap-1">
                  {template.events.map((event) => (
                    <span key={event} className="text-[10px] bg-primary/10 text-primary/60 px-2 py-0.5 rounded-full">{event}</span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30">
                    <Plus className="w-3 h-3 mr-1" /> Conectar
                  </Button>
                  <Button size="sm" variant="outline" className="text-muted-foreground border-primary/20" onClick={() => window.open(template.docsUrl, "_blank")}>
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* APIs tab */}
      {activeTab === "apis" && (
        <div className="space-y-4">
          <Card className="bg-card/80 border-accent/20">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-accent" />
                    <h4 className="text-sm font-medium text-accent">Sua API Key</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">Use esta chave para acessar a API externamente.</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-primary/10 text-muted-foreground px-3 py-1.5 rounded font-mono border border-primary/20">
                      co_live_••••••••••••••••••••
                    </code>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => toast.success("API Key copiada!")}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-accent/50 border-accent/20 hover:bg-accent/10">
                  <RefreshCw className="w-3 h-3 mr-1" /> Regenerar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent" /> Edge Functions Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { name: "oracle-interpret", desc: "Interpretação de cartas" },
                  { name: "send-email", desc: "Envio de e-mails" },
                  { name: "send-whatsapp", desc: "Notificações WhatsApp" },
                  { name: "notify-consultation", desc: "Alertas de consulta" },
                  { name: "send-consultation-reminders", desc: "Lembretes de consulta" },
                  { name: "google-calendar-auth", desc: "Auth Google Calendar" },
                  { name: "google-calendar-event", desc: "Eventos no Calendar" },
                ].map((fn) => (
                  <div key={fn.name} className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <div>
                      <p className="text-xs font-mono text-foreground">{fn.name}</p>
                      <p className="text-[10px] text-muted-foreground">{fn.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                <Code className="w-4 h-4" /> Endpoints Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { method: "GET", path: "/api/readings", desc: "Listar leituras" },
                  { method: "POST", path: "/api/readings", desc: "Criar leitura" },
                  { method: "GET", path: "/api/users", desc: "Listar usuários" },
                  { method: "GET", path: "/api/products", desc: "Listar produtos" },
                  { method: "POST", path: "/api/orders", desc: "Criar pedido" },
                  { method: "GET", path: "/api/consultations", desc: "Listar consultas" },
                ].map((endpoint) => (
                  <div key={endpoint.path + endpoint.method} className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      endpoint.method === "GET" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                    }`}>{endpoint.method}</span>
                    <code className="text-xs font-mono text-muted-foreground">{endpoint.path}</code>
                    <span className="text-xs text-muted-foreground/60 ml-auto">{endpoint.desc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
