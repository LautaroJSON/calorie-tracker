import { calculateBmr } from "../bmr";

describe("calculateBmr", () => {
  it("computes BMR for a male profile using the revised Harris-Benedict formula", () => {
    // 10*70 + 6.25*175 - 5*30 + 5 = 700 + 1093.75 - 150 + 5 = 1648.75
    const bmr = calculateBmr({ weightKg: 70, heightCm: 175, age: 30, sex: "male" });
    expect(bmr).toBeCloseTo(1648.75);
  });

  it("computes BMR for a female profile using the revised Harris-Benedict formula", () => {
    // 10*60 + 6.25*165 - 5*25 - 161 = 600 + 1031.25 - 125 - 161 = 1345.25
    const bmr = calculateBmr({ weightKg: 60, heightCm: 165, age: 25, sex: "female" });
    expect(bmr).toBeCloseTo(1345.25);
  });
});
