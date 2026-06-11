import { useState } from "react";
import { GlassCard, GradientButton } from "@burro/ui";
import { LanguageModal } from "../components";

export function ProfileScreen() {
  const [languageOpen, setLanguageOpen] = useState(false);

  return <>
    <GlassCard><h2>Profile</h2><p>Active days: 7 · Achievements: 5</p><GradientButton onClick={() => setLanguageOpen(true)}>Til</GradientButton></GlassCard>
    {languageOpen && <LanguageModal onClose={() => setLanguageOpen(false)}/>}
  </>;
}
