import { useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import {
  FASTING_COLORS,
  FASTING_LABELS,
  dateKey,
} from "../types";
import type { DayProgress, FastingLevel } from "../types";
import { computeFastingLevel } from "../utils/fasting";
import { orthodoxEaster } from "../utils/easter";

interface Props {
  progress: Record<string, DayProgress>;
  onClose: () => void;
}

const TRACKED_LEVELS: FastingLevel[] = [4, 3, 2, 1];

const LEVEL_DESC: Record<FastingLevel, string> = {
  0: "",
  1: "Само во Месопусната седмица",
  2: "Риба дозволена, без месо",
  3: "Масло и вино дозволени, без месо",
  4: "Строго – без масло, вино, месо",
};

export function ProfileView({ progress, onClose }: Props) {
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
    <Modal visible transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              {/* Handle */}
              <View style={styles.handleRow}>
                <View style={styles.handle} />
              </View>

              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <Text style={styles.headerTitle}>Мој Профил</Text>
                  <Text style={styles.headerSub}>Историја на постење</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                  <Text style={styles.closeBtnText}>×</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
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

                  {/* Per-level breakdown */}
                  <Text style={styles.sectionLabel}>По вид на пост</Text>

                  {TRACKED_LEVELS.map((level) => {
                    const color = FASTING_COLORS[level];
                    const done = stats.completed[level];
                    const planned = stats.committed[level];
                    const maxVal = Math.max(done, 1);

                    return (
                      <View key={level} style={styles.levelCard}>
                        <View style={styles.levelHeader}>
                          <View style={[styles.levelDot, { backgroundColor: color }]} />
                          <View style={styles.levelInfo}>
                            <Text style={styles.levelName}>{FASTING_LABELS[level]}</Text>
                            <Text style={styles.levelDesc}>{LEVEL_DESC[level]}</Text>
                          </View>
                        </View>

                        {/* Completed row */}
                        <View style={styles.barRow}>
                          <Text style={styles.barLabel}>Направени</Text>
                          <View style={styles.barTrack}>
                            <View
                              style={[
                                styles.barFill,
                                {
                                  backgroundColor: color,
                                  width: done === 0 ? 4 : `${Math.min(100, (done / Math.max(totalCompleted, 1)) * 100)}%` as any,
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.barCount}>{done}</Text>
                        </View>

                        {/* Committed row */}
                        <View style={styles.barRow}>
                          <Text style={styles.barLabel}>Планирани</Text>
                          <View style={styles.barTrack}>
                            <View
                              style={[
                                styles.barFill,
                                styles.barFillCommitted,
                                {
                                  width: planned === 0 ? 4 : `${Math.min(100, (planned / Math.max(totalCommitted, 1)) * 100)}%` as any,
                                },
                              ]}
                            />
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
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fafaf9",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  handleRow: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d6d3d1",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f4",
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1c1917",
  },
  headerSub: {
    fontSize: 13,
    color: "#78716c",
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f5f4",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    marginTop: 4,
  },
  closeBtnText: {
    fontSize: 20,
    color: "#78716c",
    lineHeight: 24,
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
    paddingVertical: 20,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "#f5f5f4",
    marginVertical: 16,
  },
  summaryNum: {
    fontSize: 36,
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
  levelInfo: {
    flex: 1,
  },
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
    minWidth: 4,
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
  bottomPad: {
    height: 16,
  },
});
