import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface FreemiumPaywallProps {
  interpretation: string;
  oracleType: string;
  productName: string;
  price: number;
  previewLines: number;
  hasAccess: boolean;
  onPurchase?: () => Promise<boolean>;
}

function truncateMarkdown(text: string, maxParagraphs: number): string {
  const paragraphs = text.split("\n\n");
  return paragraphs.slice(0, maxParagraphs).join("\n\n");
}

export default function FreemiumPaywall({
  interpretation,
  oracleType,
  productName,
  price,
  previewLines,
  hasAccess,
  onPurchase,
}: FreemiumPaywallProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [purchasing, setPurchasing] = useState(false);

  if (hasAccess) {
    return (
      <div className="oracle-prose">
        <ReactMarkdown>{interpretation}</ReactMarkdown>
      </div>
    );
  }

  const preview = truncateMarkdown(interpretation, previewLines);

  const handleUnlock = async () => {
    if (!isAuthenticated) {
      navigate(`/auth?redirect=/${oracleType.replace("-", "/")}`);
      return;
    }
    if (onPurchase) {
      setPurchasing(true);
      const success = await onPurchase();
      setPurchasing(false);
      if (success) {
        toast.success("Pedido criado! Finalize o pagamento para ver sua leitura completa.");
        navigate("/checkout");
      } else {
        toast.error("Ops, algo deu errado. Tente novamente.");
      }
    }
  };

  return (
    <div className="relative">
      <div className="oracle-prose">
        <ReactMarkdown>{preview}</ReactMarkdown>
      </div>
      <div className="relative -mt-16 pt-16 bg-gradient-to-t from-[hsl(var(--card))] via-[hsl(var(--card)/0.95)] to-transparent">
        <Card className="border-primary/25 bg-secondary/60 backdrop-blur-md mt-4">
          <CardContent className="py-8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center">
              <Star className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-1">
                Sua leitura completa está pronta
              </h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                As cartas já foram tiradas. Veja o que elas revelam sobre você em <strong className="text-foreground">{productName}</strong> — com insights detalhados e orientações personalizadas.
              </p>
            </div>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold text-primary">R$ {price.toFixed(2)}</span>
              <span className="text-muted-foreground text-sm">/ leitura</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                onClick={handleUnlock}
                disabled={purchasing}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-5 text-base pulse-glow"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {purchasing ? "Preparando..." : "Ver minha leitura completa"}
              </Button>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" /> Prévia gratuita acima
              </span>
              <span>•</span>
              <span>Pagamento seguro via PIX</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
