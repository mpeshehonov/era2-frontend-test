import type { GenerationTask, GenType } from "@/entities/generation-task";
import type { QueueAction, QueueState } from "./queueReducer";

const TICK_MS = 650;
const FAILURE_RATE = 0.15;

const failureMessages = [
  "Недостаточно кредитов",
  "Превышено время ожидания",
  "Модель временно недоступна",
];

const progressRanges: Record<GenType, { min: number; max: number }> = {
  text: { min: 12, max: 22 },
  image: { min: 8, max: 16 },
  video: { min: 3, max: 7 },
  audio: { min: 4, max: 9 },
};

type IntervalId = number;

const defaultSetInterval = (callback: () => void, delay: number): IntervalId => (
  window.setInterval(callback, delay)
);

const defaultClearInterval = (intervalId: IntervalId) => {
  window.clearInterval(intervalId);
};

export interface QueueEngineOptions {
  getState: () => QueueState;
  dispatch: (action: QueueAction) => void;
  random?: () => number;
  setIntervalImpl?: (callback: () => void, delay: number) => IntervalId;
  clearIntervalImpl?: (intervalId: IntervalId) => void;
}

export interface QueueEngine {
  start: () => void;
  stop: () => void;
  tick: () => void;
}

function getProgressDelta(type: GenType, random: () => number): number {
  const range = progressRanges[type];
  return Math.round(range.min + (range.max - range.min) * random());
}

function getFailureMessage(random: () => number): string {
  const index = Math.min(failureMessages.length - 1, Math.floor(random() * failureMessages.length));
  return failureMessages[index] ?? failureMessages[0];
}

function shouldFail(task: GenerationTask, random: () => number): boolean {
  return task.progress >= 12 && task.progress < 24 && random() < FAILURE_RATE;
}

export function createQueueEngine({
  getState,
  dispatch,
  random = Math.random,
  setIntervalImpl = defaultSetInterval,
  clearIntervalImpl = defaultClearInterval,
}: QueueEngineOptions): QueueEngine {
  let intervalId: IntervalId | null = null;
  let stopped = false;

  const tick = () => {
    if (stopped) return;

    dispatch({ type: "SCHEDULE_NEXT" });

    for (const task of getState().tasks) {
      if (task.status !== "running") continue;

      if (shouldFail(task, random)) {
        dispatch({ type: "FAIL_TASK", taskId: task.id, error: getFailureMessage(random) });
        continue;
      }

      dispatch({
        type: "TICK_TASK",
        taskId: task.id,
        progressDelta: getProgressDelta(task.type, random),
      });
    }
  };

  return {
    start() {
      if (intervalId !== null) return;
      stopped = false;
      intervalId = setIntervalImpl(tick, TICK_MS);
    },
    stop() {
      stopped = true;
      if (intervalId === null) return;
      clearIntervalImpl(intervalId);
      intervalId = null;
    },
    tick,
  };
}
