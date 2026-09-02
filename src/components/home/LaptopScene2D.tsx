import { Monogram } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";

import styles from "./laptop.module.css";

const KEY_ROWS = [14, 14, 13, 12, 8];

/**
 * The device itself: hinged lid, bezel, live screen, deck, keyboard suggestion
 * and contact shadow.
 *
 * It exposes exactly two inputs — the `--lid` angle and whatever transform the
 * timeline applies to the wrapping `.zoom` element — so the same story can
 * later drive a WebGL device or a scrubbed image sequence without the page
 * around it changing at all.
 */
export function LaptopScene2D({
  children,
  open = false,
  flat = false,
  className,
}: {
  /** Screen contents. Always live DOM, never a baked image. */
  children: React.ReactNode;
  /** Render the lid already open (reduced motion and small screens). */
  open?: boolean;
  /** Drop the 3D deck for the compact layout. */
  flat?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(styles.zoom, className)}
      data-laptop="zoom"
      style={open ? ({ ["--lid" as string]: "8deg" }) : undefined}
    >
      <div className={styles.glow} data-laptop="recede" aria-hidden="true" />
      <div className={styles.shadow} data-laptop="recede" aria-hidden="true" />

      <div className={styles.device} data-laptop="device">
        {!flat && (
          <div className={styles.deck} data-laptop="recede" aria-hidden="true">
            <div className={styles.keyboard}>
              {KEY_ROWS.map((count, row) => (
                <div key={row} className={styles.keyRow}>
                  {Array.from({ length: count }, (_, key) => (
                    <span
                      key={key}
                      className={styles.key}
                      style={
                        row === 4 && key === 3
                          ? { flex: 5 }
                          : row === 4 && (key === 0 || key === 7)
                            ? { flex: 1.6 }
                            : undefined
                      }
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className={styles.trackpad} />
          </div>
        )}

        <div className={styles.lid} data-laptop="lid">
          <div className={styles.lidShell} aria-hidden="true">
            <Monogram className={styles.shellMark} />
          </div>
          <div className={styles.lidFace}>
            <div className={styles.screen} data-laptop="screen">
              {children}
              <div className={styles.glare} aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { styles as laptopStyles };
