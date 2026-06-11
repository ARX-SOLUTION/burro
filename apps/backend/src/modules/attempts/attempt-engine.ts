import {
  AnswerAttemptRequest,
  AnswerResultView,
  AttemptView,
  ExerciseView,
  StartAttemptRequest
} from "@burro/shared";
import {
  AttemptRecord,
  AttemptsStorePort,
  ExerciseCatalogPort,
  ExerciseRecord,
  ModuleContentRecord,
  XpGrantRequest
} from "./attempts.ports";

export class AttemptError extends Error {
  constructor(message: string, readonly code: "not_found" | "invalid") {
    super(message);
    this.name = "AttemptError";
  }
}

export class AttemptNotFoundError extends AttemptError {
  constructor(message: string) {
    super(message, "not_found");
    this.name = "AttemptNotFoundError";
  }
}

export class AttemptInvalidError extends AttemptError {
  constructor(message: string) {
    super(message, "invalid");
    this.name = "AttemptInvalidError";
  }
}

export class AttemptEngine {
  constructor(
    private readonly store: AttemptsStorePort,
    private readonly catalog: ExerciseCatalogPort
  ) {}

  async start(studentId: string, req: StartAttemptRequest): Promise<AttemptView> {
    const module = this.catalog.getModule(req.moduleId);
    if (!module) {
      throw new AttemptNotFoundError(`module ${req.moduleId} not found`);
    }
    const attempt: AttemptRecord = {
      id: crypto.randomUUID(),
      studentId,
      moduleId: module.id,
      mode: req.mode,
      status: "in_progress",
      heartsRemaining: module.heartsCount,
      exerciseIds: module.exercises.map((exercise) => exercise.id),
      answeredExerciseIds: [],
      correctCount: 0,
      xpEarned: 0
    };
    await this.store.saveAttempt(attempt);
    return this.toView(attempt, module);
  }

  async answer(studentId: string, attemptId: string, req: AnswerAttemptRequest): Promise<AnswerResultView> {
    const attempt = await this.store.getAttempt(attemptId);
    if (!attempt || attempt.studentId !== studentId) {
      throw new AttemptNotFoundError(`attempt ${attemptId} not found`);
    }
    if (attempt.status !== "in_progress") {
      throw new AttemptInvalidError("attempt is finished");
    }
    const module = this.catalog.getModule(attempt.moduleId);
    if (!module) {
      throw new AttemptNotFoundError(`module ${attempt.moduleId} not found`);
    }
    const currentExerciseId = attempt.exerciseIds[attempt.answeredExerciseIds.length];
    if (req.exerciseId !== currentExerciseId) {
      throw new AttemptInvalidError(`exercise ${req.exerciseId} is not the current exercise`);
    }
    const exercise = module.exercises.find((candidate) => candidate.id === currentExerciseId);
    if (!exercise) {
      throw new AttemptNotFoundError(`exercise ${currentExerciseId} not found`);
    }
    const option = exercise.options.find((candidate) => candidate.id === req.selectedOptionId);
    if (!option) {
      throw new AttemptInvalidError(`option ${req.selectedOptionId} does not belong to exercise ${exercise.id}`);
    }
    const correctOption = exercise.options.find((candidate) => candidate.isCorrect);
    if (!correctOption) {
      throw new AttemptInvalidError(`exercise ${exercise.id} has no correct option`);
    }

    const isCorrect = option.isCorrect;
    attempt.answeredExerciseIds.push(exercise.id);
    attempt.correctCount += isCorrect ? 1 : 0;

    const answerXpGrant: XpGrantRequest | null = isCorrect
      ? { sourceType: "correct_answer", sourceId: exercise.id, xpDelta: module.correctAnswerXp }
      : null;
    const completionXpGrants: XpGrantRequest[] = [];

    if (attempt.mode === "final_quiz" && !isCorrect) {
      attempt.heartsRemaining -= 1;
      if (attempt.heartsRemaining === 0) {
        attempt.status = "failed";
      }
    }

    if (attempt.status === "in_progress" && attempt.answeredExerciseIds.length === attempt.exerciseIds.length) {
      if (attempt.mode === "practice") {
        attempt.status = "completed";
        completionXpGrants.push({
          sourceType: "practice_completion",
          sourceId: attempt.moduleId,
          xpDelta: module.practiceCompletionXp
        });
      } else {
        const score = (attempt.correctCount / attempt.exerciseIds.length) * 100;
        if (score >= module.passScore) {
          attempt.status = "passed";
          completionXpGrants.push(
            { sourceType: "final_quiz_pass", sourceId: attempt.moduleId, xpDelta: module.finalQuizPassXp },
            { sourceType: "module_completion", sourceId: attempt.moduleId, xpDelta: module.moduleCompletionXp }
          );
        } else {
          attempt.status = "failed";
        }
      }
    }

    const { grantedTotal, answerXpGranted } = await this.store.applyAnswer({
      attempt,
      answer: {
        attemptId: attempt.id,
        exerciseId: exercise.id,
        selectedOptionId: option.id,
        correctOptionId: correctOption.id,
        isCorrect
      },
      answerXpGrant,
      completionXpGrants
    });
    attempt.xpEarned += grantedTotal;

    return {
      attempt: this.toView(attempt, module),
      exerciseId: exercise.id,
      selectedOptionId: option.id,
      correctOptionId: correctOption.id,
      isCorrect,
      xpDelta: answerXpGranted,
      feedback: isCorrect
        ? { title: module.feedback.correctTitle, message: module.feedback.correctMessage }
        : { title: module.feedback.incorrectTitle, message: module.feedback.incorrectMessage }
    };
  }

  private toView(attempt: AttemptRecord, module: ModuleContentRecord): AttemptView {
    let currentExercise: ExerciseView | null = null;
    if (attempt.status === "in_progress") {
      const currentExerciseId = attempt.exerciseIds[attempt.answeredExerciseIds.length];
      const exercise = module.exercises.find((candidate) => candidate.id === currentExerciseId);
      currentExercise = exercise ? this.toExerciseView(exercise) : null;
    }
    return {
      attemptId: attempt.id,
      moduleId: attempt.moduleId,
      mode: attempt.mode,
      status: attempt.status,
      heartsRemaining: attempt.heartsRemaining,
      answeredCount: attempt.answeredExerciseIds.length,
      totalExercises: attempt.exerciseIds.length,
      xpEarned: attempt.xpEarned,
      currentExercise
    };
  }

  private toExerciseView(exercise: ExerciseRecord): ExerciseView {
    return {
      id: exercise.id,
      prompt: exercise.prompt,
      audioUrl: exercise.audioUrl,
      options: exercise.options.map((option) => ({ id: option.id, label: option.label }))
    };
  }
}
