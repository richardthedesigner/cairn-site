import Image from "next/image";
import type { ReactNode } from "react";

export function SectionLabel({ children, onDark = false }: { children: ReactNode; onDark?: boolean }) {
  return <p className={`mono-label ${onDark ? "text-[#ffad9b]" : "text-copper"}`}>{children}</p>;
}

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`mx-auto w-full max-w-6xl px-5 ${className}`}>
      {children}
    </section>
  );
}

/** Real screenshot in the signature 22px media card. Zero mockups on this site. */
export function Shot({
  src,
  alt,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-media border border-line bg-sunken ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={1440}
        height={900}
        priority={priority}
        sizes="(max-width: 1024px) 100vw, 1024px"
        className="w-full"
      />
    </div>
  );
}

export function CodeSnippet({ children, onDark = false }: { children: string; onDark?: boolean }) {
  return (
    <pre
      className={`overflow-x-auto rounded-lg p-4 font-mono text-[13px] leading-relaxed ${
        onDark
          ? "border border-white/15 bg-black/25 text-[#e6efe9]"
          : "border border-line bg-sunken"
      }`}
    >
      <code>{children}</code>
    </pre>
  );
}
