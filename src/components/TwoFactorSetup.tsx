import { useState, useEffect } from "react";
import { Shield, ShieldCheck, ShieldOff, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTwoFactor } from "@/hooks/useTwoFactor";
import { toast } from "sonner";

export default function TwoFactorSetup() {
  const { loading, setupData, checkMFAStatus, enrollMFA, verifyMFA, unenrollMFA } = useTwoFactor();
  const [mfaStatus, setMfaStatus] = useState<{ enrolled: boolean; verified: boolean; factorId?: string }>({ enrolled: false, verified: false });
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      const status = await checkMFAStatus();
      setMfaStatus(status);
      setChecking(false);
    };
    check();
  }, [checkMFAStatus]);

  const handleVerify = async () => {
    if (!setupData || code.length !== 6) return;
    const success = await verifyMFA(setupData.id, code);
    if (success) { setMfaStatus({ enrolled: true, verified: true, factorId: setupData.id }); setCode(""); }
  };

  const handleUnenroll = async () => {
    if (!mfaStatus.factorId || !confirm("Tem certeza que deseja desativar a autenticação de dois fatores?")) return;
    const success = await unenrollMFA(mfaStatus.factorId);
    if (success) setMfaStatus({ enrolled: false, verified: false });
  };

  if (checking) return <div className="h-32 rounded-2xl bg-muted animate-pulse" />;

  return (
    <Card className="bg-card/80 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg"><Shield className="w-5 h-5" /> Autenticação de Dois Fatores (2FA)</CardTitle>
        <CardDescription>Adicione uma camada extra de segurança à sua conta usando um app autenticador.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          {mfaStatus.verified ? (
            <><ShieldCheck className="w-5 h-5 text-emerald-400" /><Badge className="bg-emerald-500/20 text-emerald-400">Ativo</Badge></>
          ) : (
            <><ShieldOff className="w-5 h-5 text-foreground/40" /><Badge className="bg-foreground/10 text-foreground/50">Inativo</Badge></>
          )}
        </div>

        {mfaStatus.verified && (
          <div>
            <p className="text-sm text-foreground/60 mb-3">Sua conta está protegida com autenticação de dois fatores.</p>
            <Button variant="outline" size="sm" onClick={handleUnenroll} disabled={loading} className="text-destructive">Desativar 2FA</Button>
          </div>
        )}

        {!mfaStatus.verified && !setupData && (
          <div>
            <p className="text-sm text-foreground/60 mb-3">Use um app como Google Authenticator, Authy ou 1Password para gerar códigos de verificação.</p>
            <Button onClick={() => enrollMFA()} disabled={loading}><Shield className="w-4 h-4 mr-2" />{loading ? "Configurando..." : "Ativar 2FA"}</Button>
          </div>
        )}

        {setupData && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-foreground/60 mb-3">Escaneie o QR Code com seu app autenticador:</p>
              <div className="inline-block p-3 bg-white rounded-xl">
                <img src={setupData.totp.qr_code} alt="QR Code 2FA" className="w-48 h-48" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-foreground/40 mb-1">Ou insira o código manualmente:</p>
              <div className="flex items-center justify-center gap-2">
                <code className="text-xs bg-background/50 px-3 py-1.5 rounded-lg font-mono text-primary">{setupData.totp.secret}</code>
                <button onClick={() => { navigator.clipboard.writeText(setupData.totp.secret); toast.success("Código copiado!"); }} className="text-foreground/40 hover:text-primary">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <p className="text-sm text-foreground/60 mb-2">Digite o código de 6 dígitos do seu app:</p>
              <div className="flex gap-2 max-w-xs">
                <Input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000" maxLength={6} className="bg-background/50 text-center font-mono text-lg tracking-widest"
                />
                <Button onClick={handleVerify} disabled={code.length !== 6 || loading}>{loading ? "Verificando..." : "Verificar"}</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
