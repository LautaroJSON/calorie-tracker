import { LineChart } from "react-native-gifted-charts";

import { Card } from "./Card";
import { colors } from "../lib/theme";

export interface NetCaloriesPoint {
  date: string;
  netCalories: number;
}

interface NetCaloriesChartProps {
  points: NetCaloriesPoint[];
}

export function NetCaloriesChart({ points }: NetCaloriesChartProps) {
  const data = points.map((point) => ({
    value: point.netCalories,
    label: point.date.slice(5),
  }));

  return (
    <Card>
      <LineChart
        data={data}
        color={colors.primary}
        thickness={3}
        curved
        dataPointsColor={colors.primary}
        yAxisTextStyle={{ color: colors.textSecondary }}
        xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
        noOfSections={4}
        spacing={Math.max(40, 320 / Math.max(data.length, 1))}
        rulesColor={colors.background}
        yAxisColor={colors.background}
        xAxisColor={colors.background}
      />
    </Card>
  );
}
