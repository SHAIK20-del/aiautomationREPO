import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { settings, safeUrl } from "@/lib/strapi";
export async function Footer() {
  const { data: s } = await settings();
  return (
    <footer className="footer">
      <Link href="/" className="footer-brand">
        {s?.studioName ?? "the living atelier"}
      </Link>
      <div className="footer-bottom">
        <p>
          {s?.footerContent ??
            "Independent minds. Extraordinary possibilities."}
        </p>
        <div>
          <Link href="/studio">
            Studio <ArrowUpRight size={12} />
          </Link>
          <Link href="/contact">
            Contact <ArrowUpRight size={12} />
          </Link>
          {[
            ["Instagram", s?.instagram],
            ["YouTube", s?.youtube],
            ["LinkedIn", s?.linkedin],
          ].map(([name, url]) =>
            safeUrl(url) ? (
              <a
                key={name}
                href={safeUrl(url)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {name}
                <ArrowUpRight size={12} />
              </a>
            ) : null,
          )}
          <Link href="/privacy">Privacy</Link>
        </div>
        <span>
          © {new Date().getFullYear()} {s?.studioName ?? "The Living Atelier"}
        </span>
      </div>
    </footer>
  );
}
