/**
 * Flatten a Lit TemplateResult tree into its literal text. Enough to assert
 * which branches a render produced without pulling in a DOM renderer.
 */
export function renderedText(node: any): string {
  if (node === null || node === undefined || typeof node === "function") {
    return "";
  }
  if (Array.isArray(node)) {
    return node.map(renderedText).join("");
  }
  if (typeof node === "object" && "strings" in node && "values" in node) {
    return (node.strings as string[])
      .map((part, index) => part + renderedText(node.values[index]))
      .join("");
  }
  if (typeof node === "symbol") {
    return "";
  }
  return String(node);
}
