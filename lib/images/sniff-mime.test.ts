import { describe, expect, it } from "vitest"
import { sniffImageMime } from "@/lib/images/sniff-mime"

describe("sniffImageMime", () => {
  it("détecte PNG, JPEG, GIF, WebP", () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    expect(sniffImageMime(png)).toBe("image/png")

    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0])
    expect(sniffImageMime(jpeg)).toBe("image/jpeg")

    const gif = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
    expect(sniffImageMime(gif)).toBe("image/gif")

    const webp = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    ])
    expect(sniffImageMime(webp)).toBe("image/webp")
  })

  it("retourne null pour octets inconnus", () => {
    expect(sniffImageMime(new Uint8Array([0, 1, 2]))).toBeNull()
  })
})
