import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { marqueeRowOne, marqueeRowTwo, type Technology } from "@/content/technologies";
import { cn } from "@/lib/cn";

import styles from "./marquee.module.css";

function Row({
  items,
  reverse,
  duration,
}: {
  items: Technology[];
  reverse?: boolean;
  duration: string;
}) {
  return (
    <div className={cn(styles.viewport, "overflow-hidden")}>
      <ul
        className={cn(styles.row, reverse && styles.rowReverse)}
        style={{ ["--duration" as string]: duration }}
      >
        {items.map((item) => (
          <Item key={item.name} name={item.name} />
        ))}
        {/* Duplicated purely so the loop has somewhere to go. Assistive
            technology reads the list once. */}
        {items.map((item) => (
          <Item key={`dup-${item.name}`} name={item.name} duplicate />
        ))}
      </ul>
    </div>
  );
}

function Item({ name, duplicate }: { name: string; duplicate?: boolean }) {
  return (
    <li
      aria-hidden={duplicate ? "true" : undefined}
      className={cn(
        duplicate && styles.duplicate,
        "display-md flex shrink-0 items-center gap-[clamp(1.75rem,3vw,3.25rem)] whitespace-nowrap text-fog/70",
      )}
    >
      {name}
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 shrink-0 rounded-full bg-mint/60"
      />
    </li>
  );
}

export function StackMarquee() {
  return (
    <section
      data-nav-theme="dark"
      aria-labelledby="toolkit-heading"
      className="on-dark grain relative overflow-hidden bg-graphite text-fog"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background:radial-gradient(80%_60%_at_15%_0%,rgba(203,239,174,0.09),transparent_58%)]"
      />

      <div className="shell relative section-pad">
        <div className="grid-12 gap-y-8">
          <div className="col-span-4 md:col-span-8 lg:col-span-6">
            <Eyebrow className="text-fog">The toolkit</Eyebrow>
            <RevealText
              as="h2"
              id="toolkit-heading"
              className="display-lg mt-6 text-bone"
            >
              Modern stack, chosen for the job.
            </RevealText>
          </div>
          <Reveal className="col-span-4 md:col-span-8 lg:col-span-5 lg:col-start-8 lg:self-end">
            <p className="prose-body max-w-[44ch] text-fog/70">
              We choose technology for longevity, performance, and the way your
              product needs to grow—not because it is fashionable.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="relative flex flex-col gap-6 pb-[clamp(2rem,3.5vw,3.5rem)] md:gap-8">
        <Row items={marqueeRowOne} duration="52s" />
        <Row items={marqueeRowTwo} duration="44s" reverse />
      </div>

      <div className="shell relative pb-[clamp(3.5rem,7vw,7rem)]">
        <p className="meta max-w-[52ch] text-fog/45">
          {/* TODO_CONTENT: confirm actual Booklee capabilities before launch. */}
          We only list what we would be happy to be asked about in a first call.
          If something you need is missing, it is worth asking anyway.
        </p>
      </div>
    </section>
  );
}
