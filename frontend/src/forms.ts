/**
 * The editor forms, as `getConfigForm()` schemas: Home Assistant renders them
 * with its own form and selectors, so the editors look and theme like the
 * built-in cards' and there is no editor element of ours to maintain.
 *
 * Every field is a top-level config key (sections are flattened), and each
 * config key in `config.ts` has exactly one field — `forms.test.ts` holds both
 * of those to account.
 */

/** A schematic thumbnail, drawn once per theme. `$g`/`$r`/`$b` are colours. */
function picture(body: string) {
  const draw = (dark: boolean) => {
    const colours = dark
      ? { bg: "#2b2b2b", g: "#5f6368", r: "#e2574c", b: "#4fa3e0" }
      : { bg: "#eef0f3", g: "#c4cbd4", r: "#db4437", b: "#039be5" };
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 64" width="120" height="64">` +
      `<rect width="120" height="64" rx="6" fill="${colours.bg}"/>` +
      body
        .replace(/\$g/g, colours.g)
        .replace(/\$r/g, colours.r)
        .replace(/\$b/g, colours.b) +
      `</svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  };
  return { src: draw(false), src_dark: draw(true) };
}

const PICTURES = {
  full: picture(
    `<rect x="14" y="9" width="40" height="5" rx="2.5" fill="$g"/><circle cx="96" cy="11.5" r="3" fill="$g"/><circle cx="105" cy="11.5" r="3" fill="$g"/><circle cx="60" cy="32" r="11" fill="$r"/><circle cx="84" cy="32" r="5" fill="$g"/><rect x="42" y="50" width="36" height="7" rx="3.5" fill="$g"/>`,
  ),
  compact: picture(
    `<circle cx="26" cy="32" r="12" fill="$r"/><rect x="46" y="20" width="40" height="5" rx="2.5" fill="$g"/><rect x="104" y="18" width="3" height="9" rx="1.5" fill="$g"/><rect x="46" y="36" width="42" height="9" rx="4.5" fill="$g"/><rect x="92" y="36" width="18" height="9" rx="4.5" fill="$b"/>`,
  ),
  dropdown: picture(
    `<rect x="28" y="24" width="64" height="16" rx="8" fill="none" stroke="$g" stroke-width="2"/><rect x="36" y="30" width="34" height="4" rx="2" fill="$g"/><path d="M78 30l4 4 4-4" stroke="$g" stroke-width="2" fill="none"/>`,
  ),
  chips: picture(
    `<rect x="14" y="25" width="30" height="14" rx="7" fill="$b"/><rect x="48" y="25" width="26" height="14" rx="7" fill="$g"/><rect x="78" y="25" width="28" height="14" rx="7" fill="$b"/>`,
  ),
  list: picture(
    `<rect x="22" y="14" width="66" height="5" rx="2.5" fill="$g"/><rect x="94" y="13" width="7" height="7" rx="1.5" fill="$b"/><rect x="22" y="29" width="66" height="5" rx="2.5" fill="$g"/><rect x="94" y="28" width="7" height="7" rx="1.5" fill="$g"/><rect x="22" y="44" width="66" height="5" rx="2.5" fill="$g"/><rect x="94" y="43" width="7" height="7" rx="1.5" fill="$b"/>`,
  ),
  square: picture(
    `<rect x="38" y="6" width="44" height="52" rx="6" fill="none" stroke="$g" stroke-width="2"/><circle cx="60" cy="26" r="10" fill="$r"/><rect x="47" y="43" width="26" height="5" rx="2.5" fill="$g"/>`,
  ),
  horizontal: picture(
    `<rect x="12" y="18" width="96" height="28" rx="6" fill="none" stroke="$g" stroke-width="2"/><circle cx="30" cy="32" r="9" fill="$r"/><rect x="46" y="26" width="36" height="5" rx="2.5" fill="$g"/><rect x="46" y="35" width="24" height="4" rx="2" fill="$g"/>`,
  ),
};

const speakersField = (name: string) => ({
  name,
  selector: { entity: { multiple: true, filter: { domain: "media_player" } } },
});

const timeLimitField = {
  name: "max_duration",
  selector: {
    number: { min: 5, max: 300, step: 5, mode: "slider", unit_of_measurement: "s" },
  },
};

const noiseSuppressionField = { name: "noise_suppression", selector: { boolean: {} } };

/** Helper text, only where a field's label cannot carry its meaning. */
const HELPERS: Record<string, string> = {
  title: "Leave empty for “Voice Broadcast”",
  name: "Leave empty for “Voice Broadcast”",
  noise_suppression:
    "Filters out background noise such as a TV or fan. Leave it off in a quiet room: it can make a voice sound slightly processed.",
};

const helper = (field: { name: string }) => HELPERS[field.name];

const playbackSection = {
  type: "expandable",
  name: "",
  flatten: true,
  title: "Playback",
  icon: "mdi:volume-high",
  schema: [
    {
      name: "mode",
      selector: {
        select: {
          mode: "box",
          box_max_columns: 1,
          options: [
            { value: "plain", label: "Just play it", description: "Interrupts whatever is playing" },
            { value: "chime", label: "Chime first", description: "A short tone, then the message" },
            {
              value: "restore",
              label: "Pause, then resume",
              description: "Puts back what was playing and its volume",
            },
          ],
        },
      },
    },
  ],
};

const LABELS: Record<string, string> = {
  title: "Name",
  name: "Name",
  layout: "Layout",
  speaker_picker: "Speaker picker",
  recent_messages: "Recent messages",
  volume_control: "Volume control",
  speakers: "Speakers on the card",
  selected: "Selected when the card opens",
  record_mode: "Recording",
  max_duration: "Time limit",
  noise_suppression: "Noise suppression",
  mode: "When it plays",
  shape: "Shape",
};

const label = (field: { name: string }) => LABELS[field.name];

export const cardForm = {
  schema: [
    { name: "title", selector: { text: {} } },
    {
      type: "expandable",
      name: "",
      flatten: true,
      title: "Appearance",
      icon: "mdi:palette-outline",
      expanded: true,
      schema: [
        {
          name: "layout",
          selector: {
            select: {
              mode: "box",
              options: [
                { value: "full", label: "Full", image: PICTURES.full },
                { value: "compact", label: "Compact", image: PICTURES.compact },
              ],
            },
          },
        },
        {
          name: "speaker_picker",
          // Compact always draws the dropdown. Home Assistant before 2026.8
          // ignores `visible` and shows the field anyway, which is harmless.
          visible: { field: "layout", value: "full" },
          selector: {
            select: {
              mode: "box",
              options: [
                { value: "dropdown", label: "Dropdown", image: PICTURES.dropdown },
                { value: "chips", label: "Chips", image: PICTURES.chips },
                { value: "list", label: "List", image: PICTURES.list },
              ],
            },
          },
        },
        {
          name: "recent_messages",
          selector: {
            select: {
              mode: "dropdown",
              options: [
                { value: "off", label: "Off" },
                { value: "button", label: "Button in the header" },
                { value: "list", label: "List below the card" },
              ],
            },
          },
        },
        { name: "volume_control", selector: { boolean: {} } },
      ],
    },
    {
      type: "expandable",
      name: "",
      flatten: true,
      title: "Speakers",
      icon: "mdi:speaker",
      expanded: true,
      schema: [speakersField("speakers"), speakersField("selected")],
    },
    {
      type: "expandable",
      name: "",
      flatten: true,
      title: "Recording",
      icon: "mdi:microphone",
      schema: [
        {
          name: "record_mode",
          selector: {
            select: {
              mode: "box",
              options: [
                {
                  value: "push_to_talk",
                  label: "Hold to talk",
                  description: "Records while the button is held",
                },
                {
                  value: "start_stop",
                  label: "Tap to start and stop",
                  description: "Tap once to start, again to stop",
                },
              ],
            },
          },
        },
        timeLimitField,
        noiseSuppressionField,
      ],
    },
    playbackSection,
  ],
  computeLabel: label,
  computeHelper: helper,
};

export const tileForm = {
  schema: [
    { name: "name", selector: { text: {} } },
    {
      type: "expandable",
      name: "",
      flatten: true,
      title: "Speakers",
      icon: "mdi:speaker",
      expanded: true,
      schema: [speakersField("speakers")],
    },
    {
      type: "expandable",
      name: "",
      flatten: true,
      title: "Appearance",
      icon: "mdi:palette-outline",
      expanded: true,
      schema: [
        {
          name: "shape",
          selector: {
            select: {
              mode: "box",
              options: [
                { value: "square", label: "Square", image: PICTURES.square },
                { value: "horizontal", label: "Horizontal", image: PICTURES.horizontal },
              ],
            },
          },
        },
      ],
    },
    {
      type: "expandable",
      name: "",
      flatten: true,
      title: "Recording",
      icon: "mdi:microphone",
      schema: [timeLimitField, noiseSuppressionField],
    },
    playbackSection,
  ],
  computeLabel: (field: { name: string }) =>
    field.name === "speakers" ? "Sends to" : label(field),
  computeHelper: helper,
};
