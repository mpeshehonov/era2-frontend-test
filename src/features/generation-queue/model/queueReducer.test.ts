import { describe, expect, it } from "vitest";
import type { GenerationTask } from "@/entities/generation-task";
import { MAX_CONCURRENT, queueReducer } from "./queueReducer";

const baseTask = (overrides: Partial<GenerationTask>): GenerationTask => ({
  id: "task-1",
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

describe("queueReducer", () => {
  it("starts queued tasks FIFO without exceeding the concurrency limit", () => {
    const state = {
      tasks: [
        baseTask({ id: "queued-newer", createdAt: 20 }),
        baseTask({ id: "queued-older", createdAt: 10 }),
        baseTask({ id: "already-running", status: "running", progress: 40, createdAt: 1 }),
      ],
    };

    const next = queueReducer(state, { type: "SCHEDULE_NEXT" });

    expect(next.tasks.filter((task) => task.status === "running")).toHaveLength(MAX_CONCURRENT);
    expect(next.tasks.find((task) => task.id === "queued-older")?.status).toBe("running");
    expect(next.tasks.find((task) => task.id === "queued-newer")?.status).toBe("queued");
  });

  it("applies progress only to running tasks and completes at 100%", () => {
    const state = {
      tasks: [
        baseTask({ id: "running", status: "running", progress: 92 }),
        baseTask({ id: "queued", status: "queued", progress: 0 }),
      ],
    };

    const next = queueReducer(state, { type: "TICK_TASK", taskId: "running", progressDelta: 12 });

    expect(next.tasks.find((task) => task.id === "running")?.status).toBe("done");
    expect(next.tasks.find((task) => task.id === "running")?.progress).toBe(100);
    expect(next.tasks.find((task) => task.id === "queued")?.progress).toBe(0);
  });

  it("cancels active tasks and ignores later progress ticks for them", () => {
    const state = {
      tasks: [baseTask({ id: "running", status: "running", progress: 44 })],
    };

    const canceled = queueReducer(state, { type: "CANCEL_TASK", taskId: "running" });
    const afterTick = queueReducer(canceled, {
      type: "TICK_TASK",
      taskId: "running",
      progressDelta: 20,
    });

    expect(afterTick.tasks[0]?.status).toBe("canceled");
    expect(afterTick.tasks[0]?.progress).toBe(44);
  });

  it("retries failed and canceled tasks as fresh queued tasks", () => {
    const state = {
      tasks: [
        baseTask({
          id: "failed",
          status: "failed",
          progress: 32,
          error: "Недостаточно кредитов",
        }),
        baseTask({ id: "canceled", status: "canceled", progress: 10 }),
      ],
    };

    const retriedFailed = queueReducer(state, { type: "RETRY_TASK", taskId: "failed", now: 200 });
    const retriedCanceled = queueReducer(retriedFailed, {
      type: "RETRY_TASK",
      taskId: "canceled",
      now: 300,
    });

    expect(retriedCanceled.tasks.find((task) => task.id === "failed")?.status).toBe("queued");
    expect(retriedCanceled.tasks.find((task) => task.id === "failed")?.progress).toBe(0);
    expect(retriedCanceled.tasks.find((task) => task.id === "failed")?.error).toBeUndefined();
    expect(retriedCanceled.tasks.find((task) => task.id === "failed")?.createdAt).toBe(200);
    expect(retriedCanceled.tasks.find((task) => task.id === "canceled")?.status).toBe("queued");
  });
});
