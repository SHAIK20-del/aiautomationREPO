export const metadata = {
  title: "Private Operations",
  robots: { index: false, follow: false },
};
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main id="main" className="operations">
      <div className="ops-login">
        <span className="eyebrow">Private / Studio owner</span>
        <h1>Studio operations.</h1>
        <p>
          Inquiry management is separate from the project CMS. Only the studio
          owner can sign in.
        </p>
        <form method="POST" action="/api/operations/login">
          <label>
            Owner password
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              maxLength={256}
            />
          </label>
          {error && <p role="alert">The password was not recognized.</p>}
          <button className="button">Sign in ↗</button>
        </form>
      </div>
    </main>
  );
}
