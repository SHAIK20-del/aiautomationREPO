import { ContactForm } from "@/components/contact-form";
import { settings } from "@/lib/strapi";
export const metadata = {
  alternates: { canonical: "/contact" },
  title: "Start a Conversation",
};
export default async function Contact() {
  const { data: s } = await settings();
  return (
    <main id="main" className="inner-page contact-page">
      <section className="contact section-pad">
        <div className="contact-grid">
          <div>
            <span className="eyebrow">Your idea belongs here.</span>
            <h1>
              Let’s make
              <br />
              something
              <br />
              <em>extraordinary.</em>
            </h1>
            <p>
              Tell us what’s on your mind. We’ll explore what’s possible,
              together.
            </p>
            {s?.contactEmail && (
              <a className="text-link" href={`mailto:${s.contactEmail}`}>
                {s.contactEmail} ↗
              </a>
            )}
            <span className="contact-flower" aria-hidden="true">
              ✺
            </span>
          </div>
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
