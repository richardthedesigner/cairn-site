import Link from "next/link";
import { Mark } from "@/components/Mark";
import { nav, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-[#17171c] text-white">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <Mark size={22} />
              <span className="font-display text-xl font-medium tracking-tight">Cairn</span>
            </div>
            <p className="mt-5 max-w-md text-sm leading-relaxed opacity-70">{site.nameStory}</p>
          </div>
          <nav aria-label="Footer">
            <p className="mono-label opacity-60">Site</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="opacity-70 transition-opacity hover:opacity-100">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/demo" className="opacity-70 transition-opacity hover:opacity-100">
                  Live demo
                </Link>
              </li>
            </ul>
          </nav>
          <div>
            <p className="mono-label opacity-60">Elsewhere</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href={site.productRepo} className="opacity-70 transition-opacity hover:opacity-100">
                  GitHub
                </a>
              </li>
              <li>
                <Link href="/docs" className="opacity-70 transition-opacity hover:opacity-100">
                  Quickstart
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-14 border-t border-white/10 pt-6 text-xs opacity-50">
          Built for the age of machine-made documents.
        </p>
      </div>
    </footer>
  );
}
