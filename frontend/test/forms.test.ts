import { describe, expect, it } from "vitest";

import { cardForm, tileForm } from "../src/forms";

/** Every named field in a form schema, through grids and expandables. */
function fieldNames(schema: readonly any[]): string[] {
  return schema.flatMap((item) =>
    item.type === "grid" || item.type === "expandable"
      ? fieldNames(item.schema)
      : [item.name],
  );
}

function fields(schema: readonly any[]): any[] {
  return schema.flatMap((item) =>
    item.type === "grid" || item.type === "expandable" ? fields(item.schema) : [item],
  );
}

const CARD_KEYS = [
  "title",
  "layout",
  "speaker_picker",
  "recent_messages",
  "volume_control",
  "speakers",
  "selected",
  "record_mode",
  "max_duration",
  "mode",
];

const TILE_KEYS = ["name", "speakers", "shape", "max_duration", "mode"];

describe.each([
  ["card", cardForm, CARD_KEYS],
  ["tile", tileForm, TILE_KEYS],
])("the %s form", (_, form, keys) => {
  it("has exactly one field per config key", () => {
    expect([...fieldNames(form.schema)].sort()).toEqual([...keys].sort());
  });

  it("labels every field", () => {
    for (const field of fields(form.schema)) {
      expect(form.computeLabel(field), field.name).toBeTruthy();
    }
  });

  it("keeps sections flat, so their fields write top-level keys", () => {
    for (const item of form.schema as readonly any[]) {
      if (item.type === "expandable" || item.type === "grid") {
        expect(item.flatten, item.title).toBe(true);
      }
    }
  });

  it("only offers media players for speakers", () => {
    const speakerFields = fields(form.schema).filter((f) => f.selector?.entity);
    expect(speakerFields.length).toBeGreaterThan(0);
    for (const field of speakerFields) {
      expect(field.selector.entity).toMatchObject({
        multiple: true,
        filter: { domain: "media_player" },
      });
    }
  });
});

describe("the card form", () => {
  it("offers the speaker picker style only in the full layout", () => {
    const picker = fields(cardForm.schema).find((f) => f.name === "speaker_picker");
    expect(picker.visible).toEqual({ field: "layout", value: "full" });
  });

  it("draws every picture option in both themes", () => {
    const pictured = fields(cardForm.schema).flatMap(
      (f) => f.selector?.select?.options?.filter((o: any) => o.image) ?? [],
    );
    expect(pictured.length).toBe(5);
    for (const option of pictured) {
      expect(option.image.src).toMatch(/^data:image\/svg\+xml,/);
      expect(option.image.src_dark).toMatch(/^data:image\/svg\+xml,/);
      expect(option.image.src_dark).not.toBe(option.image.src);
    }
  });
});
