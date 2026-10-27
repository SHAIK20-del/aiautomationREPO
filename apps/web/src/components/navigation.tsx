"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
const links = [
  ["Studio", "/studio"],
  ["Expertise", "/services"],
  ["Work", "/projects"],
  ["Process", "/#process"],
];
export function Navigation({
  studioName,
  logo,
}: {
  studioName?: string | null;
  logo?: string;
}) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  return (
    <>
      <header className="site-header">
        <Link
          href="/"
          className="brand"
          aria-label={`${studioName ?? "The Living Atelier"} home`}
        >
          {logo ? (
            <img
              className="brand-logo"
              src={logo}
              alt=""
              width={48}
              height={48}
            />
          ) : (
            <span className="brand-symbol">
              a<span>✺</span>
            </span>
          )}
          <span>
            {studioName ?? (
              <>
                the living
                <br />
                <b>atelier.</b>
              </>
            )}
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([name, href]) => (
            <Link href={href} key={name}>
              {name}
            </Link>
          ))}
        </nav>
        <Link href="/contact" className="header-cta">
          Let’s talk <ArrowUpRight size={16} />
        </Link>
        <button
          className="menu-button"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <Menu />
        </button>
      </header>
      <dialog
        className="menu-dialog"
        ref={dialog}
        onCancel={() => setOpen(false)}
      >
        <div className="menu-top">
          <span className="eyebrow">Explore the atelier</span>
          <button aria-label="Close menu" onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>
        <nav>
          {[...links, ["Contact", "/contact"]].map(([name, href], i) => (
            <Link key={name} href={href} onClick={() => setOpen(false)}>
              <small>0{i + 1}</small>
              {name}
              <ArrowUpRight />
            </Link>
          ))}
        </nav>
        <p>Where imagination becomes intelligence.</p>
      </dialog>
    </>
  );
}
