import { burroTokens } from "./tokens";

export const burroTailwindPreset = {
  theme: {
    extend: {
      colors: {
        burro: {
          bgDeep: burroTokens.bgDeep,
          bgNavy: burroTokens.bgNavy,
          primary: burroTokens.primary,
          primaryLight: burroTokens.primaryLight,
          primaryDark: burroTokens.primaryDark,
          success: burroTokens.success,
          danger: burroTokens.danger,
          warning: burroTokens.warning,
          card: burroTokens.card,
          text: burroTokens.textMain,
          muted: burroTokens.textMuted
        }
      },
      borderRadius: {
        burroSm: "14px",
        burroMd: "18px",
        burroLg: "22px",
        burroXl: "28px"
      },
      boxShadow: {
        burroCard: burroTokens.shadowCard,
        burroGlow: burroTokens.shadowGlow,
        burroCyan: "0 0 0 2px rgba(85,216,246,0.55), 0 8px 24px rgba(21,185,240,0.45)",
        burroGreen: "0 0 0 2px rgba(71,236,107,0.35), 0 8px 24px rgba(32,178,75,0.35)",
        burroRed: "0 0 0 2px rgba(255,96,96,0.35), 0 8px 24px rgba(243,67,67,0.35)"
      }
    }
  }
};
