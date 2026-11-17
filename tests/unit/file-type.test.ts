import { describe, expect, it } from "vitest";
import { detectFile, extensionStatus } from "@/features/tools/file-type/detect";

describe("content-based file detection", () => {
  it.each(["wrong.txt", "no-extension"])(
    "ignores name and MIME for %s",
    async (name) => {
      const file = new File(["%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF"], name, {
        type: "image/png",
      });
      expect(await detectFile(file)).toMatchObject({
        kind: "signature",
        ext: "pdf",
        mime: "application/pdf",
      });
    },
  );
  it("recognizes PNG content", async () => {
    const data = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZuoAAAAASUVORK5CYII=",
      "base64",
    );
    expect(await detectFile(new Blob([data]))).toMatchObject({ ext: "png" });
  });
  it("handles empty and unknown binary files without guessing", async () => {
    expect(await detectFile(new Blob([]))).toEqual({ kind: "empty" });
    expect(
      await detectFile(new Blob([new Uint8Array([0, 1, 2, 3, 255])])),
    ).toEqual({ kind: "unknown" });
    expect(
      await detectFile(new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])])),
    ).toEqual({ kind: "unknown" });
  });
  it("labels JSON and Unicode text as estimates", async () => {
    expect(await detectFile(new Blob(['{"hello":"世界"}']))).toMatchObject({
      kind: "text",
      ext: "json",
    });
    expect(await detectFile(new Blob(["你好，世界 👋"]))).toMatchObject({
      kind: "text",
      ext: "txt",
    });
  });
  it("does not reject UTF-8 characters cut at the sample boundary", async () => {
    expect(
      await detectFile(new Blob(["a".repeat(65535), "你好"])),
    ).toMatchObject({ kind: "text", ext: "txt" });
  });
  it("compares extensions conservatively, including aliases", () => {
    const jpg = { kind: "signature", ext: "jpg", mime: "image/jpeg" } as const;
    expect(extensionStatus("photo.JPEG", jpg)).toBe("match");
    expect(extensionStatus("photo.txt", jpg)).toBe("mismatch");
    expect(extensionStatus("photo", jpg)).toBe("missing");
    expect(extensionStatus(".hidden", jpg)).toBe("missing");
    expect(extensionStatus("script.py", { kind: "text", ext: "txt" })).toBe(
      "uncertain",
    );
  });
});
