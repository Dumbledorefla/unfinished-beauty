import { TarotCard } from "@/lib/tarot-cards";

interface TarotCardImageProps {
  card: TarotCard;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-24 h-36",
  md: "w-36 h-52",
  lg: "w-48 h-72",
};

export default function TarotCardImage({ card, size = "md", className = "" }: TarotCardImageProps) {
  return (
    <div className={`relative ${sizeClasses[size]} mx-auto ${className}`}>
      <img
        src={card.image}
        alt={`Carta de Tarot: ${card.name}`}
        className={`w-full h-full object-cover rounded-xl shadow-2xl border-2 border-amber-500/30 ${
          !card.upright ? "rotate-180" : ""
        }`}
        loading="lazy"
      />
      {!card.upright && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-amber-400 text-xs px-2 py-0.5 rounded font-medium">
          Invertida
        </div>
      )}
    </div>
  );
}
