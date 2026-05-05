import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

// str_replace_editor — in-progress states
test("shows 'Creating' for str_replace_editor create command while in progress", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        state: "input-available",
        input: { command: "create", path: "src/components/Button.tsx" },
      }}
    />
  );
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

test("shows 'Editing' for str_replace_editor str_replace command while in progress", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        state: "input-available",
        input: { command: "str_replace", path: "src/components/Card.tsx" },
      }}
    />
  );
  expect(screen.getByText("Editing Card.tsx")).toBeDefined();
});

test("shows 'Editing' for str_replace_editor insert command while in progress", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        state: "input-available",
        input: { command: "insert", path: "src/utils/helpers.ts" },
      }}
    />
  );
  expect(screen.getByText("Editing helpers.ts")).toBeDefined();
});

test("shows 'Reading' for str_replace_editor view command while in progress", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        state: "input-available",
        input: { command: "view", path: "src/App.tsx" },
      }}
    />
  );
  expect(screen.getByText("Reading App.tsx")).toBeDefined();
});

test("shows 'Reverting' for str_replace_editor undo_edit command while in progress", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        state: "input-available",
        input: { command: "undo_edit", path: "src/index.ts" },
      }}
    />
  );
  expect(screen.getByText("Reverting index.ts")).toBeDefined();
});

// str_replace_editor — done states
test("shows 'Created' for str_replace_editor create command when done", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        state: "output-available",
        input: { command: "create", path: "src/components/Button.tsx" },
        output: "Success",
      }}
    />
  );
  expect(screen.getByText("Created Button.tsx")).toBeDefined();
});

test("shows 'Edited' for str_replace_editor str_replace command when done", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        state: "output-available",
        input: { command: "str_replace", path: "src/components/Card.tsx" },
        output: "Success",
      }}
    />
  );
  expect(screen.getByText("Edited Card.tsx")).toBeDefined();
});

// file_manager commands
test("shows 'Renaming' for file_manager rename command while in progress", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "file_manager",
        state: "input-available",
        input: { command: "rename", path: "src/components/OldName.tsx" },
      }}
    />
  );
  expect(screen.getByText("Renaming OldName.tsx")).toBeDefined();
});

test("shows 'Renamed' for file_manager rename command when done", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "file_manager",
        state: "output-available",
        input: { command: "rename", path: "src/components/OldName.tsx" },
        output: { success: true },
      }}
    />
  );
  expect(screen.getByText("Renamed OldName.tsx")).toBeDefined();
});

test("shows 'Deleting' for file_manager delete command while in progress", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "file_manager",
        state: "input-available",
        input: { command: "delete", path: "src/components/Unused.tsx" },
      }}
    />
  );
  expect(screen.getByText("Deleting Unused.tsx")).toBeDefined();
});

test("shows 'Deleted' for file_manager delete command when done", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "file_manager",
        state: "output-available",
        input: { command: "delete", path: "src/components/Unused.tsx" },
        output: { success: true },
      }}
    />
  );
  expect(screen.getByText("Deleted Unused.tsx")).toBeDefined();
});

// Fallback for unknown tools
test("falls back to tool name for unknown tools", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "unknown_tool",
        state: "input-available",
        input: {},
      }}
    />
  );
  expect(screen.getByText("unknown_tool")).toBeDefined();
});

// Status indicators
test("shows spinner when in progress", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        state: "input-available",
        input: { command: "create", path: "src/Button.tsx" },
      }}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows green dot when done", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        state: "output-available",
        input: { command: "create", path: "src/Button.tsx" },
        output: "Success",
      }}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

// Uses only the filename, not the full path
test("displays only the filename, not the full path", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        state: "input-available",
        input: { command: "create", path: "src/components/deeply/nested/Widget.tsx" },
      }}
    />
  );
  expect(screen.getByText("Creating Widget.tsx")).toBeDefined();
});
