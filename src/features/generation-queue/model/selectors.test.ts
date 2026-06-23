import { describe, expect, it } from "vitest";
import type { GenerationTask } from "@/entities/generation-task";
import {
  getActiveSummary,
  getQueueStats,
  selectVisibleTasks,
} from "./selectors";

const task = (overrides: Partial<GenerationTask>): GenerationTask => ({
  id: "task",
  type: "text",
  prompt: "Базовый промпт",
  model: "GPT-4o",
  status: "queued",
  progress: 0,
  createdAt: 1,
  credits: 6,
  estimatedMs: 8_000,
  ...overrides,
});

describe("queue selectors", () => {
  const tasks: GenerationTask[] = [
    task({ id: "running-image", type: "image", prompt: "Неоновый город", status: "running", progress: 64, createdAt: 10 }),
    task({ id: "running-video", type: "video", prompt: "Горное озеро", status: "running", progress: 28, createdAt: 20 }),
    task({ id: "queued-text", prompt: "Сценарий ролика", status: "queued", createdAt: 30 }),
    task({ id: "done-logo", type: "image", prompt: "Минималистичный логотип", status: "done", progress: 100, createdAt: 40 }),
    task({ id: "failed-audio", type: "audio", prompt: "Озвучка приветствия", status: "failed", error: "Недостаточно кредитов", createdAt: 50 }),
    task({ id: "canceled-poster", type: "image", prompt: "Постер 80-х", status: "canceled", createdAt: 60 }),
  ];

  it("counts queue statuses for stat cards", () => {
    expect(getQueueStats(tasks)).toEqual({
      queued: 1,
      running: 2,
      done: 1,
      failed: 1,
    });
  });

  it("builds active generation summary for the floating status bar", () => {
    expect(getActiveSummary(tasks)).toEqual({
      count: 3,
      averageProgress: 31,
      tasks: [tasks[0], tasks[1], tasks[2]],
    });
  });

  it("filters by status, type and prompt query, then sorts newest first", () => {
    const visible = selectVisibleTasks(tasks, {
      status: "all",
      type: "image",
      sort: "newest",
      query: "о",
    });

    expect(visible.map((item) => item.id)).toEqual(["canceled-poster", "done-logo", "running-image"]);
  });

  it("sorts oldest first when requested", () => {
    const visible = selectVisibleTasks(tasks, {
      status: "all",
      type: "all",
      sort: "oldest",
      query: "",
    });

    expect(visible.map((item) => item.id)).toEqual([
      "running-image",
      "running-video",
      "queued-text",
      "done-logo",
      "failed-audio",
      "canceled-poster",
    ]);
  });
});
