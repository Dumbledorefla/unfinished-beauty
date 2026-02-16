import { Copy, Share2, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  text: string;
  title?: string;
}

export default function ShareButtons({ text, title = "Minha leitura" }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const plainText = text
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/---/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const shareWhatsApp = () => {
    const msg = `✨ *${title}* ✨\n\n${plainText.slice(0, 2000)}\n\n🔮 Tire suas cartas também: ${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`✨ ${title} ✨\n\n${plainText}`);
      setCopied(true);
      toast({ title: "Copiado!", description: "Texto copiado para a área de transferência." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Não foi possível copiar. Tente selecionar o texto manualmente.", variant: "destructive" });
    }
  };

  return (
    <div className="flex items-center gap-2 justify-center">
      <Button onClick={shareWhatsApp} variant="outline" size="sm" className="border-primary/30 text-foreground hover:bg-primary/10">
        <Share2 className="w-4 h-4 mr-1" /> WhatsApp
      </Button>
      <Button onClick={copyToClipboard} variant="outline" size="sm" className="border-primary/30 text-foreground hover:bg-primary/10">
        {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
        {copied ? "Copiado!" : "Copiar"}
      </Button>
    </div>
  );
}
