export const AGENT_STATUSES = [
  "queued",
  "drafted",
  "failed",
  "ignored",
] as const;

export type AgentStatus = (typeof AGENT_STATUSES)[number];

export type InboxAgentChannel = "email" | "comment";

export function isAgentStatus(value: unknown): value is AgentStatus {
  return (
    typeof value === "string" &&
    (AGENT_STATUSES as readonly string[]).includes(value)
  );
}
