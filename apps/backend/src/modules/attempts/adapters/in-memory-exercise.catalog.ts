import { Injectable } from "@nestjs/common";
import { ExerciseCatalogPort, ModuleContentRecord } from "../attempts.ports";

@Injectable()
export class InMemoryExerciseCatalog implements ExerciseCatalogPort {
  private readonly modules = new Map<string, ModuleContentRecord>([
    [
      "module-letters-1",
      {
        id: "module-letters-1",
        heartsCount: 5,
        passScore: 80,
        correctAnswerXp: 10,
        practiceCompletionXp: 50,
        finalQuizPassXp: 100,
        moduleCompletionXp: 150,
        feedback: {
          correctTitle: "Ajoyib!",
          correctMessage: "To‘g‘ri javob",
          incorrectTitle: "Yana urinib ko‘ramiz",
          incorrectMessage: "Noto‘g‘ri javob"
        },
        exercises: [
          {
            id: "ex-ba-1",
            prompt: "Qaysi harf “Ba” tovushini beradi?",
            audioUrl: null,
            options: [
              { id: "ex-ba-1-opt-1", label: "ا", isCorrect: false },
              { id: "ex-ba-1-opt-2", label: "ب", isCorrect: true },
              { id: "ex-ba-1-opt-3", label: "ت", isCorrect: false },
              { id: "ex-ba-1-opt-4", label: "ث", isCorrect: false }
            ]
          },
          {
            id: "ex-ta-1",
            prompt: "Qaysi harf “Ta” tovushini beradi?",
            audioUrl: null,
            options: [
              { id: "ex-ta-1-opt-1", label: "ب", isCorrect: false },
              { id: "ex-ta-1-opt-2", label: "ث", isCorrect: false },
              { id: "ex-ta-1-opt-3", label: "ت", isCorrect: true },
              { id: "ex-ta-1-opt-4", label: "ج", isCorrect: false }
            ]
          },
          {
            id: "ex-tha-1",
            prompt: "Qaysi harf “Sa (tha)” tovushini beradi?",
            audioUrl: null,
            options: [
              { id: "ex-tha-1-opt-1", label: "ث", isCorrect: true },
              { id: "ex-tha-1-opt-2", label: "ت", isCorrect: false },
              { id: "ex-tha-1-opt-3", label: "ب", isCorrect: false },
              { id: "ex-tha-1-opt-4", label: "ا", isCorrect: false }
            ]
          },
          {
            id: "ex-alif-1",
            prompt: "Qaysi harf “Alif” deb ataladi?",
            audioUrl: null,
            options: [
              { id: "ex-alif-1-opt-1", label: "ج", isCorrect: false },
              { id: "ex-alif-1-opt-2", label: "ت", isCorrect: false },
              { id: "ex-alif-1-opt-3", label: "ث", isCorrect: false },
              { id: "ex-alif-1-opt-4", label: "ا", isCorrect: true }
            ]
          },
          {
            id: "ex-jim-1",
            prompt: "Qaysi harf “Jim” tovushini beradi?",
            audioUrl: null,
            options: [
              { id: "ex-jim-1-opt-1", label: "ب", isCorrect: false },
              { id: "ex-jim-1-opt-2", label: "ج", isCorrect: true },
              { id: "ex-jim-1-opt-3", label: "ا", isCorrect: false },
              { id: "ex-jim-1-opt-4", label: "ت", isCorrect: false }
            ]
          }
        ]
      }
    ]
  ]);

  async getModule(moduleId: string): Promise<ModuleContentRecord | undefined> {
    return this.modules.get(moduleId);
  }
}
