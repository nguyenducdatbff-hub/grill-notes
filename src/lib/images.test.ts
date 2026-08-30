import { describe, expect, it } from "vitest";
import { ImageUploadError, validateImage } from "./images";

describe("validateImage", () => {
  it("accepts png under 5MB", () => {
    expect(validateImage("image/png", 1024)).toBeNull();
  });
  it("rejects non-image and oversized", () => {
    expect(validateImage("text/html", 10)).toBeInstanceOf(ImageUploadError);
    expect(validateImage("image/png", 6 * 1024 * 1024)).toBeInstanceOf(ImageUploadError);
  });
});
