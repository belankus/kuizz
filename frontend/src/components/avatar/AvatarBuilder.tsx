"use client";
import React, { useCallback, useEffect, useState } from "react";
import { BeanHead } from "beanheads";
import { AvatarModel } from "@repo/types";

// ── Options ──────────────────────────────────────────────────────────────────
const SKIN_TONES: AvatarModel["skinTone"][] = [
  "light",
  "yellow",
  "brown",
  "dark",
  "red",
  "black",
];
const SKIN_COLORS: Record<string, string> = {
  light: "#FFDBB4",
  yellow: "#EDD5A3",
  brown: "#A0522D",
  dark: "#5C3317",
  red: "#FF6347",
  black: "#2B1B17",
};

const EYES: AvatarModel["eyes"][] = [
  "normal",
  "leftTwitch",
  "happy",
  "content",
  "squint",
  "simple",
  "dizzy",
  "wink",
  "heart",
];
const EYEBROWS: AvatarModel["eyebrows"][] = [
  "raised",
  "leftLowered",
  "serious",
  "angry",
  "concerned",
];
const MOUTHS: AvatarModel["mouth"][] = [
  "grin",
  "sad",
  "openSmile",
  "lips",
  "open",
  "serious",
  "tongue",
];
const HAIRS: AvatarModel["hair"][] = [
  "none",
  "long",
  "bun",
  "short",
  "pixie",
  "balding",
  "buzz",
  "afro",
  "bob",
];
const HAIR_COLORS: AvatarModel["hairColor"][] = [
  "blonde",
  "orange",
  "black",
  "white",
  "brown",
  "blue",
  "pink",
];
const HAIR_COLOR_HEX: Record<string, string> = {
  blonde: "#F5DEB3",
  orange: "#FF8C00",
  black: "#1A1A1A",
  white: "#F5F5F5",
  brown: "#8B4513",
  blue: "#4169E1",
  pink: "#FF69B4",
};
const CLOTHING: AvatarModel["clothing"][] = [
  "shirt",
  "dressShirt",
  "vneck",
  "tankTop",
  "dress",
  "naked",
];
const CLOTHING_COLORS: AvatarModel["clothingColor"][] = [
  "white",
  "blue",
  "black",
  "green",
  "red",
];
const CLOTHING_COLOR_HEX: Record<string, string> = {
  white: "#FFFFFF",
  blue: "#4169E1",
  black: "#1A1A1A",
  green: "#228B22",
  red: "#DC143C",
};
const ACCESSORIES: AvatarModel["accessory"][] = [
  "none",
  "roundGlasses",
  "tinyGlasses",
  "shades",
];
const HATS: AvatarModel["hat"][] = ["none", "beanie", "turban"];
const HAT_COLORS: AvatarModel["hatColor"][] = [
  "white",
  "blue",
  "black",
  "green",
  "red",
];
const FACIAL_HAIRS: AvatarModel["facialHair"][] = [
  "none",
  "stubble",
  "mediumBeard",
];
const GRAPHICS: AvatarModel["graphic"][] = [
  "none",
  "redwood",
  "gatsby",
  "vue",
  "react",
  "graphQL",
];
const LIP_COLORS: AvatarModel["lipColor"][] = [
  "red",
  "purple",
  "pink",
  "turqoise",
  "green",
];
const LIP_COLOR_HEX: Record<string, string> = {
  red: "#DC143C",
  purple: "#8B008B",
  pink: "#FF69B4",
  turqoise: "#40E0D0",
  green: "#228B22",
};
const BODY_TYPES: AvatarModel["body"][] = ["chest", "breasts"];

const ALL_EYES = EYES;
const ALL_EYEBROWS = EYEBROWS;
const ALL_MOUTHS = MOUTHS;

// ── Random avatar util ───────────────────────────────────────────────────────
export function getRandomAvatar(): AvatarModel {
  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
  return {
    skinTone: pick(SKIN_TONES),
    eyes: pick(ALL_EYES),
    eyebrows: pick(ALL_EYEBROWS),
    mouth: pick(ALL_MOUTHS),
    hair: pick(HAIRS),
    hairColor: pick(HAIR_COLORS),
    facialHair: pick(FACIAL_HAIRS),
    clothing: pick(CLOTHING),
    clothingColor: pick(CLOTHING_COLORS),
    accessory: pick(ACCESSORIES),
    graphic: pick(GRAPHICS),
    hat: pick(HATS),
    hatColor: pick(HAT_COLORS),
    lipColor: pick(LIP_COLORS),
    body: pick(BODY_TYPES),
    circleColor: "blue",
    lashes: Math.random() > 0.5,
  };
}

// ── Consistent avatar util (for guests) ──────────────────────────────────────
function hashCode(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Simple seeded PRNG (mulberry32)
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getConsistentAvatar(seedStr: string): AvatarModel {
  const rng = mulberry32(hashCode(seedStr) || 12345);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rng() * arr.length)];

  return {
    skinTone: pick(SKIN_TONES),
    eyes: pick(ALL_EYES),
    eyebrows: pick(ALL_EYEBROWS),
    mouth: pick(ALL_MOUTHS),
    hair: pick(HAIRS),
    hairColor: pick(HAIR_COLORS),
    facialHair: pick(FACIAL_HAIRS),
    clothing: pick(CLOTHING),
    clothingColor: pick(CLOTHING_COLORS),
    accessory: pick(ACCESSORIES),
    graphic: pick(GRAPHICS),
    hat: pick(HATS),
    hatColor: pick(HAT_COLORS),
    lipColor: pick(LIP_COLORS),
    body: pick(BODY_TYPES),
    circleColor: "blue",
    lashes: rng() > 0.5,
  };
}

// ── Display-only component ───────────────────────────────────────────────────
export function AvatarDisplay({
  config,
  size = 80,
}: {
  config: AvatarModel;
  size?: number;
}) {
  // Explicitly pick only known BeanHead props so old/unknown fields
  // (e.g. leftover DiceBear fields like backgroundType, seed, etc.) never
  // reach the DOM and cause React prop warnings.
  const {
    skinTone,
    eyes,
    eyebrows,
    mouth,
    hair,
    hairColor,
    facialHair,
    clothing,
    clothingColor,
    accessory,
    graphic,
    hat,
    hatColor,
    lipColor,
    faceMaskColor,
    circleColor,
    body,
    lashes,
    mask,
  } = config;

  return (
    <div
      style={{ width: size, height: size }}
      className="overflow-hidden rounded-full"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{ display: "block" }}
      >
        <foreignObject x={0} y={0} width={100} height={100}>
          <BeanHead
            skinTone={skinTone}
            eyes={eyes}
            eyebrows={eyebrows}
            mouth={mouth}
            hair={hair}
            hairColor={hairColor}
            facialHair={facialHair}
            clothing={clothing}
            clothingColor={clothingColor}
            accessory={accessory}
            graphic={graphic}
            hat={hat}
            hatColor={hatColor}
            lipColor={lipColor}
            faceMaskColor={faceMaskColor}
            circleColor={circleColor}
            body={body}
            lashes={lashes}
            mask={mask ?? false}
          />
        </foreignObject>
      </svg>
    </div>
  );
}

// ── Builder component ────────────────────────────────────────────────────────
interface AvatarBuilderProps {
  initial?: AvatarModel | null;
  onChange: (config: AvatarModel) => void;
}

const DEFAULT_CONFIG: AvatarModel = {
  skinTone: "light",
  eyes: "normal",
  eyebrows: "raised",
  mouth: "grin",
  hair: "short",
  hairColor: "brown",
  facialHair: "none",
  clothing: "shirt",
  clothingColor: "blue",
  graphic: "none",
  accessory: "none",
  hat: "none",
  hatColor: "blue",
  lipColor: "pink",
  body: "chest",
  circleColor: "blue",
  lashes: false,
  mask: false,
  faceMask: false,
};

export default function AvatarBuilder({
  initial,
  onChange,
}: AvatarBuilderProps) {
  const [config, setConfig] = useState<AvatarModel>(initial ?? DEFAULT_CONFIG);

  useEffect(() => {
    onChange(config);
  }, [config, onChange]);

  const update = useCallback((partial: Partial<AvatarModel>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const randomize = () => setConfig(getRandomAvatar());

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Live Preview */}
      <div className="flex flex-shrink-0 flex-col items-center gap-3">
        <div className="overflow-hidden rounded-full border-4 border-indigo-200 shadow-2xl dark:border-indigo-700">
          <svg
            width={140}
            height={140}
            viewBox="0 0 100 100"
            style={{ display: "block" }}
          >
            <foreignObject x={0} y={0} width={100} height={100}>
              <BeanHead
                skinTone={config.skinTone}
                eyes={config.eyes}
                eyebrows={config.eyebrows}
                mouth={config.mouth}
                hair={config.hair}
                hairColor={config.hairColor}
                facialHair={config.facialHair}
                clothing={config.clothing}
                clothingColor={config.clothingColor}
                graphic={config.graphic}
                accessory={config.accessory}
                hat={config.hat}
                hatColor={config.hatColor}
                lipColor={config.lipColor}
                circleColor={config.circleColor}
                body={config.body}
                lashes={config.lashes}
                mask={false}
              />
            </foreignObject>
          </svg>
        </div>
        <button
          onClick={randomize}
          className="rounded-xl bg-indigo-50 px-5 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
        >
          🎲 Randomize
        </button>
      </div>

      {/* Controls Grid */}
      <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Skin Tone */}
        <Section label="Skin Tone">
          <ColorRow
            options={SKIN_TONES}
            colorMap={SKIN_COLORS}
            selected={config.skinTone!}
            onSelect={(v) => update({ skinTone: v as AvatarModel["skinTone"] })}
          />
        </Section>

        {/* Hair */}
        <Section label="Hair Style">
          <ChipRow
            options={HAIRS.map((h) => ({ value: h!, label: h! }))}
            selected={config.hair!}
            onSelect={(v) => update({ hair: v as AvatarModel["hair"] })}
          />
        </Section>

        {/* Hair Color */}
        <Section label="Hair Color">
          <ColorRow
            options={HAIR_COLORS}
            colorMap={HAIR_COLOR_HEX}
            selected={config.hairColor!}
            onSelect={(v) =>
              update({ hairColor: v as AvatarModel["hairColor"] })
            }
          />
        </Section>

        {/* Eyes */}
        <Section label="Eyes">
          <ChipRow
            options={EYES.map((e) => ({ value: e!, label: e! }))}
            selected={config.eyes!}
            onSelect={(v) => update({ eyes: v as AvatarModel["eyes"] })}
          />
        </Section>

        {/* Eyebrows */}
        <Section label="Eyebrows">
          <ChipRow
            options={EYEBROWS.map((e) => ({ value: e!, label: e! }))}
            selected={config.eyebrows!}
            onSelect={(v) => update({ eyebrows: v as AvatarModel["eyebrows"] })}
          />
        </Section>

        {/* Mouth */}
        <Section label="Mouth">
          <ChipRow
            options={MOUTHS.map((m) => ({ value: m!, label: m! }))}
            selected={config.mouth!}
            onSelect={(v) => update({ mouth: v as AvatarModel["mouth"] })}
          />
        </Section>

        {/* Clothing */}
        <Section label="Clothing">
          <ChipRow
            options={CLOTHING.map((c) => ({ value: c!, label: c! }))}
            selected={config.clothing!}
            onSelect={(v) => update({ clothing: v as AvatarModel["clothing"] })}
          />
        </Section>

        {/* Clothing Color - only for options that actually have color */}
        {config.clothing !== "naked" && (
          <Section label="Clothing Color">
            <ColorRow
              options={CLOTHING_COLORS}
              colorMap={CLOTHING_COLOR_HEX}
              selected={config.clothingColor!}
              onSelect={(v) =>
                update({ clothingColor: v as AvatarModel["clothingColor"] })
              }
            />
          </Section>
        )}

        {/* Accessory */}
        <Section label="Accessory">
          <ChipRow
            options={ACCESSORIES.map((a) => ({ value: a!, label: a! }))}
            selected={config.accessory!}
            onSelect={(v) =>
              update({ accessory: v as AvatarModel["accessory"] })
            }
          />
        </Section>

        {/* Hat */}
        <Section label="hat">
          <ChipRow
            options={HATS.map((a) => ({ value: a!, label: a! }))}
            selected={config.hat!}
            onSelect={(v) => update({ hat: v as AvatarModel["hat"] })}
          />
        </Section>

        {/* Hat Color - only if wearing a colorable hat */}
        {["beanie", "turban"].includes(config.hat || "") && (
          <Section label="Hat Color">
            <ColorRow
              options={HAT_COLORS}
              colorMap={CLOTHING_COLOR_HEX}
              selected={config.hatColor!}
              onSelect={(v) =>
                update({ hatColor: v as AvatarModel["hatColor"] })
              }
            />
          </Section>
        )}

        {/* Facial Hair */}
        <Section label="Facial Hair">
          <ChipRow
            options={FACIAL_HAIRS.map((f) => ({ value: f!, label: f! }))}
            selected={config.facialHair!}
            onSelect={(v) =>
              update({ facialHair: v as AvatarModel["facialHair"] })
            }
          />
        </Section>

        {/* Shirt Graphic - only on specific tops */}
        {["shirt", "vneck", "tankTop"].includes(config.clothing || "") && (
          <Section label="Shirt Logo">
            <ChipRow
              options={GRAPHICS.map((g) => ({ value: g!, label: g! }))}
              selected={config.graphic!}
              onSelect={(v) => update({ graphic: v as AvatarModel["graphic"] })}
            />
          </Section>
        )}

        {/* Lip Color - only visible if mouth is 'lips' */}
        {config.mouth === "lips" && (
          <Section label="Lip Color">
            <ColorRow
              options={LIP_COLORS}
              colorMap={LIP_COLOR_HEX}
              selected={config.lipColor!}
              onSelect={(v) =>
                update({ lipColor: v as AvatarModel["lipColor"] })
              }
            />
          </Section>
        )}

        {/* Body Type */}
        <Section label="Body">
          <ChipRow
            options={BODY_TYPES.map((b) => ({ value: b!, label: b! }))}
            selected={config.body!}
            onSelect={(v) => update({ body: v as AvatarModel["body"] })}
          />
        </Section>

        {/* Lashes toggle */}
        <Section label="Lashes">
          <button
            onClick={() => update({ lashes: !config.lashes })}
            className={`rounded-xl px-4 py-1.5 text-sm font-medium transition ${
              config.lashes
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {config.lashes ? "✓ On" : "Off"}
          </button>
        </Section>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
        {label}
      </p>
      {children}
    </div>
  );
}

function ChipRow({
  options,
  selected,
  onSelect,
}: {
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onSelect(o.value)}
          className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition ${
            selected === o.value
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ColorRow({
  options,
  colorMap,
  selected,
  onSelect,
}: {
  options: (string | undefined)[];
  colorMap: Record<string, string>;
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((color) => {
        if (!color) return null;
        return (
          <button
            key={color}
            onClick={() => onSelect(color)}
            title={color}
            style={{ backgroundColor: colorMap[color] }}
            className={`h-7 w-7 rounded-full border-2 transition ${
              selected === color
                ? "scale-110 border-indigo-600 shadow-md"
                : "border-transparent hover:scale-105 hover:border-gray-400"
            }`}
          />
        );
      })}
    </div>
  );
}
