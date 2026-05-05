"use client";

import { Loader2 } from "lucide-react";

interface ToolInvocation {
  toolName: string;
  state: string;
  input?: unknown;
  output?: unknown;
}

interface ToolCallBadgeProps {
  toolInvocation: ToolInvocation;
}

function getFilename(path: unknown): string {
  if (typeof path !== "string" || !path) return "";
  return path.split("/").pop() ?? path;
}

function getArgs(input: unknown): Record<string, unknown> {
  if (input && typeof input === "object") return input as Record<string, unknown>;
  if (typeof input === "string") {
    try { return JSON.parse(input); } catch { return {}; }
  }
  return {};
}

function getLabel(toolName: string, args: Record<string, unknown>, done: boolean): string {
  const filename = getFilename(args.path);

  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":
        return done ? `Created ${filename}` : `Creating ${filename}`;
      case "str_replace":
      case "insert":
        return done ? `Edited ${filename}` : `Editing ${filename}`;
      case "view":
        return done ? `Read ${filename}` : `Reading ${filename}`;
      case "undo_edit":
        return done ? `Reverted ${filename}` : `Reverting ${filename}`;
      default:
        return done ? `Edited ${filename}` : `Editing ${filename}`;
    }
  }

  if (toolName === "file_manager") {
    switch (args.command) {
      case "rename":
        return done ? `Renamed ${filename}` : `Renaming ${filename}`;
      case "delete":
        return done ? `Deleted ${filename}` : `Deleting ${filename}`;
      default:
        return done ? `Managed ${filename}` : `Managing ${filename}`;
    }
  }

  return toolName;
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const { toolName, state, input, output } = toolInvocation;
  const args = getArgs(input);
  const done = state === "output-available" && output != null;
  const label = getLabel(toolName, args, done);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {done ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
