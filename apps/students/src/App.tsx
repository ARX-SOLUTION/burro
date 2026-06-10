import { useState } from "react";
import { AnswerOption, AudioButton, BottomNav, FeedbackPanel, GlassCard, GradientButton, HeartCounter, LanguageModal, LeaderboardPodium, LeaderboardRow, MicrophoneButton, ModuleCard, ModuleNode, PinnedRankCard, ProgressHeader, StudentShell, XpCounter } from "./components";
import { checkExerciseAnswer, type CheckExerciseAnswerResponse } from "./features/exercises/api/checkExerciseAnswer";

type Tab = "dashboard" | "modules" | "path" | "exercise" | "leaderboard" | "profile";

type ExerciseOption = {
  id: string;
  label: string;
};

const exerciseId = "exercise-ba-1";
const exerciseOptions: ExerciseOption[] = [
  { id: "option-alif", label: "ا" },
  { id: "option-ba", label: "ب" },
  { id: "option-ta", label: "ت" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [selected, setSelected] = useState<ExerciseOption | null>(null);
  const [checkResult, setCheckResult] = useState<CheckExerciseAnswerResponse | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [languageOpen, setLanguageOpen] = useState(false);

  const answerState = (option: ExerciseOption) => {
    if (checkResult) {
      if (option.id === checkResult.correctOptionId) {
        return "correct";
      }

      if (option.id === checkResult.selectedOptionId && !checkResult.isCorrect) {
        return "wrong";
      }

      return undefined;
    }

    return selected?.id === option.id ? "selected" : undefined;
  };

  const selectAnswer = (option: ExerciseOption) => {
    setSelected(option);
    setCheckResult(null);
    setCheckError(null);
  };

  const handleCheckAnswer = async () => {
    if (!selected || isChecking) {
      return;
    }

    setIsChecking(true);
    setCheckError(null);

    try {
      const result = await checkExerciseAnswer(exerciseId, {
        selectedOptionId: selected.id,
        mode: "practice",
      });

      setCheckResult(result);
    } catch (error) {
      setCheckError(error instanceof Error ? error.message : "Javobni tekshirib bo‘lmadi.");
    } finally {
      setIsChecking(false);
    }
  };

  const resetExercise = () => {
    setSelected(null);
    setCheckResult(null);
    setCheckError(null);
  };

  return <StudentShell>
    <div className="top-row"><h1>Burro</h1><XpCounter xp={1280} /></div>
    {tab === "dashboard" && <><GlassCard><h2>Assalomu alaykum, Amina!</h2><p>Bugun arab tovushlarini mashq qilamiz.</p><GradientButton onClick={() => setTab("exercise")}>Boshlash</GradientButton></GlassCard><div className="grid"><ModuleCard title="Harflar" subtitle="8/12 yakunlandi"/><ModuleCard title="Talaffuz" subtitle="3 kun streak"/></div></>}
    {tab === "modules" && <><h2>Modullar</h2><div className="grid"><ModuleCard title="Alif" subtitle="Ochiq"/><ModuleCard title="Ba" subtitle="Premium"/><ModuleCard title="Jim" subtitle="Quiz"/><ModuleCard title="Dal" subtitle="Yangi"/></div></>}
    {tab === "path" && <><ProgressHeader title="Ba moduli" progress="4/8"/><ModuleNode icon="ا"/><ModuleNode icon="ب"/><ModuleNode icon="ت"/><ModuleNode icon="★"/></>}
    {tab === "exercise" && <><ProgressHeader title="Savol 4" progress="60%"/><div className="top-row"><HeartCounter hearts={checkResult?.heartsRemaining ?? 3}/><span className="pill">Practice</span></div><GlassCard><h2>Qaysi harf “Ba” tovushini beradi?</h2><AudioButton/><AnswerOption label={exerciseOptions[0].label} state={answerState(exerciseOptions[0])} onClick={()=>selectAnswer(exerciseOptions[0])}/><AnswerOption label={exerciseOptions[1].label} state={answerState(exerciseOptions[1])} onClick={()=>selectAnswer(exerciseOptions[1])}/><AnswerOption label={exerciseOptions[2].label} state={answerState(exerciseOptions[2])} onClick={()=>selectAnswer(exerciseOptions[2])}/><GradientButton disabled={!selected || isChecking || Boolean(checkResult)} onClick={handleCheckAnswer}>{isChecking ? "Tekshirilmoqda..." : "Tekshirish"}</GradientButton>{checkError && <FeedbackPanel type="wrong" text={checkError}/>} {checkResult && <FeedbackPanel type={checkResult.isCorrect ? "correct" : "wrong"} text={checkResult.isCorrect ? `${checkResult.feedback.message}. +${checkResult.xpDelta} XP` : checkResult.feedback.message}/>} {checkResult && <GradientButton onClick={resetExercise}>Davom etish</GradientButton>}</GlassCard><GlassCard><h3>Talaffuz mashqi</h3><MicrophoneButton/></GlassCard></>}
    {tab === "leaderboard" && <><h2>Leaderboard</h2><LeaderboardPodium/><PinnedRankCard/><LeaderboardRow rank={4} name="Maryam" xp={720}/><LeaderboardRow rank={5} name="Yusuf" xp={690}/></>}
    {tab === "profile" && <><GlassCard><h2>Profile</h2><p>Active days: 7 · Achievements: 5</p><GradientButton onClick={()=>setLanguageOpen(true)}>Til</GradientButton></GlassCard>{languageOpen && <LanguageModal onClose={()=>setLanguageOpen(false)}/>}</>}
    <BottomNav active={tab} onChange={(next)=>setTab(next as Tab)} />
  </StudentShell>;
}
