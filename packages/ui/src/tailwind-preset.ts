import { burroTokens } from "./tokens";

export const burroTailwindPreset = {
  theme: {
    extend: {
      colors: {
        burro: {
          // Spec-named tokens (doc 12 §5)
          bg950: burroTokens.bg950,
          bg900: burroTokens.bg900,
          bg850: burroTokens.bg850,
          navy: burroTokens.navy,
          textPrimary: burroTokens.textPrimary,
          textOnDark: burroTokens.textOnDark,
          textMutedSpec: burroTokens.textMuted,
          cyan500: burroTokens.cyan500,
          cyan400: burroTokens.cyan400,
          blue500: burroTokens.blue500,
          blue600: burroTokens.blue600,
          green500: burroTokens.green500,
          green600: burroTokens.green600,
          red500: burroTokens.red500,
          yellow500: burroTokens.yellow500,
          cardSoft: burroTokens.cardSoft,
          // Legacy aliases (kept so existing utility classes keep resolving)
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
      fontFamily: {
        burroSans: burroTokens.fontSans.split(",").map((part) => part.trim()),
        burroArabic: burroTokens.fontArabic.split(",").map((part) => part.trim())
      },
      borderRadius: {
        burroXs: "10px",
        burroSm: "14px",
        burroMd: "18px",
        burroLg: "24px",
        burroXl: "30px",
        burroPill: "999px"
      },
      boxShadow: {
        burroCard: burroTokens.shadowCard,
        burroGlow: burroTokens.shadowGlow,
        burroCyan: burroTokens.shadowCyanGlow,
        burroGreen: burroTokens.shadowGreenGlow,
        burroRed: burroTokens.shadowRedGlow
      }
    }
  }
};
