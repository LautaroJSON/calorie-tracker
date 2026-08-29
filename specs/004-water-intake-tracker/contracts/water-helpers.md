# Contract: `lib/calculations/water.ts`

Pure module. No React, no storage, no side effects. Unit-tested in
`lib/calculations/__tests__/water.test.ts`.

## Exports

```ts
export const WATER_STEP_ML = 50;
export const DEFAULT_WATER_GOAL_ML = 2000;

export function nextWaterMl(currentMl: number, deltaMl: number): number;
export function waterFillRatio(currentMl: number, goalMl: number): number;
```

### `nextWaterMl(currentMl, deltaMl)`

Returns the new consumed total after an arrow tap.

- Implementation: `Math.max(0, currentMl + deltaMl)`.
- The up arrow calls `nextWaterMl(current, WATER_STEP_ML)`; the down arrow calls
  `nextWaterMl(current, -WATER_STEP_ML)`.

| `currentMl` | `deltaMl` | result | rule |
|---|---|---|---|
| 0 | 50 | 50 | normal increment |
| 150 | 50 | 200 | normal increment |
| 200 | -50 | 150 | normal decrement |
| 0 | -50 | 0 | never negative (FR-011) |
| 30 | -50 | 0 | never negative |
| 1950 | 50 | 2000 | crossing the goal is unremarkable |
| 2000 | 50 | 2050 | may exceed the goal (FR-013) |

### `waterFillRatio(currentMl, goalMl)`

Returns the vertical bar fill as a number in `[0, 1]`.

- Implementation: `goalMl > 0 ? Math.min(1, currentMl / goalMl) : 0`.
- The component renders bar-fill height as `` `${waterFillRatio(...) * 100}%` ``.

| `currentMl` | `goalMl` | result | rule |
|---|---|---|---|
| 0 | 2000 | 0 | empty |
| 50 | 2000 | 0.025 | 2.5% (spec US1 scenario 1) |
| 1000 | 2000 | 0.5 | half |
| 2000 | 2000 | 1 | full |
| 2500 | 2000 | 1 | capped at full (FR-012) |
| 100 | 0 | 0 | divide-by-zero guard |

## Guarantees

- Both functions are total (defined for every finite numeric input) and referentially
  transparent.
- No rounding inside `nextWaterMl` beyond what the inputs carry; callers only ever pass
  integers (`WATER_STEP_ML` and an integer `currentMl`). `setDayWaterMl` applies
  `Math.round` / `Math.max(0, …)` defensively at the storage boundary.
