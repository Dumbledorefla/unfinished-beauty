import { motion } from "framer-motion";
import { Flame, Star, Trophy } from "lucide-react";
import { useStreak } from "@/hooks/useStreak";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function StreakBadge() {
  const { streak, levelName, xpProgress, nextLevel, loading } = useStreak();

  if (loading || !streak) return null;

  return (
    <Tooltip>
      <TooltipTrigger>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/60 border border-primary/20 cursor-pointer"
        >
          <Flame className={`w-4 h-4 ${streak.current_streak > 0 ? "text-orange-400" : "text-muted-foreground"}`} />
          <span className="text-sm font-semibold text-foreground">{streak.current_streak}</span>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="p-4 max-w-[240px]">
        <div className="space-y-3">
          <div className="text-center">
            <p className="font-semibold text-foreground">{levelName}</p>
            <p className="text-xs text-muted-foreground">{streak.xp} XP</p>
          </div>
          {nextLevel && (
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{levelName}</span>
                <span>{nextLevel}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${xpProgress}%` }} />
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <Flame className="w-4 h-4 mx-auto text-orange-400 mb-1" />
              <p className="text-xs font-semibold">{streak.current_streak}</p>
              <p className="text-[10px] text-muted-foreground">Sequência</p>
            </div>
            <div>
              <Trophy className="w-4 h-4 mx-auto text-amber-400 mb-1" />
              <p className="text-xs font-semibold">{streak.longest_streak}</p>
              <p className="text-[10px] text-muted-foreground">Recorde</p>
            </div>
            <div>
              <Star className="w-4 h-4 mx-auto text-primary mb-1" />
              <p className="text-xs font-semibold">{streak.total_readings}</p>
              <p className="text-[10px] text-muted-foreground">Leituras</p>
            </div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
