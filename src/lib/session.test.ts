import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ headers: vi.fn() }));

vi.mock("@/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}));

import { auth } from "@/auth";
import { requireUser } from "./session";

const getSession = auth.api.getSession as unknown as {
  mockResolvedValue(v: { user: { id: string; name: string; email: string } } | null): void;
};

describe("session guard", () => {
  it("throws UNAUTHORIZED when logged out", async () => {
    getSession.mockResolvedValue(null);
    await expect(requireUser()).rejects.toThrow("UNAUTHORIZED");
  });
  it("returns the user when logged in", async () => {
    const user = { id: "u1", name: "T", email: "t@t.t" };
    getSession.mockResolvedValue({ user });
    await expect(requireUser()).resolves.toEqual(user);
  });
});
