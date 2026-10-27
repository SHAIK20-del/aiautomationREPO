export const metadata = {
  alternates: { canonical: "/privacy" },
  title: "Privacy",
};
export default function Privacy() {
  return (
    <main id="main" className="inner-page">
      <article className="privacy page-heading">
        <span className="eyebrow">
          A considered approach to your information
        </span>
        <h1>
          Your idea.
          <br />
          <em>Your privacy.</em>
        </h1>
        <h2>Project inquiries</h2>
        <p>
          When you send an inquiry, we store your name, email, company,
          requested service, budget range, and message to respond and manage the
          conversation. These records are held in a private application database
          and are not published.
        </p>
        <h2>Security and essential cookies</h2>
        <p>
          We use a one-way identifier derived from connection information to
          limit abuse. Private operations and CMS preview sessions use essential
          cookies. We do not use advertising trackers. The interactive workflow
          demonstration does not store events.
        </p>
        <h2>Service providers</h2>
        <p>
          The application is designed to use Neon for database storage, Strapi
          for editorial management, and ImageKit for media delivery. Hosting
          providers process necessary connection information. Personal inquiry
          content is not sent to an AI model.
        </p>
        <h2>Your choices</h2>
        <p>
          To request access to or removal of information, contact the studio
          using the published contact details. This notice must be reviewed
          alongside the actual hosting region, retention policy, and studio
          contact details before public launch.
        </p>
      </article>
    </main>
  );
}
