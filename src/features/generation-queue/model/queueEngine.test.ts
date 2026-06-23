import { describe, expect, it } from "vitest";
import type { GenerationTask } from "@/entities/generation-task";
import type { QueueAction, QueueState } from "./queueReducer";
import { createQueueEngine } from "./queueEngine";

const task = (overrides: Partial<GenerationTask>): GenerationTask => ({
  id: "task",
  type: "image",
  prompt: "Неоновый город",
  model: "Midjourney v6",
  status: "queued",
  progress: 0,
  createdAt: 1,
  credits: 80,
  estimatedMs: 30_000,
  ...overrides,
});

describe("queueEngine", () => {
  it("schedules queued tasks before ticking running tasks", () => {
    const actions: QueueAction[] = [];
    const state: QueueState = {
      tasks: [
        task({ id: "running", status: "running", progress: 20 }),
        task({ id: "queued", status: "queued" }),
      ],
    };

    const engine = createQueueEngine({
      getState: () => state,
      dispatch: (action) => actions.push(action),
      random: () => 0.9,
    });

    engine.tick();

    expect(actions[0]).toEqual({ type: "SCHEDULE_NEXT" });
    expect(actions[1]).toEqual({
      type: "TICK_TASK",
      taskId: "running",
      progressDelta: expect.any(Number),
    });
  });

  it("uses slower progress steps for video and audio tasks", () => {
    const imageActions: QueueAction[] = [];
    const videoActions: QueueAction[] = [];

    createQueueEngine({
      getState: () => ({ tasks: [task({ id: "image", type: "image", status: "running" })] }),
      dispatch: (action) => imageActions.push(action),
      random: () => 0.5,
    }).tick();

    createQueueEngine({
      getState: () => ({ tasks: [task({ id: "video", type: "video", status: "running" })] }),
      dispatch: (action) => videoActions.push(action),
      random: () => 0.5,
    }).tick();

    const imageTick = imageActions.find((action) => action.type === "TICK_TASK");
    const videoTick = videoActions.find((action) => action.type === "TICK_TASK");

    expect(imageTick?.type === "TICK_TASK" ? imageTick.progressDelta : 0).toBeGreaterThan(
      videoTick?.type === "TICK_TASK" ? videoTick.progressDelta : 0,
    );
  });

  it("can fail a running task with deterministic random", () => {
    const actions: QueueAction[] = [];

    createQueueEngine({
      getState: () => ({ tasks: [task({ id: "running", status: "running", progress: 20 })] }),
      dispatch: (action) => actions.push(action),
      random: () => 0.05,
    }).tick();

    expect(actions).toContainEqual({
      type: "FAIL_TASK",
      taskId: "running",
      error: expect.any(String),
    });
  });

  it("clears the interval when stopped", () => {
    let intervalCallback: (() => void) | undefined;
    const cleared: number[] = [];
    const actions: QueueAction[] = [];

    const engine = createQueueEngine({
      getState: () => ({ tasks: [task({ id: "running", status: "running" })] }),
      dispatch: (action) => actions.push(action),
      random: () => 0.9,
      setIntervalImpl: (callback) => {
        intervalCallback = callback;
        return 7;
      },
      clearIntervalImpl: (intervalId) => cleared.push(intervalId),
    });

    engine.start();
    engine.stop();
    intervalCallback?.();

    expect(cleared).toEqual([7]);
    expect(actions).toEqual([]);
  });
});
