import { describe, expect, it } from "vitest";

process.env.ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

const { decrypt, encrypt } = await import("./crypto");

describe("crypto", () => {
  it("round-trips", () => {
    const plain = "sk-abc123";
    expect(decrypt(encrypt(plain))).toBe(plain);
  });
  it("is non-deterministic", () => {
    expect(encrypt("x")).not.toBe(encrypt("x"));
  });
});
