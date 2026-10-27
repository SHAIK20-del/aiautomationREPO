"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  MoveUpRight,
  Workflow,
  Orbit,
  Braces,
  Film,
  Boxes,
  Network,
  Check,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { serviceDirections, stages } from "@atelier/shared";
import type { Service } from "@/lib/strapi";
const icons = [Workflow, Orbit, Network, Braces, Film, Boxes];
export function Expertise({ content = [] }: { content?: Service[] }) {
  const [active, setActive] = useState(0);
  const items = content.length
    ? content.map((s) => ({ ...s, detail: s.shortDescription ?? "" }))
    : serviceDirections;
  const item = items[active] ?? items[0];
  return (
    <div className="expertise-grid">
      <div className="service-list" role="tablist" aria-label="Expertise">
        {items.map((s, i) => {
          const Icon = icons[i % icons.length];
          return (
            <button
              key={s.slug}
              id={`service-tab-${i}`}
              role="tab"
              aria-selected={active === i}
              aria-controls="service-panel"
              tabIndex={active === i ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => {
                if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
                  e.preventDefault();
                  const n =
                    e.key === "Home"
                      ? 0
                      : e.key === "End"
                        ? items.length - 1
                        : (active +
                            (e.key === "ArrowDown" ? 1 : -1) +
                            items.length) %
                          items.length;
                  setActive(n);
                  document.getElementById(`service-tab-${n}`)?.focus();
                }
              }}
              className={active === i ? "active" : ""}
            >
              <small>0{i + 1}</small>
              <Icon size={20} />
              <span>{s.title}</span>
              <ArrowUpRight size={22} />
            </button>
          );
        })}
      </div>
      <div
        className="service-panel"
        id="service-panel"
        role="tabpanel"
        aria-labelledby={`service-tab-${active}`}
      >
        <div className={`service-art art-${active}`} aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <span />
        </div>
        <span className="eyebrow">
          Considered systems. Meaningful outcomes.
        </span>
        <h3>{item.shortDescription}</h3>
        <p>{item.detail}</p>
        <Link className="text-link" href={`/services/${item.slug}`}>
          Explore the possibilities <ArrowUpRight size={18} />
        </Link>
      </div>
    </div>
  );
}
export function WorkflowDemo() {
  const [active, setActive] = useState(0);
  return (
    <div className="workflow-demo">
      <div
        className="workflow-nodes"
        role="tablist"
        aria-label="Conceptual workflow stages"
      >
        {stages.map((s, i) => (
          <button
            id={`workflow-${i}`}
            key={s.label}
            role="tab"
            aria-selected={active === i}
            aria-controls="workflow-description"
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
                e.preventDefault();
                const n = (active + (e.key === "ArrowRight" ? 1 : -1) + 5) % 5;
                setActive(n);
                document.getElementById(`workflow-${n}`)?.focus();
              }
            }}
            className={active === i ? "active" : ""}
          >
            <span className="node-shape">
              {i === 0 ? (
                <span>+</span>
              ) : i === 4 ? (
                <Check />
              ) : (
                <span className={`mini-node mini-${i}`} />
              )}
            </span>
            <span>
              <small>0{i + 1}</small>
              {s.label}
            </span>
          </button>
        ))}
      </div>
      <div
        className="workflow-description"
        id="workflow-description"
        role="tabpanel"
        aria-labelledby={`workflow-${active}`}
      >
        <span className="eyebrow">
          {active === 2
            ? "Human judgment, built in"
            : "An idea of what’s possible"}
        </span>
        <h3>{stages[active].title}</h3>
        <p>{stages[active].text}</p>
        <span className="demo-note">
          <span /> Interactive concept · no live integrations
        </span>
      </div>
    </div>
  );
}
export function Method() {
  const [active, setActive] = useState(0);
  const steps = [
    [
      "Discover",
      "Ask better questions.",
      "We listen closely, map the challenge, and uncover the opportunity worth pursuing.",
    ],
    [
      "Design",
      "Give possibility a shape.",
      "From systems to storyboards, we make the idea tangible before writing the first line.",
    ],
    [
      "Engineer",
      "Make the idea work.",
      "We build with care, connecting dependable technology with thoughtful human experiences.",
    ],
    [
      "Refine",
      "Every detail earns its place.",
      "Testing, iteration, and honest feedback turn a promising idea into a considered result.",
    ],
    [
      "Launch",
      "A beginning, not an ending.",
      "We release deliberately, document the system, and help you find what comes next.",
    ],
  ];
  return (
    <div className="method-grid">
      <div className="method-art" aria-hidden="true">
        {steps.map((_, i) => (
          <i
            key={i}
            style={{
              transform: `translateY(${(4 - i) * 22}px) rotate(-28deg)`,
              opacity: i <= active ? 1 : 0.15,
            }}
          />
        ))}
      </div>
      <div className="method-steps">
        {steps.map(([title, heading, text], i) => (
          <div className={active === i ? "active" : ""} key={title}>
            <button aria-expanded={active === i} onClick={() => setActive(i)}>
              <small>0{i + 1}</small>
              {title}
              <span>{active === i ? "−" : "+"}</span>
            </button>
            {active === i && (
              <div>
                <h3>{heading}</h3>
                <p>{text}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
