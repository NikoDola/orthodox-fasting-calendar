import { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { FASTING_COLORS, MONTH_NAMES_MK, DAY_NAMES_MK_SHORT, dateKey } from "../types";
import type { DayProgress } from "../types";
import { computeFastingLevel } from "../utils/fasting";
import { getSaintInfo } from "../data/saints";

interface Props {
  currentDate: Date;
  today: Date;
  onDayPress: (date: Date) => void;
  onLongPress: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  getEaster: (year: number) => Date;
  progress: Record<string, DayProgress>;
}

export function CalendarView({
  currentDate,
  today,
  onDayPress,
  onLongPress,
  onMonthChange,
  getEaster,
  progress,
}: Props) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const easter = useMemo(() => getEaster(year), [year, getEaster]);

  const firstDayOfMonth = new Date(year, month, 1);
  const startDow = (firstDayOfMonth.getDay() + 6) % 7; // Mon=0, Sun=6
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = useMemo(() => {
    const result: Array<{
      date: Date | null;
      level: number;
      isFeast: boolean;
      isToday: boolean;
    }> = [];
    for (let i = 0; i < startDow; i++) {
      result.push({ date: null, level: 0, isFeast: false, isToday: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const level = computeFastingLevel(date, easter);
      const saint = getSaintInfo(date, easter);
      const isToday = date.toDateString() === today.toDateString();
      result.push({ date, level, isFeast: saint.isFeast, isToday });
    }
    return result;
  }, [year, month, easter, startDow, daysInMonth, today]);

  // Build rows of 7
  const rows: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  return (
    <View style={styles.container}>
      {/* Month navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity
          onPress={() => onMonthChange(new Date(year, month - 1, 1))}
          style={styles.navBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.navArrow}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onMonthChange(new Date())}
          style={styles.monthCenter}
          activeOpacity={0.7}
        >
          <Text style={styles.monthName}>{MONTH_NAMES_MK[month]}</Text>
          <Text style={styles.yearText}>{year}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onMonthChange(new Date(year, month + 1, 1))}
          style={styles.navBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Day-of-week headers */}
      <View style={styles.dowRow}>
        {DAY_NAMES_MK_SHORT.map((name, i) => (
          <View key={name} style={styles.dowCell}>
            <Text
              style={[styles.dowText, i === 6 && styles.dowTextSunday]}
            >
              {name}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <ScrollView style={styles.gridScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {rows.map((row, ri) => (
            <View key={ri} style={styles.gridRow}>
              {row.map((cell, ci) => {
                if (!cell.date) {
                  return <View key={`e-${ri}-${ci}`} style={styles.emptyCell} />;
                }
                const dow = (cell.date.getDay() + 6) % 7;
                const isSunday = dow === 6;
                const color = FASTING_COLORS[cell.level as keyof typeof FASTING_COLORS];

                const cellProgress = progress[dateKey(cell.date)];

                return (
                  <TouchableOpacity
                    key={cell.date.toISOString()}
                    onPress={() => onDayPress(cell.date!)}
                    onLongPress={() => onLongPress(cell.date!)}
                    delayLongPress={400}
                    style={styles.dayCell}
                    activeOpacity={0.6}
                  >
                    {/* Feast star */}
                    {cell.isFeast && (
                      <Text style={styles.feastStar}>★</Text>
                    )}
                    {/* Fasting dot */}
                    {cell.level > 0 && (
                      <View
                        style={[styles.fastingDot, { backgroundColor: color }]}
                      />
                    )}
                    {/* Day number circle */}
                    <View
                      style={[
                        styles.dayCircle,
                        cell.isToday && styles.dayCircleToday,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayNumber,
                          cell.isToday && styles.dayNumberToday,
                          !cell.isToday && isSunday && styles.dayNumberSunday,
                        ]}
                      >
                        {cell.date.getDate()}
                      </Text>
                    </View>
                    {/* Fasting color bar at bottom */}
                    {cell.level > 0 && (
                      <View
                        style={[styles.fastingBar, { backgroundColor: color }]}
                      />
                    )}
                    {/* Progress indicator */}
                    {cellProgress && (
                      <View style={[
                        styles.progressDot,
                        cellProgress === "completed"
                          ? styles.progressDotCompleted
                          : styles.progressDotCommitted,
                      ]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Fasting legend */}
      <FastingLegend />
    </View>
  );
}

function FastingLegend() {
  const items = [
    { color: FASTING_COLORS[0], label: "Нема пост" },
    { color: FASTING_COLORS[1], label: "Без месо" },
    { color: FASTING_COLORS[2], label: "Пост на риба" },
    { color: FASTING_COLORS[3], label: "Пост на масло" },
    { color: FASTING_COLORS[4], label: "Строг пост" },
  ];

  return (
    <View style={styles.legend}>
      <View style={styles.legendRow}>
        {items.map((item) => (
          <View key={item.label} style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: item.color }]}
            />
            <Text style={styles.legendLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const CELL_HEIGHT = 56;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafaf9",
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f4",
  },
  navBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#f5f5f4",
  },
  navArrow: {
    fontSize: 22,
    color: "#57534e",
    lineHeight: 26,
  },
  monthCenter: {
    alignItems: "center",
  },
  monthName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#78350f",
  },
  yearText: {
    fontSize: 13,
    color: "#78716c",
    marginTop: 1,
  },
  dowRow: {
    flexDirection: "row",
    backgroundColor: "#fffbeb",
    borderBottomWidth: 1,
    borderBottomColor: "#e7e5e4",
  },
  dowCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  dowText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#57534e",
  },
  dowTextSunday: {
    color: "#dc2626",
  },
  gridScroll: {
    flex: 1,
  },
  grid: {
    backgroundColor: "#e7e5e4",
    gap: 1,
  },
  gridRow: {
    flexDirection: "row",
    gap: 1,
  },
  emptyCell: {
    flex: 1,
    height: CELL_HEIGHT,
    backgroundColor: "#fafaf9",
  },
  dayCell: {
    flex: 1,
    height: CELL_HEIGHT,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  feastStar: {
    position: "absolute",
    top: 3,
    left: 4,
    fontSize: 9,
    color: "#f59e0b",
    lineHeight: 12,
  },
  fastingDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleToday: {
    backgroundColor: "#78350f",
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1c1917",
  },
  dayNumberToday: {
    color: "#fff",
    fontWeight: "bold",
  },
  dayNumberSunday: {
    color: "#dc2626",
  },
  fastingBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  progressDot: {
    position: "absolute",
    bottom: 5,
    left: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressDotCompleted: {
    backgroundColor: "#16a34a",
  },
  progressDotCommitted: {
    backgroundColor: "#78350f",
    opacity: 0.5,
  },
  legend: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f5f5f4",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendLabel: {
    fontSize: 11,
    color: "#57534e",
  },
});
