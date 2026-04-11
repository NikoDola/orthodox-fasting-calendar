import { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FASTING_COLORS, FASTING_LABELS, dateKey } from "../types";
import type { DayProgress, FastingLevel } from "../types";
import { computeFastingLevel } from "../utils/fasting";
import { orthodoxEaster } from "../utils/easter";

interface Props {
  progress: Record<string, DayProgress>;
  onBack: () => void;
}

const TRACKED_LEVELS: FastingLevel[] = [4, 3, 2, 1];

const LEVEL_DESC: Record<FastingLevel, string> = {
  0: "",
  1: "Само во Месопусната седмица",
  2: "Риба дозволена, без месо",
  3: "Масло и вино дозволени, без месо",
  4: "Строго – без масло, вино, месо",
};

export function ProfileView({ progress, onBack }: Props) {
  const stats = useMemo(() => {
    const completed: Record<FastingLevel, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    const committed: Record<FastingLevel, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };

    for (const [key, prog] of Object.entries(progress)) {
      const date = new Date(key);
      if (isNaN(date.getTime())) continue;
      const easter = orthodoxEaster(date.getFullYear());
      const level = computeFastingLevel(date, easter) as FastingLevel;
      if (prog === "completed") completed[level]++;
      if (prog === "committed") committed[level]++;
    }

    return { completed, committed };
  }, [progress]);

  const totalCompleted = TRACKED_LEVELS.reduce<number>((s, l) => s + stats.completed[l], 0);
  const totalCommitted = TRACKED_LEVELS.reduce<number>((s, l) => s + stats.committed[l], 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#78350f" />

      {/* Top nav bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Мој Профил</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.content}>

          {/* Summary row */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNum}>{totalCompleted}</Text>
              <Text style={styles.summaryLabel}>Направени{"\n"}денови</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryNum, styles.summaryNumCommitted]}>{totalCommitted}</Text>
              <Text style={styles.summaryLabel}>Планирани{"\n"}денови</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>По вид на пост</Text>

          {TRACKED_LEVELS.map((level) => {
            const color = FASTING_COLORS[level];
            const done = stats.completed[level];
            const planned = stats.committed[level];

            return (
              <View key={level} style={styles.levelCard}>
                <View style={styles.levelHeader}>
                  <View style={[styles.levelDot, { backgroundColor: color }]} />
                  <View style={styles.levelInfo}>
                    <Text style={styles.levelName}>{FASTING_LABELS[level]}</Text>
                    <Text style={styles.levelDesc}>{LEVEL_DESC[level]}</Text>
                  </View>
                </View>

                <View style={styles.barRow}>
                  <Text style={styles.barLabel}>Направени</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, {
                      backgroundColor: color,
                      width: totalCompleted === 0 ? 0 : `${Math.max(4, Math.round((done / totalCompleted) * 100))}%` as any,
                    }]} />
                  </View>
                  <Text style={styles.barCount}>{done}</Text>
                </View>

                <View style={styles.barRow}>
                  <Text style={styles.barLabel}>Планирани</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, styles.barFillCommitted, {
                      width: totalCommitted === 0 ? 0 : `${Math.max(4, Math.round((planned / totalCommitted) * 100))}%` as any,
                    }]} />
                  </View>
                  <Text style={styles.barCount}>{planned}</Text>
                </View>
              </View>
            );
          })}

          {totalCompleted === 0 && totalCommitted === 0 && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyCross}>☦</Text>
              <Text style={styles.emptyTitle}>Нема забележани постови</Text>
              <Text style={styles.emptyBody}>
                Притисни и задржи на датум во календарот за да ги следиш твоите постови.
              </Text>
            </View>
          )}

          <View style={styles.bottomPad} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafaf9",
  },
  topBar: {
    backgroundColor: "#78350f",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  backBtnText: {
    fontSize: 24,
    color: "#fff",
    lineHeight: 28,
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#fff",
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  summaryCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 24,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "#f5f5f4",
    marginVertical: 16,
  },
  summaryNum: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#16a34a",
  },
  summaryNumCommitted: {
    color: "#78350f",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#78716c",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 16,
  },
  sectionLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#78716c",
    paddingHorizontal: 4,
    marginTop: 4,
  },
  levelCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    gap: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  levelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  levelDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    flexShrink: 0,
  },
  levelInfo: { flex: 1 },
  levelName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1c1917",
  },
  levelDesc: {
    fontSize: 11,
    color: "#78716c",
    marginTop: 1,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  barLabel: {
    fontSize: 11,
    color: "#a8a29e",
    width: 62,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: "#f5f5f4",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
    minWidth: 0,
  },
  barFillCommitted: {
    backgroundColor: "#78350f",
    opacity: 0.4,
  },
  barCount: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#44403c",
    width: 24,
    textAlign: "right",
  },
  emptyCard: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginTop: 8,
  },
  emptyCross: {
    fontSize: 28,
    color: "#d97706",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#78350f",
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: 12,
    color: "#92400e",
    textAlign: "center",
    lineHeight: 18,
  },
  bottomPad: { height: 16 },
});
