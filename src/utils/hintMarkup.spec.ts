import { describe, expect, it } from "vite-plus/test";
import { formatHint } from "./formatHint.ts";
import { HintNode, parseHintMarkup } from "./hintMarkup.ts";

const element = (node: HintNode | undefined) => {
  if (typeof node !== "object") throw new Error("expected an element");
  return node;
};

describe("parseHintMarkup", () => {
  it("keeps mark elements and their class names from formatHint output", () => {
    const nodes = parseHintMarkup(formatHint("Say <reading>にほんご</reading> please"));

    expect(nodes[0]).toBe("Say ");
    const mark = element(nodes[1]);
    expect(mark.tag).toBe("mark");
    expect(mark.className).toBe("bg-gray-500 text-gray-900 px-1 rounded-sm mx-1");
    expect(mark.children).toEqual(["にほんご"]);
    expect(nodes[2]).toBe(" please");
  });

  it("turns newlines from formatHint into line breaks", () => {
    const nodes = parseHintMarkup(formatHint("one\n\ntwo"));
    expect(nodes.map((node) => (typeof node === "string" ? node : node.tag))).toEqual([
      "one",
      "br",
      "two",
    ]);
  });

  it("drops disallowed tags but keeps their text", () => {
    const nodes = parseHintMarkup("<b>bold</b> and <script>alert(1)</script>");
    expect(nodes.every((node) => typeof node === "string")).toBe(true);
    expect(nodes.join("")).toBe("bold and alert(1)");
  });

  it("never copies attributes other than class", () => {
    const nodes = parseHintMarkup("<mark onclick='x()' class='a b'>hi</mark>");
    const mark = element(nodes[0]);
    expect(mark).toEqual({ tag: "mark", className: "a b", children: ["hi"] });
  });

  it("ignores closing tags that were never opened", () => {
    expect(parseHintMarkup("plain</span>text")).toEqual(["plain", "text"]);
  });

  it("closes unterminated elements at the end of the input", () => {
    const nodes = parseHintMarkup("<span class='x'>open");
    expect(element(nodes[0])).toEqual({ tag: "span", className: "x", children: ["open"] });
  });

  it("leaves a bare less-than sign as text", () => {
    expect(parseHintMarkup("1 < 2")).toEqual(["1 < 2"]);
  });
});
