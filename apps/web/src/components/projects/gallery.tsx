"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowRight, Layers3 } from "lucide-react";
export type GalleryProject = {
  documentId: string;
  title: string;
  slug: string;
  shortDescription?: string | null;
  category?: { name: string; slug: string } | null;
  image?: string;
  imageAlt?: string;
  projectType?: string | null;
};
const filters = [
  ["All", ""],
  ["AI Automation", "automation"],
  ["Web Experiences", "web"],
  ["AI Films", "film"],
  ["3D Animation", "3d"],
  ["Motion Graphics", "motion"],
  ["Experimental Work", "experimental"],
];
export function Gallery({
  projects,
  state,
  compact = false,
}: {
  projects: GalleryProject[];
  state: string;
  compact?: boolean;
}) {
  const [filter, setFilter] = useState("");
  useEffect(() => {
    const value = new URLSearchParams(location.search).get("category") ?? "";
    if (filters.some(([, v]) => v === value)) setFilter(value);
  }, []);
  const visible = projects.filter((p) => !filter || p.projectType === filter);
  return (
    <>
      <div className="gallery-tools">
        <div className="filters" aria-label="Filter projects">
          {filters.map(([label, value]) => (
            <button
              key={label}
              aria-pressed={filter === value}
              onClick={() => {
                setFilter(value);
                const url = new URL(window.location.href);
                if (value) url.searchParams.set("category", value);
                else url.searchParams.delete("category");
                history.replaceState(null, "", url);
              }}
              className={filter === value ? "active" : ""}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="work-count">
          {String(visible.length).padStart(2, "0")} works
        </span>
      </div>
      {visible.length ? (
        <div className="project-grid">
          {visible.slice(0, compact ? 4 : 100).map((p, i) => (
            <Link
              className="project-card"
              href={`/projects/${p.slug}`}
              key={p.documentId}
            >
              <div className="project-image">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.imageAlt ?? p.title}
                    loading="lazy"
                  />
                ) : (
                  <div className="no-media">
                    <Layers3 size={48} />
                    <span>Media preview unavailable</span>
                  </div>
                )}
                <span className="round-arrow">
                  <ArrowUpRight />
                </span>
                <span className="project-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="project-caption">
                <h3>{p.title}</h3>
                <span>{p.category?.name ?? "Studio project"}</span>
              </div>
              <p>{p.shortDescription}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="gallery-empty">
          <div className="empty-art" aria-hidden="true">
            <i />
            <i />
            <i />
            <span />
          </div>
          <div>
            <span className="eyebrow">The exhibition is taking shape</span>
            <h3>
              {filter
                ? "A little space for what’s next."
                : "Good work deserves a proper debut."}
            </h3>
            <p>
              {state === "unavailable"
                ? "The collection is temporarily unavailable. Please try again a little later."
                : filter
                  ? "There are no published works in this category yet. Explore another direction."
                  : "Our selected-work collection will appear here as projects are published. In the meantime, let’s imagine what we could create together."}
            </p>
            <Link className="text-link" href="/contact">
              Make the next thing with us <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      )}
      {compact && projects.length > 0 && (
        <Link className="text-link" href="/projects">
          View the entire collection <ArrowRight size={18} />
        </Link>
      )}
    </>
  );
}
