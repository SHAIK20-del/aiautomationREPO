import { z } from "zod";
export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100),
  email: z.email("Please enter a valid email.").max(254),
  company: z.string().trim().max(160).default(""),
  service: z.enum([
    "AI Workflow Automation",
    "AI Agents",
    "Business Integrations",
    "Web Experiences",
    "AI Film & Video",
    "Motion & 3D",
    "Let’s explore",
  ]),
  estimatedBudget: z.enum([
    "Exploring options",
    "Under $2,500",
    "$2,500–$10,000",
    "$10,000–$25,000",
    "$25,000+",
  ]),
  message: z
    .string()
    .trim()
    .min(20, "Tell us a little more (at least 20 characters).")
    .max(5000),
  website: z.string().max(0).optional(),
});
export type InquiryInput = z.input<typeof inquirySchema>;
export const stages = [
  {
    label: "Input",
    title: "A conversation begins.",
    text: "A customer sends a request. Your system receives the context, securely and in one place.",
  },
  {
    label: "Analyze",
    title: "Find the signal.",
    text: "An intelligent layer organizes the request, identifies intent, and surfaces the information that matters.",
  },
  {
    label: "Decide",
    title: "Choose with intention.",
    text: "Clear rules route the next step. Sensitive or uncertain decisions go to a person for review.",
  },
  {
    label: "Execute",
    title: "Make the right move.",
    text: "An approved workflow takes action across the tools your team already uses.",
  },
  {
    label: "Improve",
    title: "A better next time.",
    text: "Outcomes are recorded and reviewed, helping people refine the system over time.",
  },
];
export const serviceDirections = [
  {
    slug: "ai-workflow-automation",
    title: "AI Workflow Automation",
    shortDescription: "Less repetition. More possibility.",
    iconKey: "workflow",
    detail:
      "Thoughtful workflows that connect your tools, handle repetitive work, and keep people in control. We map the process before engineering the system.",
  },
  {
    slug: "ai-agents",
    title: "AI Agents & Assistants",
    shortDescription: "A new kind of team player.",
    iconKey: "agent",
    detail:
      "Purpose-built assistants that retrieve knowledge, support customers, and help your team make informed decisions, with clear boundaries and human escalation.",
  },
  {
    slug: "business-integrations",
    title: "Business Integrations",
    shortDescription: "Everything, working together.",
    iconKey: "connect",
    detail:
      "Bring fragmented tools into one coherent operation. We connect APIs, synchronize information, and design reliable handoffs between systems.",
  },
  {
    slug: "web-experiences",
    title: "Web Experiences",
    shortDescription: "Digital places worth exploring.",
    iconKey: "web",
    detail:
      "Distinctive websites and web applications that combine expressive design with accessible interfaces and dependable engineering.",
  },
  {
    slug: "ai-film-video",
    title: "AI Film & Video",
    shortDescription: "Stories beyond the expected.",
    iconKey: "film",
    detail:
      "Explore the intersection of narrative and emerging image-making tools, from early visual development to carefully composed cinematic sequences.",
  },
  {
    slug: "motion-3d",
    title: "Motion Design & 3D",
    shortDescription: "Ideas with a life of their own.",
    iconKey: "motion",
    detail:
      "Sculptural digital worlds, expressive typography, and considered motion that make complex ideas tangible.",
  },
];
