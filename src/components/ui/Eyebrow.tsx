import { cn } from "@/lib/cn";

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("eyebrow flex items-center gap-2.5 opacity-60", className)}>
      <span aria-hidden="true" className="h-px w-6 bg-current" />
      {children}
    </p>
  );
}
