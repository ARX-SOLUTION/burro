import { useState } from "react";
import { AnswerOption, AudioButton, BottomNav, FeedbackPanel, GlassCard, GradientButton, HeartCounter, LanguageModal, LeaderboardPodium, LeaderboardRow, MicrophoneButton, ModuleCard, ModuleNode, PinnedRankCard, ProgressHeader, StudentShell, XpCounter } from "./components";

type Tab = "dashboard" | "modules" | "path" | "exercise" | "leaderboard" | "profile";

export default function App() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const answerState = (label: string) => checked ? (label === "ب" ? "correct" : selected === label ? "wrong" : undefined) : selected === label ? "selected" : undefined;
  return <StudentShell>
    <div className="top-row"><h1>Burro</h1><XpCounter xp={1280} /></div>
    {tab === "dashboard" && <><GlassCard><h2>Assalomu alaykum, Amina!</h2><p>Bugun arab tovushlarini mashq qilamiz.</p><GradientButton onClick={() => setTab("exercise")}>Boshlash</GradientButton></GlassCard><div className="grid"><ModuleCard title="Harflar" subtitle="8/12 yakunlandi"/><ModuleCard title="Talaffuz" subtitle="3 kun streak"/></div></>}
    {tab === "modules" && <><h2>Modullar</h2><div className="grid"><ModuleCard title="Alif" subtitle="Ochiq"/><ModuleCard title="Ba" subtitle="Premium"/><ModuleCard title="Jim" subtitle="Quiz"/><ModuleCard title="Dal" subtitle="Yangi"/></div></>}
    {tab === "path" && <><ProgressHeader title="Ba moduli" progress="4/8"/><ModuleNode icon="ا"/><ModuleNode icon="ب"/><ModuleNode icon="ت"/><ModuleNode icon="★"/></>}
    {tab === "exercise" && <><ProgressHeader title="Savol 4" progress="60%"/><div className="top-row"><HeartCounter hearts={3}/><span className="pill">Practice</span></div><GlassCard><h2>Qaysi harf “Ba” tovushini beradi?</h2><AudioButton/><AnswerOption label="ا" state={answerState("ا")} onClick={()=>{setSelected("ا");setChecked(false)}}/><AnswerOption label="ب" state={answerState("ب")} onClick={()=>{setSelected("ب");setChecked(false)}}/><AnswerOption label="ت" state={answerState("ت")} onClick={()=>{setSelected("ت");setChecked(false)}}/><GradientButton disabled={!selected} onClick={()=>setChecked(true)}>Tekshirish</GradientButton>{checked && <FeedbackPanel type={selected === "ب" ? "correct" : "wrong"} text={selected === "ب" ? "Zo‘r! To‘g‘ri javob." : "Yana urinib ko‘ramiz. Practice mode hearts kamaytirmaydi."}/>} {checked && <GradientButton onClick={()=>{setSelected(null);setChecked(false)}}>Davom etish</GradientButton>}</GlassCard><GlassCard><h3>Talaffuz mashqi</h3><MicrophoneButton/></GlassCard></>}
    {tab === "leaderboard" && <><h2>Leaderboard</h2><LeaderboardPodium/><PinnedRankCard/><LeaderboardRow rank={4} name="Maryam" xp={720}/><LeaderboardRow rank={5} name="Yusuf" xp={690}/></>}
    {tab === "profile" && <><GlassCard><h2>Profile</h2><p>Active days: 7 · Achievements: 5</p><GradientButton onClick={()=>setLanguageOpen(true)}>Til</GradientButton></GlassCard>{languageOpen && <LanguageModal onClose={()=>setLanguageOpen(false)}/>}</>}
    <BottomNav active={tab} onChange={(next)=>setTab(next as Tab)} />
  </StudentShell>;
}
