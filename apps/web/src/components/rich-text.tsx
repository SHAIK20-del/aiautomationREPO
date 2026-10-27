import type { Blocks } from "@/lib/strapi";
export function RichText({ blocks }: { blocks?: Blocks | null }) {
  return (
    <div className="rich-text">
      {blocks?.map((b, i) => {
        const text = b.children?.map((c, j) =>
          c.bold ? (
            <strong key={j}>{c.text}</strong>
          ) : c.italic ? (
            <em key={j}>{c.text}</em>
          ) : (
            <span key={j}>{c.text}</span>
          ),
        );
        return b.type === "heading" ? (
          <h3 key={i}>{text}</h3>
        ) : (
          <p key={i}>{text}</p>
        );
      })}
    </div>
  );
}
