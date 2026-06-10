// Tailwind token extension for Burro Student App.
// Copy into apps/students/tailwind.config.ts theme.extend.
export const burroTailwindTokens = {
  colors: {
    burro: {
      bg950: '#061640',
      bg900: '#081d4c',
      bg850: '#0c285f',
      navy: '#102052',
      text: '#101f4a',
      muted: '#8b95a7',
      cyan: '#15b9f0',
      cyanSoft: '#55d8f6',
      blue: '#168de6',
      green: '#20b24b',
      red: '#f34343',
      yellow: '#ffb400',
      card: '#ffffff',
    },
  },
  borderRadius: {
    burroSm: '14px',
    burroMd: '18px',
    burroLg: '24px',
    burroXl: '30px',
  },
  boxShadow: {
    burroCard: '0 6px 0 rgba(0,0,0,0.14), 0 14px 30px rgba(0,0,0,0.18)',
    burroCyan: '0 0 0 2px rgba(85,216,246,0.55), 0 8px 24px rgba(21,185,240,0.45)',
    burroGreen: '0 0 0 2px rgba(71,236,107,0.35), 0 8px 24px rgba(32,178,75,0.35)',
    burroRed: '0 0 0 2px rgba(255,96,96,0.35), 0 8px 24px rgba(243,67,67,0.35)',
  },
};

export const burroRequiredTokens = {
  colors: {
    bgDeep: "#081B4A",
    bgNavy: "#0D255F",
    primary: "#1597EA",
    primaryLight: "#58D8FF",
    primaryDark: "#006DE5",
    success: "#1FB24A",
    danger: "#F04444",
    warning: "#FFB800"
  },
  radius: { xl: "28px", lg: "22px" },
  shadow: { card: "0 6px 0 rgba(0,0,0,0.18)", glow: "0 0 18px rgba(88,216,255,0.65)" }
};
