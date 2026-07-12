const RADII = {
  1: "60% 40% 30% 70% / 60% 30% 70% 40%",
  2: "30% 70% 70% 30% / 30% 30% 70% 70%",
  3: "70% 30% 30% 70% / 70% 70% 30% 30%",
} as const;

export function BlobAccent({
  className = "",
  color,
  opacity = 0.15,
  variant = 1,
  animate = false,
}: {
  className?: string;
  color: string;
  opacity?: number;
  variant?: 1 | 2 | 3;
  animate?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={`absolute pointer-events-none ${animate ? "animate-float" : ""} ${className}`}
      style={{ backgroundColor: color, opacity, borderRadius: RADII[variant] }}
    />
  );
}