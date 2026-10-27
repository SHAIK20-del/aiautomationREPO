import Link from "next/link";
import { ArrowDown, ArrowUpRight, Plus, MoveUpRight } from "lucide-react";
import { Scene } from "@/components/three/scene";
import { Expertise, WorkflowDemo, Method } from "@/components/experience";
import { Gallery } from "@/components/projects/gallery";
import { ContactForm } from "@/components/contact-form";
import {
  projects,
  services,
  homepage,
  settings,
  mediaUrl,
  localDestination,
} from "@/lib/strapi";
export const metadata = { alternates: { canonical: "/" } };
export default async function Home() {
  const [work, expertise, home, studio] = await Promise.all([
    projects(),
    services(),
    homepage(),
    settings(),
  ]);
  const h = home.data;
  const featured = h?.featuredProjects?.filter((p) => !!p.publishedAt);
  const selected = featured?.length
    ? featured
    : work.data.some((p) => p.featured)
      ? work.data.filter((p) => p.featured)
      : work.data;
  return (
    <main id="main">
      <section className="hero" id="awakening">
        <div className="hero-kicker">
          <span className="status-dot" /> Independent AI & creative technology
          studio
          <span className="hero-edition">An ongoing exploration · Vol. 01</span>
        </div>
        <div className="hero-copy">
          <span className="eyebrow hero-eyebrow">
            {h?.heroEyebrow ?? "Artfully human. Intelligently made."}
          </span>
          <h1>
            {h?.heroHeading ?? (
              <>
                We make
                <br />
                intelligence
                <br />
                feel <em>alive.</em>
                <span className="heading-star">✺</span>
              </>
            )}
          </h1>
          <p>
            {h?.heroDescription ??
              "Thoughtful automations. Expressive digital worlds. We bring imagination and intelligence together to move your business forward."}
          </p>
          <div className="hero-actions">
            <Link
              className="button"
              href={localDestination(h?.primaryCtaDestination, "/#expertise")}
            >
              {h?.primaryCtaLabel ?? "Explore the studio"}{" "}
              <ArrowUpRight size={17} />
            </Link>
            <Link
              className="text-link"
              href={localDestination(h?.secondaryCtaDestination, "/contact")}
            >
              {h?.secondaryCtaLabel ?? "Have an idea?"}{" "}
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
        <div className="hero-art">
          <div className="art-cross cross-one">+</div>
          <div className="art-cross cross-two">+</div>
          <span className="art-coordinate">FIG. 001 / INTELLIGENCE CORE</span>
          <Scene />
          <div className="art-caption">
            <span className="art-caption-line" />
            <span>
              An idea, in a constant
              <br />
              state of becoming.
            </span>
          </div>
          <span className="art-material">PORCELAIN / GLASS / POSSIBILITY</span>
        </div>
        <div className="hero-bottom">
          <a href="#unfolding" className="scroll-cue">
            <ArrowDown size={16} />
            <span>Scroll to unfold</span>
          </a>
          <span>Where imagination becomes intelligence.</span>
          <span className="hero-index">01 — 08</span>
        </div>
      </section>
      <section className="unfolding section-pad" id="unfolding">
        <div className="section-label">
          <span>01 / A different kind of studio</span>
          <Plus size={16} />
        </div>
        <div className="manifesto" data-reveal>
          <span className="eyebrow">
            A little curiosity changes everything.
          </span>
          <h2>
            Every idea begins somewhere.
            <br />
            Every connection creates <em>possibility.</em>
            <br />
            <span>Let’s see what yours can become.</span>
          </h2>
          <div className="manifesto-bottom">
            <span className="tiny-sculpture" aria-hidden="true">
              ✺
            </span>
            <p>
              We live at the intersection of creative instinct and intelligent
              engineering. Making the complex feel natural. And the ordinary
              feel a little extraordinary.
            </p>
          </div>
        </div>
      </section>
      <section className="expertise section-pad" id="expertise">
        <div className="section-label">
          <span>02 / Our expertise</span>
          <Plus size={16} />
        </div>
        <div className="section-heading" data-reveal>
          <h2>
            {h?.expertiseHeading ?? (
              <>
                Different disciplines.
                <br />
                One <em>curious mind.</em>
              </>
            )}
          </h2>
          <p>
            From the invisible systems that make business flow to the
            experiences you can’t look away from.
          </p>
        </div>
        <Expertise content={expertise.data} />
      </section>
      <section className="automation section-pad" id="automation">
        <div className="section-label">
          <span>03 / Intelligence, in motion</span>
          <Plus size={16} />
        </div>
        <div className="section-heading" data-reveal>
          <h2>
            Complex behind the scenes.
            <br />
            <em>Effortless</em> in the everyday.
          </h2>
          <p>
            A small window into how a thoughtful automation turns an everyday
            request into a meaningful action.
          </p>
        </div>
        <WorkflowDemo />
      </section>
      <section className="selected-work section-pad" id="work">
        <div className="section-label">
          <span>04 / Selected work</span>
          <Plus size={16} />
        </div>
        <div className="section-heading" data-reveal>
          <h2>
            {h?.workHeading ?? (
              <>
                Proof in <em>motion.</em>
              </>
            )}
          </h2>
          <p>
            Intelligent systems. Imagined worlds.
            <br />A collection of things made with intention.
          </p>
        </div>
        <Gallery
          projects={selected.map((p) => ({
            ...p,
            image: mediaUrl(p.thumbnail?.url ?? p.coverImage?.url, 1100),
            imageAlt: p.thumbnail?.alternativeText ?? p.title,
          }))}
          state={work.state}
          compact
        />
      </section>
      <section className="process section-pad" id="process">
        <div className="section-label">
          <span>05 / The creative method</span>
          <Plus size={16} />
        </div>
        <div className="section-heading" data-reveal>
          <h2>
            Intuition meets
            <br />
            <em>intention.</em>
          </h2>
          <p>
            Room to explore. A process to get there.
            <br />
            Our best work happens between the two.
          </p>
        </div>
        <Method />
      </section>
      <section className="about section-pad" id="studio">
        <div className="section-label">
          <span>06 / Behind the atelier</span>
          <Plus size={16} />
        </div>
        <div className="about-grid" data-reveal>
          <div className="about-mark" aria-hidden="true">
            <span>a</span>
            <i>✺</i>
            <small>IMAGINATION, ENGINEERED.</small>
          </div>
          <div>
            <span className="eyebrow">
              Independent by nature. Interdisciplinary by design.
            </span>
            <h2>
              A creative mind.
              <br />
              An engineer’s instinct.
              <br />
              <em>No ordinary outcomes.</em>
            </h2>
            <p>
              {studio.data?.brandDescription ??
                "The Living Atelier is an independent practice exploring what happens when AI automation, web engineering, and digital storytelling share the same table."}
            </p>
            <Link href="/studio" className="text-link">
              Meet the studio <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>
      <section className="contact section-pad" id="contact">
        <div className="section-label">
          <span>07 / The next possibility</span>
          <Plus size={16} />
        </div>
        <div className="contact-grid">
          <div>
            <span className="eyebrow">
              A good project starts with a conversation.
            </span>
            <h2>
              {h?.finalCtaText ?? (
                <>
                  Let’s make
                  <br />
                  something
                  <br />
                  <em>extraordinary.</em>
                </>
              )}
            </h2>
            <p>
              An ambitious idea. A process that needs rethinking.
              <br />A story waiting to be told. We’re listening.
            </p>
            <div
              className="final-core-slot"
              role="img"
              aria-label="The Intelligence Core reassembles into a complete sculpture"
            >
              <span aria-hidden="true">✺</span>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
