import { Calendar, type DateData } from "react-native-calendars";
import { StyleSheet } from "react-native";

import { Card } from "./Card";
import { todayIsoDate } from "../lib/storage/keys";
import { colors, radius } from "../lib/theme";

interface DayMarking {
  marked?: boolean;
  dotColor?: string;
  selected?: boolean;
  selectedColor?: string;
}

interface DayCalendarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function DayCalendar({ selectedDate, onSelectDate }: DayCalendarProps) {
  const today = todayIsoDate();

  const markedDates: Record<string, DayMarking> = {
    [today]: { marked: true, dotColor: colors.warning },
    [selectedDate]: {
      ...(selectedDate === today ? { marked: true, dotColor: colors.warning } : {}),
      selected: true,
      selectedColor: colors.primary,
    },
  };

  return (
    <Card style={styles.card}>
      <Calendar
        current={selectedDate}
        maxDate={today}
        markedDates={markedDates}
        onDayPress={(day: DateData) => onSelectDate(day.dateString)}
        style={styles.calendar}
        theme={{
          calendarBackground: colors.surface,
          todayTextColor: colors.warning,
          arrowColor: colors.primary,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: colors.surface,
          textDayFontWeight: "500",
          textMonthFontWeight: "700",
          textDayHeaderFontWeight: "600",
        }}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: "hidden",
  },
  calendar: {
    borderRadius: radius.lg,
  },
});
