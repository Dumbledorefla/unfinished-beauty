import { ReactNode } from "react";

interface AccessibleIconProps {
  label: string;
  children: ReactNode;
}

/**
 * Wrapper que adiciona aria-label a ícones decorativos.
 */
export function AccessibleIcon({ label, children }: AccessibleIconProps) {
  return (
    <span role="img" aria-label={label} className="inline-flex">
      {children}
    </span>
  );
}

/**
 * Componente para texto visível apenas para leitores de tela.
 */
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return (
    <span
      className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
      style={{ clip: "rect(0, 0, 0, 0)" }}
    >
      {children}
    </span>
  );
}
