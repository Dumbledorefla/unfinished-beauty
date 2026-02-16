import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";

interface DateInputBRProps {
  value: string; // formato ISO: "YYYY-MM-DD"
  onChange: (isoDate: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  required?: boolean;
}

export default function DateInputBR({ value, onChange, placeholder = "dd/mm/aaaa", className = "", id, required }: DateInputBRProps) {
  const isoToBR = (iso: string) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };

  const brToISO = (br: string) => {
    const clean = br.replace(/\D/g, "");
    if (clean.length === 8) {
      const d = clean.slice(0, 2);
      const m = clean.slice(2, 4);
      const y = clean.slice(4, 8);
      return `${y}-${m}-${d}`;
    }
    return "";
  };

  const [display, setDisplay] = useState(isoToBR(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const newDisplay = isoToBR(value);
    if (newDisplay !== display && value) {
      setDisplay(newDisplay);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "");
    if (raw.length > 8) raw = raw.slice(0, 8);

    let formatted = "";
    if (raw.length > 0) formatted = raw.slice(0, 2);
    if (raw.length > 2) formatted += "/" + raw.slice(2, 4);
    if (raw.length > 4) formatted += "/" + raw.slice(4, 8);

    setDisplay(formatted);

    if (raw.length === 8) {
      const iso = brToISO(formatted);
      onChange(iso);
    } else if (raw.length === 0) {
      onChange("");
    }
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        id={id}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={10}
        required={required}
        className={`pr-10 ${className}`}
      />
      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
    </div>
  );
}
