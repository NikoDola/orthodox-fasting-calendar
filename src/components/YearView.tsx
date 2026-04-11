import { useMemo, useState } from "react";
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
  today: Date;
  onDayPress: (date: Date) => void;
  onLongPress: (date: Date) => void;
  getEaster: (year: number) => Date;
  progress: Record<string, DayProgress>;
  selectionMode: boolean;
  selectionDraft: Record<string, DayProgress>;
  onSelectionTap: (date: Date) => void;
  onSelectionRange: (date: Date) => void;
}

export function YearView({ today, onDayPress, onLongPress, getEaster, progress, selectionMode, selectionDraft, onSelectionTap, onSelectionRange }: Props) {
  const [year, setYear] = useState(today.getFullYear());
  const easter = useMemo(() => getEaster(year), [year, getEaster]);

  return (
    <View style={styles.container}>
      {/* Year navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity
          onPress={() => setYear((y) => y - 1)}
          style={styles.navBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.navArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.yearText}>{year}</Text>
        <TouchableOpacity
          onPress={() => setYear((y) => y + 1)}
          style={styles.navBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.monthsContainer}>
          {Array.from({ length: 12 }, (_, m) => (
            <MiniMonth
              key={m}
              year={year}
              month={m}
              today={today}
              easter={easter}
              onDayPress={onDayPress}
              onLongPress={onLongPress}
              progress={progress}
              selectionMode={selectionMode}
              selectionDraft={selectionDraft}
              onSelectionTap={onSelectionTap}
              onSelectionRange={onSelectionRange}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

interface MiniMonthProps {
  year: number;
  month: number;
  today: Date;
  easter: Date;
  onDayPress: (date: Date) => void;
  onLongPress: (date: Date) => void;
  progress: Record<string, DayProgress>;
  selectionMode: boolean;
  selectionDraft: Record<string, DayProgress>;
  onSelectionTap: (date: Date) => void;
  onSelectionRange: (date: Date) => void;
}

function MiniMonth({ year, month, today, easter, onDayPress, onLongPress, progress, selectionMode, selectionDraft, onSelectionTap, onSelectionRange }: MiniMonthProps) {
  const firstDayOfMonth = new Date(year, month, 1);
  const startDow = (firstDayOfMonth.getDay() + 6) % 7;
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
      result.push({
        date,
        level,
        isFeast: saint.isFeast,
        isToday: date.toDateString() === today.toDateString(),
      });
    }
    // Pad the last row to a full 7 so cells don't stretch
    const remainder = result.length % 7;
    if (remainder !== 0) {
      for (let i = 0; i < 7 - remainder; i++) {
        result.push({ date: null, level: 0, isFeast: false, isToday: false });
      }
    }
    return result;
  }, [year, month, easter, startDow, daysInMonth, today]);

  // Build rows of 7
  const rows: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  return (
    <View style={styles.miniMonth}>
      {/* Month header */}
      <View style={styles.miniMonthHeader}>
        <Text style={styles.miniMonthTitle}>
          {MONTH_NAMES_MK[month]} {year}
        </Text>
      </View>

      {/* Day headers */}
      <View style={styles.miniDowRow}>
        {DAY_NAMES_MK_SHORT.map((d, i) => (
          <View key={d} style={styles.miniDowCell}>
            <Text
              style={[
                styles.miniDowText,
                i === 6 && styles.miniDowTextSunday,
              ]}
            >
              {d}
            </Text>
          </View>
        ))}
      </View>

      {/* Cells */}
      {rows.map((row, ri) => (
        <View key={ri} style={styles.miniGridRow}>
          {row.map((cell, ci) => {
            if (!cell.date) {
              return <View key={`e-${ri}-${ci}`} style={styles.miniEmptyCell} />;
            }
            const dow = (cell.date.getDay() + 6) % 7;
            const isSunday = dow === 6;
            const color = FASTING_COLORS[cell.level as keyof typeof FASTING_COLORS];
            const cellProgress = progress[dateKey(cell.date)];
            const isSelected = selectionMode && !!selectionDraft[dateKey(cell.date)];
            const selProg = selectionDraft[dateKey(cell.date)];

            return (
              <TouchableOpacity
                key={cell.date.toISOString()}
                onPress={() => selectionMode ? onSelectionTap(cell.date!) : onDayPress(cell.date!)}
                onLongPress={() => selectionMode ? onSelectionRange(cell.date!) : onLongPress(cell.date!)}
                delayLongPress={400}
                style={[
                  styles.miniDayCell,
                  !isSelected && cell.level > 0 && { backgroundColor: color + "33" },
                  isSelected && (selProg === "completed" ? styles.miniCellSelectedCompleted : styles.miniCellSelectedCommitted),
                ]}
                activeOpacity={0.6}
              >
                <View
                  style={[
                    styles.miniDayCircle,
                    cell.isToday && styles.miniDayCircleToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.miniDayNumber,
                      cell.isToday && styles.miniDayNumberToday,
                      !cell.isToday && isSunday && styles.miniDayNumberSunday,
                    ]}
                  >
                    {cell.date.getDate()}
                  </Text>
                </View>
                {cell.isFeast && (
                  <Text style={styles.miniFeastStar}>★</Text>
                )}
                {cellProgress && (
                  <View style={[
                    styles.miniProgressDot,
                    cellProgress === "completed"
                      ? styles.miniProgressDotCompleted
                      : styles.miniProgressDotCommitted,
                  ]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

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
    borderRadius: 20,
    backgroundColor: "#f5f5f4",
    alignItems: "center",
    justifyContent: "center",
  },
  navArrow: {
    fontSize: 22,
    color: "#57534e",
    lineHeight: 26,
  },
  yearText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#78350f",
  },
  scroll: {
    flex: 1,
  },
  monthsContainer: {
    padding: 8,
    gap: 16,
  },
  miniMonth: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  miniMonthHeader: {
    backgroundColor: "#78350f",
    paddingVertical: 8,
    alignItems: "center",
  },
  miniMonthTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  miniDowRow: {
    flexDirection: "row",
    paddingVertical: 4,
  },
  miniDowCell: {
    flex: 1,
    alignItems: "center",
  },
  miniDowText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#78716c",
  },
  miniDowTextSunday: {
    color: "#ef4444",
  },
  miniGridRow: {
    flexDirection: "row",
  },
  miniEmptyCell: {
    flex: 1,
    height: 32,
  },
  miniDayCell: {
    flex: 1,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  miniDayCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  miniDayCircleToday: {
    backgroundColor: "#78350f",
  },
  miniDayNumber: {
    fontSize: 11,
    fontWeight: "500",
    color: "#1c1917",
  },
  miniDayNumberToday: {
    color: "#fff",
  },
  miniDayNumberSunday: {
    color: "#dc2626",
  },
  miniFeastStar: {
    position: "absolute",
    top: 1,
    right: 3,
    fontSize: 6,
    color: "#f59e0b",
    lineHeight: 8,
  },
  miniCellSelectedCompleted: {
    backgroundColor: "#dcfce7",
  },
  miniCellSelectedCommitted: {
    backgroundColor: "#fef3c7",
  },
  miniProgressDot: {
    position: "absolute",
    bottom: 2,
    left: 2,
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  miniProgressDotCompleted: {
    backgroundColor: "#16a34a",
  },
  miniProgressDotCommitted: {
    backgroundColor: "#78350f",
    opacity: 0.5,
  },
});
