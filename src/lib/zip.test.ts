import { describe, expect, it } from "vitest";
import { sanitizeFilename, noteTitleFromFile } from "./zip";

describe("zip helpers", () => {
  it("sanitizes filenames", () => {
    expect(sanitizeFilename("My: Note / ?")).toBe("My_ Note _ _");
  });
  it("titles from first heading or filename", () => {
    expect(noteTitleFromFile("# Hello", "file.md")).toBe("Hello");
    expect(noteTitleFromFile("plain", "file.md")).toBe("file");
  });
});
