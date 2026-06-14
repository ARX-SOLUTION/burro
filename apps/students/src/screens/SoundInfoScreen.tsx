import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AppBackground, AudioCircleButton, PrimaryGlowButton } from "@burro/ui";
import { useModuleExercises } from "../features/learning/hooks";

/**
 * Sound info screen (doc 12 §9.9, refs 13-sound-info-default.png + 14-sound-info-playing.png).
 * Top bar mirrors QuizShell (close + progress + hearts + XP preview but read-only),
 * a large white card holds the Arabic glyph centered with an AudioCircleButton below
 * that toggles idle↔playing, and a "Tekshirish" PrimaryGlowButton sits at the bottom.
 *
 * No dedicated sounds endpoint is exposed yet; the audio URL is sourced from the
 * module's first exercise (`GET /student/modules/:moduleId/exercises`), which falls
 * back to the seeded data-URI placeholder.
 */
// Matches the seeded GLYPHS in apps/backend/src/db/seed.ts so the deterministic
// pick aligns with the sound row the backend would expose if /sounds were live.
const GLYPHS: ReadonlyArray<string> = ["ا", "ب", "ت", "ث", "ج", "ح", "خ", "د"];

function pickGlyphForSound(moduleId: string, soundId: string): string {
  // Pick a glyph deterministically from the soundId hash so the same route shows
  // the same letter even when the backend has no /sounds endpoint exposed yet.
  const identifier = soundId || moduleId;
  let hash = 0;
  for (let index = 0; index < identifier.length; index += 1) {
    hash = (hash * 31 + identifier.charCodeAt(index)) >>> 0;
  }
  return GLYPHS[hash % GLYPHS.length] ?? "ج";
}

export function SoundInfoScreen({ moduleId, soundId }: { moduleId: string; soundId: string }) {
  const navigate = useNavigate();
  const { data: exercises } = useModuleExercises(moduleId);
  const [audioState, setAudioState] = useState<"idle" | "playing">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioUrl = useMemo(() => {
    return exercises?.exercises.find((exercise) => Boolean(exercise.audioUrl))?.audioUrl ?? null;
  }, [exercises]);

  const glyph = useMemo(() => pickGlyphForSound(moduleId, soundId), [moduleId, soundId]);

  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  const exitToModule = () => {
    navigate({ to: "/modules/$moduleId/practice", params: { moduleId } });
  };

  const toggleAudio = () => {
    if (!audioUrl) {
      // Without a usable audio source we still flip the visual state so the
      // playing variant renders for design parity (ref 14-sound-info-playing.png).
      setAudioState((current) => (current === "idle" ? "playing" : "idle"));
      return;
    }
    let audio = audioRef.current;
    if (!audio) {
      audio = new Audio(audioUrl);
      audio.addEventListener("ended", () => setAudioState("idle"));
      audio.addEventListener("pause", () => setAudioState("idle"));
      audioRef.current = audio;
    }
    if (audioState === "playing") {
      audio.pause();
      audio.currentTime = 0;
      setAudioState("idle");
      return;
    }
    audio.currentTime = 0;
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise.then(() => setAudioState("playing")).catch(() => setAudioState("idle"));
    } else {
      setAudioState("playing");
    }
  };

  return (
    <div className="sound-info-shell">
      <AppBackground variant="app">
        <section className="sound-info-screen" aria-labelledby="sound-info-title">
          <header className="sound-info-bar">
            <button
              type="button"
              className="sound-info-bar__close"
              onClick={exitToModule}
              aria-label="Yopish"
            >
              <span aria-hidden="true">×</span>
            </button>
            <div
              className="sound-info-bar__progress"
              role="progressbar"
              aria-valuenow={45}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span className="sound-info-bar__progress-fill" style={{ width: "45%" }} />
            </div>
            <span className="sound-info-bar__hearts" aria-label="3 ta jon">
              <span className="sound-info-bar__heart" aria-hidden="true" />
              3
            </span>
            <span className="sound-info-bar__xp">+0 XP</span>
          </header>

          <article className="sound-info-card">
            <h1 id="sound-info-title" className="sr-only">Ushbu tovush haqida ma'lumot</h1>
            <div className="sound-info-card__glyph-wrap" aria-hidden="true">
              <span className="sound-info-card__glyph" lang="ar">{glyph}</span>
            </div>
            <div className="sound-info-card__audio">
              <AudioCircleButton
                ariaLabel={audioState === "playing" ? "To'xtatish" : "Tovushni eshitish"}
                state={audioState}
                onClick={toggleAudio}
              />
            </div>
            <p className="sound-info-card__caption">Ushbu tovush haqida ma'lumot</p>
          </article>

          <footer className="sound-info-footer">
            <button
              type="button"
              className="sound-info-footer__info"
              aria-label="Qo'shimcha ma'lumot"
            >
              <span className="sound-info-footer__info-icon" aria-hidden="true" />
            </button>
            <PrimaryGlowButton type="button" onClick={exitToModule}>
              Tekshirish
            </PrimaryGlowButton>
          </footer>
        </section>
      </AppBackground>
    </div>
  );
}
