import { describe, expect, it } from "vitest";
import * as s from "./schema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const name = (t: any) => t[Symbol.for("drizzle:Name")];

describe("schema", () => {
  it("notes has userId FK column", () => {
    expect(s.notes.userId.name).toBe("user_id");
    expect(s.notes.shareToken.name).toBe("share_token");
  });
  it("has all core tables", () => {
    expect([
      name(s.users), name(s.sessions), name(s.accounts), name(s.verifications),
      name(s.notes), name(s.tags), name(s.noteTags), name(s.tasks),
      name(s.focusSessions), name(s.templates), name(s.aiKeys), name(s.images), name(s.digests),
    ]).toEqual([
      "user", "session", "account", "verification",
      "notes", "tags", "note_tags", "tasks",
      "focus_sessions", "templates", "ai_keys", "images", "digests",
    ]);
  });
});
