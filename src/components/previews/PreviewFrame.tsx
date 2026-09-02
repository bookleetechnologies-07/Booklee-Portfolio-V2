import { cn } from "@/lib/cn";

import styles from "./preview.module.css";

export type PreviewProps = {
  className?: string;
  /**
   * Only the ERP preview uses this. The home-page laptop story needs a stable
   * handle on the real text node so it can measure it and hand it to the next
   * section; everywhere else the phrase is simply part of the design.
   */
  phraseId?: string;
};

export function PreviewFrame({
  children,
  className,
  canvasClassName,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  canvasClassName?: string;
  /** Accessible summary of what this concept preview shows. */
  label: string;
}) {
  return (
    <div className={cn(styles.frame, className)} role="img" aria-label={label}>
      <div className={cn(styles.canvas, canvasClassName)} aria-hidden="true">
        {children}
      </div>
    </div>
  );
}

/** Small Booklee mark used as in-product branding inside each concept. */
export function PreviewMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn(styles.brandMark, className)} fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 5h18.4a7 7 0 0 1 0 14h1.6a7.5 7.5 0 0 1 0 15H5V5Zm6.6 5.6v3.2h11.3a1.6 1.6 0 0 0 0-3.2H11.6Zm0 14.6v3.6h12.9a1.8 1.8 0 0 0 0-3.6H11.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

export { styles as previewStyles };
