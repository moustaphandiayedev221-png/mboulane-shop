import { describe, expect, it } from "vitest"
import { isHexColor, normalizeHexColor } from "./colors"

describe("colors", () => {
  it("reconnaît le hex court et long", () => {
    expect(isHexColor("#abc")).toBe(true)
    expect(isHexColor("#aabbcc")).toBe(true)
    expect(isHexColor("abc")).toBe(false)
  })

  it("normalise le hex en minuscules", () => {
    expect(normalizeHexColor("#ABC")).toBe("#abc")
    expect(normalizeHexColor("#aabbcc")).toBe("#aabbcc")
    expect(normalizeHexColor("nope")).toBeNull()
  })
})
