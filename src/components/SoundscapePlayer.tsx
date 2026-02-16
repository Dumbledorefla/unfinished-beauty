import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Music } from "lucide-react";
import { useSoundscape } from "@/hooks/useSoundscape";
import { Slider } from "@/components/ui/slider";

export default function SoundscapePlayer() {
  const { current, isPlaying, volume, play, stop, changeVolume, SOUNDSCAPES } = useSoundscape();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-14 right-0 w-64 bg-popover/95 backdrop-blur-xl rounded-xl p-4 shadow-xl border border-primary/20"
          >
            <p className="text-sm font-medium text-foreground mb-3">Ambiente sonoro</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {SOUNDSCAPES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => play(s.id)}
                  className={`p-2 rounded-lg text-center transition-all ${
                    current === s.id
                      ? "bg-primary/20 border border-primary/40"
                      : "bg-secondary/40 border border-transparent hover:border-primary/20"
                  }`}
                >
                  <span className="text-lg">{s.emoji}</span>
                  <p className="text-[10px] text-muted-foreground mt-1">{s.name}</p>
                </button>
              ))}
            </div>
            {isPlaying && (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
                  <Slider
                    value={[volume * 100]}
                    onValueChange={([v]) => changeVolume(v / 100)}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <button onClick={stop} className="text-xs text-destructive/70 hover:text-destructive transition-colors w-full text-center">
                  Parar som
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setExpanded(!expanded)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
          isPlaying
            ? "bg-primary text-primary-foreground"
            : "bg-secondary/80 text-muted-foreground border border-border/30"
        }`}
      >
        <Music className="w-5 h-5" />
      </motion.button>
    </div>
  );
}
