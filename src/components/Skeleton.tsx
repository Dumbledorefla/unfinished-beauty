import { motion } from "framer-motion";

/** Bloco retangular com animação shimmer */
export function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg bg-foreground/5 animate-pulse ${className}`} />
  );
}

/** Skeleton para cards de serviço (homepage) */
export function ServiceCardSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-card/60 border border-primary/10 space-y-4">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-5 w-3/4" />
          <SkeletonBlock className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonBlock className="h-4 w-full" />
      <SkeletonBlock className="h-4 w-2/3" />
    </div>
  );
}

/** Skeleton para a página de perfil */
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-card/60 border border-primary/10 space-y-4">
        <SkeletonBlock className="h-6 w-40" />
        <div className="space-y-3">
          <SkeletonBlock className="h-10 w-full" />
          <SkeletonBlock className="h-10 w-full" />
          <SkeletonBlock className="h-10 w-full" />
        </div>
        <div className="flex gap-3">
          <SkeletonBlock className="h-10 w-24" />
          <SkeletonBlock className="h-10 w-20" />
        </div>
      </div>
      <div className="p-6 rounded-2xl bg-card/60 border border-primary/10 space-y-4">
        <SkeletonBlock className="h-6 w-48" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
            <SkeletonBlock className="w-10 h-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-32" />
              <SkeletonBlock className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton para a página de checkout */
export function CheckoutSkeleton() {
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="p-6 rounded-2xl bg-card/60 border border-primary/10 space-y-4">
        <SkeletonBlock className="h-6 w-48" />
        <SkeletonBlock className="h-20 w-full rounded-xl" />
        <SkeletonBlock className="h-12 w-full" />
        <SkeletonBlock className="h-12 w-full" />
      </div>
    </div>
  );
}

/** Skeleton para cards de produto */
export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl bg-card/60 border border-primary/10 overflow-hidden">
      <SkeletonBlock className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <SkeletonBlock className="h-5 w-3/4" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <SkeletonBlock className="h-6 w-20" />
          <SkeletonBlock className="h-9 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton para leitura de tarot (enquanto IA gera) */
export function TarotReadingSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 p-6"
    >
      <div className="flex justify-center gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={{ rotateY: [0, 180, 360] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            className="w-16 h-24 rounded-lg bg-primary/10 border border-primary/20"
          />
        ))}
      </div>
      <SkeletonBlock className="h-4 w-full" />
      <SkeletonBlock className="h-4 w-5/6" />
      <SkeletonBlock className="h-4 w-4/6" />
      <SkeletonBlock className="h-4 w-full" />
      <SkeletonBlock className="h-4 w-3/4" />
    </motion.div>
  );
}

/** Skeleton para tabela admin */
export function AdminTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-4 px-4 py-2">
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="h-4 w-32" />
        <SkeletonBlock className="h-4 w-20" />
        <SkeletonBlock className="h-4 w-16" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 rounded-lg bg-secondary/10">
          <SkeletonBlock className="h-5 w-24" />
          <SkeletonBlock className="h-5 w-32" />
          <SkeletonBlock className="h-5 w-20" />
          <SkeletonBlock className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}
