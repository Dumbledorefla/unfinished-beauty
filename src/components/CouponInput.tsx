import { useState } from "react";
import { Tag, X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CouponInputProps {
  onApply: (code: string) => Promise<boolean>;
  onRemove: () => void;
  appliedCoupon: { code: string; discount_type: string; discount_value: number } | null;
  discountAmount: number;
  loading: boolean;
}

export default function CouponInput({
  onApply,
  onRemove,
  appliedCoupon,
  discountAmount,
  loading,
}: CouponInputProps) {
  const [code, setCode] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handleApply = async () => {
    const success = await onApply(code);
    if (success) setCode("");
  };

  // Cupom já aplicado
  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="text-sm font-medium text-emerald-300">
              {appliedCoupon.code}
            </span>
            <span className="text-xs text-emerald-400/70 ml-2">
              -R$ {discountAmount.toFixed(2)}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-7 w-7 text-foreground/40 hover:text-destructive"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
    );
  }

  // Input de cupom
  if (showInput) {
    return (
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="CÓDIGO DO CUPOM"
          className="text-sm uppercase"
          onKeyDown={(e) => { if (e.key === "Enter") handleApply(); }}
        />
        <Button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          size="sm"
          className="shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aplicar"}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => { setShowInput(false); setCode(""); }}
          className="shrink-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // Botão para mostrar input
  return (
    <button
      onClick={() => setShowInput(true)}
      className="flex items-center gap-1.5 text-sm text-primary/70 hover:text-primary transition-colors"
    >
      <Tag className="w-3.5 h-3.5" />
      Tem um cupom de desconto?
    </button>
  );
}
