# ERA2 — Очередь генераций

Тестовое задание: экран **«Очередь генераций»** для ERA2 с живым клиентским движком очереди, адаптивной версткой по Figma и глобальным плавающим статус-баром активных генераций.

Основной фокус работы — визуальное соответствие дизайн-системе: темная warm coal тема, Geist/Geist Mono, акцент `#E85420`, карточки, бейджи, прогресс-бары и responsive-состояния desktop/tablet/mobile.

## Демо

Экран очереди доступен по маршруту:

```bash
/queue
```

Глобальный status-bar монтируется на уровне приложения и виден поверх страниц, пока есть активные задачи (`queued` + `running`). Клик по нему ведет на `/queue`.

## Стек

- React 19
- TypeScript strict
- Vite
- Tailwind CSS 4
- Radix UI primitives
- lucide-react
- Vitest для unit-тестов логики очереди
- Yarn 4

## Запуск

```bash
yarn install
yarn dev
```

После запуска открыть:

```bash
http://localhost:8080/queue
```

## Проверки

```bash
yarn test
yarn build
yarn lint
yarn tsc --noEmit
```

`yarn lint` может показывать существующие Fast Refresh warnings в старых файлах проекта. Ошибок ESLint для реализованной очереди нет.

## Что реализовано

- Живой список задач генерации.
- Лимит параллельных задач: `MAX_CONCURRENT = 2`.
- FIFO-планирование queued задач по `createdAt`.
- Прогресс running задач с разной скоростью для `text`, `image`, `video`, `audio`.
- Случайные сбои с понятными ошибками.
- Действия по статусам:
  - `queued` / `running` — отмена;
  - `failed` / `canceled` — повтор;
  - `done` — скачать-заглушка;
  - все статусы — меню с удалением.
- Статистика: `В очереди`, `Идёт`, `Готово`, `Ошибка`.
- Фильтр по статусу.
- Фильтр по типу генерации.
- Поиск по prompt/model с debounce.
- Сортировка: новые/старые.
- Loading, empty и error states.
- Desktop/tablet строки и mobile-карточки.
- Глобальный floating status-bar:
  - скрыт, если нет активных задач;
  - single/multiple состояния;
  - collapsed pill на desktop/tablet;
  - полноширинная нижняя панель на mobile.
- Сохранение состояния очереди в `localStorage`.
- Unit-тесты reducer/selectors/engine.

## Архитектура

Проект следует Feature-Sliced Design:

```text
app → pages → widgets → features → entities → shared
```

Основные файлы задачи:

```text
src/
├─ entities/
│  └─ generation-task/
│     ├─ model/
│     │  ├─ types.ts
│     │  └─ seed.ts
│     └─ index.ts
├─ features/
│  └─ generation-queue/
│     ├─ model/
│     │  ├─ queueReducer.ts
│     │  ├─ queueEngine.ts
│     │  ├─ QueueProvider.tsx
│     │  ├─ queueContext.ts
│     │  ├─ selectors.ts
│     │  └─ useQueue.ts
│     ├─ ui/
│     │  ├─ GlobalQueueStatusBar.tsx
│     │  ├─ TaskRow.tsx
│     │  ├─ TaskCard.tsx
│     │  ├─ StatusBadge.tsx
│     │  ├─ ProgressBar.tsx
│     │  ├─ TaskActions.tsx
│     │  ├─ QueueStats.tsx
│     │  ├─ QueueToolbar.tsx
│     │  └─ states/
│     ├─ lib/
│     │  └─ formatEta.ts
│     └─ index.ts
├─ widgets/
│  └─ generation-queue/
│     ├─ ui/GenerationQueue.tsx
│     └─ index.ts
└─ pages/
   └─ QueuePage.tsx
```

Снаружи слайсы используются через публичные `index.ts`, без deep-import между слоями.

## Как работает очередь

`QueueProvider` — единый источник состояния. Он хранит задачи в `useReducer`, запускает mock-движок и отдает данные странице очереди и глобальному status-bar.

`queueReducer` отвечает за конечный автомат статусов:

- `queued → running`
- `running → done`
- `running → failed`
- `queued/running → canceled`
- `failed/canceled → queued`

`queueEngine` раз в тик:

1. Диспетчит `SCHEDULE_NEXT`, чтобы заполнить свободные слоты.
2. Находит running задачи.
3. Либо двигает прогресс через `TICK_TASK`, либо переводит задачу в `failed`.
4. При stop/unmount чистит interval и не отправляет поздние тики.

`selectors` считают статистику, активные задачи для status-bar, фильтрацию, поиск и сортировку.

## Решение по localStorage

Очередь сохраняется в `localStorage` под ключом `era2-generation-queue`.

При восстановлении задачи со статусом `running` переводятся обратно в `queued`. Это сделано намеренно: после перезагрузки страницы клиентский interval был остановлен, поэтому безопаснее вернуть незавершенную работу в очередь и снова запустить ее через единый scheduler, чем пытаться продолжать старый таймер.

Если сохраненное состояние повреждено, показывается error state с кнопкой повторной загрузки. Повтор сбрасывает сохраненный ключ и возвращает seed-данные.

## Решение по роутингу

В проекте уже был простой внутренний router в `shared/routing`, поэтому отдельный `react-router` не добавлялся.

Маршрут `/queue` подключен в `src/app/router/index.tsx` и рендерит тонкую страницу `QueuePage`, которая собирает виджет `GenerationQueue`.

## Визуальная часть

Референсы из Figma:

- `Foundations` — цвета, typography, базовые компоненты.
- `Queue / Desktop 1440`
- `Queue / Tablet 768`
- `Queue / Mobile 390`
- `Chat + Status / Desktop · Tablet · Mobile`
- `Status bar · состояния`

Используются существующие токены проекта:

- `--c-bg`, `--c-bg-1`, `--c-bg-2`, `--c-bg-3`
- `--c-line`, `--c-line-2`
- `--c-fg`, `--c-fg-dim`, `--c-fg-mute`, `--c-fg-low`
- `--c-accent`, `--c-accent-2`, `--c-accent-soft`

Шрифты Geist и Geist Mono уже подключены через `@fontsource-variable/geist` и `@fontsource-variable/geist-mono`.

На `/queue` скрыты маркетинговые overlays проекта, чтобы они не перекрывали тестовый экран и не мешали визуальной оценке.

## Что показать в видео

Рекомендуемый сценарий демонстрации:

1. Открыть Figma и показать фреймы очереди/status-bar как визуальный референс.
2. Открыть `/queue` на desktop.
3. Показать stats, фильтры, поиск, сортировку, строки задач, статусы и действия.
4. Подождать несколько секунд, чтобы было видно живой прогресс и переходы задач.
5. Показать floating status-bar и переход по нему на `/queue`.
6. Переключить viewport на mobile 390px и показать карточки, 2×2 stats, горизонтальные чипы и нижний status-bar.
7. В конце показать успешные проверки `yarn test`, `yarn build`, `yarn lint`.

## Тесты

Покрыта логика очереди:

- `queueReducer.test.ts` — переходы статусов, retry/cancel, лимит running задач.
- `selectors.test.ts` — статистика, active summary, фильтрация, поиск, сортировка.
- `queueEngine.test.ts` — scheduling, скорость разных типов, deterministic fail, cleanup interval.
