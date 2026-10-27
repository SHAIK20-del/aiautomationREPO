"use client";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="not-found">
      <h1>
        A moment
        <br />
        to <em>reconnect.</em>
      </h1>
      <p>Something interrupted this page. Please try again.</p>
      <button className="button" onClick={reset}>
        Try again ↗
      </button>
    </main>
  );
}
