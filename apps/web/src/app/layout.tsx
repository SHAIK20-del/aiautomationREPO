import { settings, mediaUrl } from "@/lib/strapi";
import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Animation } from "@/components/animation";
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "The Living Atelier — Where imagination becomes intelligence",
    template: "%s — The Living Atelier",
  },
  description:
    "An independent AI automation and creative technology studio. Thoughtful systems, expressive digital experiences, and stories beyond the expected.",
  openGraph: {
    type: "website",
    siteName: "The Living Atelier",
    title: "The Living Atelier",
    description: "Where imagination becomes intelligence.",
  },
  robots: { index: true, follow: true },
};
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: s } = await settings();
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Navigation
          studioName={s?.studioName}
          logo={mediaUrl(s?.logo?.url, 120)}
        />
        {children}
        <Footer />
        <Animation />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: s?.studioName ?? "The Living Atelier",
              url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
              description:
                s?.brandDescription ??
                "An independent AI automation and creative technology studio.",
            }).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
