"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inquirySchema, type InquiryInput } from "@atelier/shared";
import { ArrowUpRight, Check, LoaderCircle } from "lucide-react";
export function ContactForm() {
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      company: "",
      service: "Let’s explore",
      estimatedBudget: "Exploring options",
      website: "",
    },
  });
  async function submit(data: InquiryInput) {
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok)
        throw new Error(
          json.error ?? "We couldn’t send your inquiry. Please try again.",
        );
      setStatus("success");
      reset();
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Please try again later.");
    }
  }
  if (status === "success")
    return (
      <div className="form-success" role="status">
        <span>
          <Check size={32} />
        </span>
        <h3>A new possibility begins.</h3>
        <p>
          Your inquiry has been saved. Thank you for sharing your idea with the
          atelier.
        </p>
        <button className="text-link" onClick={() => setStatus("idle")}>
          Send another inquiry <ArrowUpRight size={16} />
        </button>
      </div>
    );
  return (
    <form className="contact-form" onSubmit={handleSubmit(submit)} noValidate>
      <div className="form-row">
        <label>
          Your name <span>*</span>
          <input
            {...register("name")}
            autoComplete="name"
            placeholder="How should we call you?"
            aria-invalid={!!errors.name}
            aria-describedby="name-error"
          />
          <small id="name-error">{errors.name?.message}</small>
        </label>
        <label>
          Email address <span>*</span>
          <input
            {...register("email")}
            autoComplete="email"
            type="email"
            placeholder="you@company.com"
            aria-invalid={!!errors.email}
            aria-describedby="email-error"
          />
          <small id="email-error">{errors.email?.message}</small>
        </label>
      </div>
      <label>
        Company{" "}
        <input
          {...register("company")}
          autoComplete="organization"
          placeholder="Your company or independent practice"
        />
      </label>
      <div className="form-row">
        <label>
          I’m interested in
          <select {...register("service")}>
            {[
              "Let’s explore",
              "AI Workflow Automation",
              "AI Agents",
              "Business Integrations",
              "Web Experiences",
              "AI Film & Video",
              "Motion & 3D",
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Project budget
          <select {...register("estimatedBudget")}>
            {[
              "Exploring options",
              "Under $2,500",
              "$2,500–$10,000",
              "$10,000–$25,000",
              "$25,000+",
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        A little about your idea <span>*</span>
        <textarea
          {...register("message")}
          rows={4}
          placeholder="The challenge, the ambition, the what-if…"
          aria-invalid={!!errors.message}
          aria-describedby="message-error"
        />
        <small id="message-error">{errors.message?.message}</small>
      </label>
      <label className="honeypot" aria-hidden="true">
        Leave this empty
        <input {...register("website")} tabIndex={-1} autoComplete="off" />
      </label>
      <div className="form-submit">
        <p>
          By sending, you agree to our <a href="/privacy">privacy notice</a>.
          <br />
          Your idea stays between us.
        </p>
        <button
          className="button button-light"
          disabled={status === "sending"}
          type="submit"
        >
          {status === "sending" ? (
            <>
              Sending <LoaderCircle className="spin" size={18} />
            </>
          ) : (
            <>
              Send your inquiry <ArrowUpRight size={18} />
            </>
          )}
        </button>
      </div>
      {status === "error" && (
        <p className="form-error" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}
