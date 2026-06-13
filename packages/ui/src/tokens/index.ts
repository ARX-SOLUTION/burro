export const burroTokens = {
  // Backgrounds (spec doc 12 §5)
  bg950: "#061640",
  bg900: "#081d4c",
  bg850: "#0c285f",
  navy: "#102052",

  // Text
  textPrimary: "#101f4a",
  textOnDark: "#ffffff",
  textMuted: "#8b95a7",

  // Brand cyan / blue
  cyan500: "#15b9f0",
  cyan400: "#55d8f6",
  blue500: "#168de6",
  blue600: "#0876d8",

  // Semantic
  green500: "#20b24b",
  green600: "#15913d",
  red500: "#f34343",
  yellow500: "#ffb400",

  // Surfaces
  card: "#ffffff",
  cardSoft: "#f7f9fc",

  // Shadows
  shadowCard: "0 6px 0 rgba(0,0,0,0.14), 0 14px 30px rgba(0,0,0,0.18)",
  shadowCyanGlow: "0 0 0 2px rgba(85,216,246,0.55), 0 8px 24px rgba(21,185,240,0.45)",
  shadowGreenGlow: "0 0 0 2px rgba(71,236,107,0.35), 0 8px 24px rgba(32,178,75,0.35)",
  shadowRedGlow: "0 0 0 2px rgba(255,96,96,0.35), 0 8px 24px rgba(243,67,67,0.35)",

  // Font stacks
  fontSans: 'Inter, Manrope, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontArabic: '"Noto Naskh Arabic", "Amiri", "Geeza Pro", serif',

  // Legacy aliases (retained for older code / tailwind-preset back-compat)
  bgDeep: "#081B4A",
  bgNavy: "#0D255F",
  primary: "#1597EA",
  primaryLight: "#58D8FF",
  primaryDark: "#006DE5",
  success: "#1FB24A",
  danger: "#F04444",
  warning: "#FFB800",
  textMain: "#10204A",
  radiusXl: "28px",
  radiusLg: "22px",
  shadowGlow: "0 0 18px rgba(88,216,255,0.65)"
} as const;
