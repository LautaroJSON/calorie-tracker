import type { Sex } from "../types";

export interface BmrInput {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: Sex;
}

export function calculateBmr({ weightKg, heightCm, age, sex }: BmrInput): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}
