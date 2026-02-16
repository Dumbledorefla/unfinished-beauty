import { useState, useRef, useCallback, useEffect } from "react";

export interface Soundscape {
  id: string;
  name: string;
  emoji: string;
  url: string;
}

export const SOUNDSCAPES: Soundscape[] = [
  { id: "rain", name: "Chuva", emoji: "🌧️", url: "https://cdn.pixabay.com/audio/2022/05/19/audio_c5b5a9f007.mp3" },
  { id: "forest", name: "Floresta", emoji: "🌲", url: "https://cdn.pixabay.com/audio/2022/03/09/audio_c610232c26.mp3" },
  { id: "ocean", name: "Oceano", emoji: "🌊", url: "https://cdn.pixabay.com/audio/2024/11/04/audio_6053de5e26.mp3" },
  { id: "fire", name: "Fogueira", emoji: "🔥", url: "https://cdn.pixabay.com/audio/2022/08/31/audio_419e41e98e.mp3" },
  { id: "wind", name: "Vento", emoji: "💨", url: "https://cdn.pixabay.com/audio/2022/03/24/audio_6712d13b47.mp3" },
  { id: "night", name: "Noite", emoji: "🦉", url: "https://cdn.pixabay.com/audio/2022/02/07/audio_92fbb85517.mp3" },
];

export function useSoundscape() {
  const [current, setCurrent] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback((id: string) => {
    const soundscape = SOUNDSCAPES.find((s) => s.id === id);
    if (!soundscape) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (current === id && isPlaying) {
      setCurrent(null);
      setIsPlaying(false);
      return;
    }

    const audio = new Audio(soundscape.url);
    audio.loop = true;
    audio.volume = volume;
    audio.play().catch(() => {});
    audioRef.current = audio;
    setCurrent(id);
    setIsPlaying(true);
  }, [current, isPlaying, volume]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setCurrent(null);
    setIsPlaying(false);
  }, []);

  const changeVolume = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return { current, isPlaying, volume, play, stop, changeVolume, SOUNDSCAPES };
}
