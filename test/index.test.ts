import {describe, it, expect} from "vitest";
import {reinterpret, unescape} from "../src";

describe("reinterpret", () => {
  it("does not modify a string without unicode", () => {
    expect(reinterpret("hello world!")).toBe("hello world!");
  });

  it("does not modify a string with valid unicode", () => {
    expect(reinterpret("don’t")).toBe("don’t");
    expect(reinterpret("hello 🎻!")).toBe("hello 🎻!");

    // escaped
    expect(reinterpret("don\u2019t")).toBe("don’t");
    expect(reinterpret("hello \u{1F3BB}!")).toBe("hello 🎻!");
  });

  it("does not modify a string with valid escaped unicode", () => {
    expect(reinterpret("hello\\u0020world!")).toBe("hello\\u0020world!");
    expect(reinterpret("hello\\u0020\\u0020world!")).toBe("hello\\u0020\\u0020world!");
    // technically, this is also valid, but it fails our heuristic
    expect(reinterpret("hello\\u0020\\u0020\\u0020world!")).not.toBe(
      "hello\\u0020\\u0020\\u0020world!"
    );

    expect(reinterpret("don\\u2019t")).toBe("don\\u2019t");
    expect(reinterpret("hello \\uD834\\uDF06!")).toBe("hello \\uD834\\uDF06!");

    // codepoint
    expect(reinterpret("hello \\u{1F3BB}!")).toBe("hello \\u{1F3BB}!");
  });

  it("fixes a string with broken escaped unicode", () => {
    expect(reinterpret("don\\u00e2\\u0080\\u0099t")).toBe("don\\u2019t");
    expect(reinterpret("hello \\u00f0\\u009f\\u008e\\u00bb!")).toBe("hello \\u{1f3bb}!");

    // uppercase hex
    expect(reinterpret("don\\u00E2\\u0080\\u0099t")).toBe("don\\u2019t");
  });
});

describe("unescape", () => {
  it("does not modify a string without unicode", () => {
    expect(unescape("hello world!")).toBe("hello world!");
  });

  it("does not modify a string with valid unicode", () => {
    expect(unescape("don’t")).toBe("don’t");
    expect(unescape("hello 🎻!")).toBe("hello 🎻!");

    // escaped
    expect(unescape("don\u2019t")).toBe("don’t");
    expect(unescape("hello \u{1F3BB}!")).toBe("hello 🎻!");
  });

  it("resolves valid escaped unicode", () => {
    expect(unescape("hello\\u0020world!")).toBe("hello world!");
    expect(unescape("hello\\u0020\\u0020world!")).toBe("hello  world!");

    expect(unescape("don\\u2019t")).toBe("don’t");
    expect(unescape("hello \\uD83C\\uDFBB!")).toBe("hello 🎻!");

    // codepoint
    expect(unescape("hello \\u{1F3BB}!")).toBe("hello 🎻!");
  });

  it("fixes and resolves broken escaped unicode", () => {
    expect(unescape("don\\u00e2\\u0080\\u0099t")).toBe("don’t");
    expect(unescape("hello \\u00f0\\u009f\\u008e\\u00bb!")).toBe("hello 🎻!");

    // uppercase hex
    expect(unescape("don\\u00E2\\u0080\\u0099t")).toBe("don’t");
  });
});
