import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="not-found">
      <span className="eyebrow">404 / An unexplored corner</span>
      <h1>
        This possibility
        <br />
        hasn’t taken <em>shape.</em>
      </h1>
      <p>The page may have moved, or this project hasn’t been published.</p>
      <Link className="button" href="/">
        Back to the atelier ↗
      </Link>
    </main>
  );
}
