import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { FASTING_COLORS, FASTING_DESCRIPTIONS, MONTH_NAMES_MK } from "../types";
import type { FastingLevel } from "../types";

interface DayData {
  date: Date;
  saint: string;
  description: string;
  fastingLevel: FastingLevel;
  fastingLabel: string;
  isFeast: boolean;
  isToday: boolean;
}

interface Props {
  data: DayData;
  onClose: () => void;
}

const FASTING_BG: Record<FastingLevel, string> = {
  0: "#f0fdf4",
  1: "#fffbeb",
  2: "#f0f9ff",
  3: "#fdf2f8",
  4: "#f5f5f4",
};

const FASTING_BORDER: Record<FastingLevel, string> = {
  0: "#bbf7d0",
  1: "#fde68a",
  2: "#bae6fd",
  3: "#f9a8d4",
  4: "#d6d3d1",
};

const DAY_NAMES = [
  "Недела",
  "Понеделник",
  "Вторник",
  "Среда",
  "Четврток",
  "Петок",
  "Сабота",
];

export function DayDetail({ data, onClose }: Props) {
  const { date, saint, description, fastingLevel, fastingLabel, isFeast, isToday } = data;

  const dayName = DAY_NAMES[date.getDay()];
  const dateStr = `${date.getDate()} ${MONTH_NAMES_MK[date.getMonth()]} ${date.getFullYear()}`;
  const color = FASTING_COLORS[fastingLevel];

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              {/* Pull handle */}
              <View style={styles.handleRow}>
                <View style={styles.handle} />
              </View>

              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  {isToday && (
                    <View style={styles.todayBadge}>
                      <Text style={styles.todayBadgeText}>Денес</Text>
                    </View>
                  )}
                  <Text style={styles.dayName}>{dayName}</Text>
                  <Text style={styles.dateStr}>{dateStr}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                  <Text style={styles.closeBtnText}>×</Text>
                </TouchableOpacity>
              </View>

              {/* Scrollable content */}
              <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Cross banner */}
                <View style={styles.banner}>
                  <Text style={styles.bannerCross}>☦</Text>
                  {isFeast && (
                    <View style={styles.feastBadge}>
                      <Text style={styles.feastBadgeText}>★ Празник</Text>
                    </View>
                  )}
                </View>

                <View style={styles.content}>
                  {/* Saint */}
                  <View>
                    <Text style={styles.sectionLabel}>Светец на денот</Text>
                    <Text style={styles.saintName}>{saint}</Text>
                    <Text style={styles.saintDesc}>{description}</Text>
                  </View>

                  {/* Fasting card */}
                  <View
                    style={[
                      styles.fastingCard,
                      {
                        backgroundColor: FASTING_BG[fastingLevel],
                        borderColor: FASTING_BORDER[fastingLevel],
                      },
                    ]}
                  >
                    <View style={styles.fastingCardHeader}>
                      <View
                        style={[styles.fastingColorDot, { backgroundColor: color }]}
                      />
                      <Text style={styles.fastingLabel}>{fastingLabel}</Text>
                    </View>
                    <Text style={styles.fastingDesc}>
                      {FASTING_DESCRIPTIONS[fastingLevel]}
                    </Text>
                  </View>

                  {/* Level scale */}
                  <View>
                    <Text style={styles.sectionLabel}>Ниво на пост</Text>
                    <View style={styles.scaleRow}>
                      {([0, 1, 2, 3, 4] as FastingLevel[]).map((lvl) => (
                        <View key={lvl} style={styles.scaleItem}>
                          <View
                            style={[
                              styles.scaleBar,
                              {
                                backgroundColor: FASTING_COLORS[lvl],
                                opacity: lvl === fastingLevel ? 1 : 0.3,
                                transform: [{ scaleY: lvl === fastingLevel ? 1.2 : 1 }],
                              },
                            ]}
                          />
                          <Text
                            style={[
                              styles.scaleNum,
                              lvl === fastingLevel
                                ? styles.scaleNumActive
                                : styles.scaleNumInactive,
                            ]}
                          >
                            {lvl}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
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
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    overflow: "hidden",
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f4",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
  },
  todayBadge: {
    backgroundColor: "#78350f",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  todayBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  dayName: {
    fontSize: 13,
    color: "#78716c",
  },
  dateStr: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1c1917",
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
  scroll: {
    flexGrow: 0,
  },
  banner: {
    height: 160,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bannerCross: {
    fontSize: 56,
    color: "#92400e",
  },
  feastBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#78350f",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  feastBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 16,
    gap: 16,
  },
  sectionLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#a8a29e",
    marginBottom: 4,
  },
  saintName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#78350f",
    marginBottom: 4,
  },
  saintDesc: {
    fontSize: 13,
    color: "#57534e",
    lineHeight: 20,
  },
  fastingCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  fastingCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  fastingColorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 10,
  },
  fastingLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1c1917",
  },
  fastingDesc: {
    fontSize: 13,
    color: "#57534e",
    lineHeight: 20,
  },
  scaleRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginTop: 4,
  },
  scaleItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  scaleBar: {
    width: "100%",
    height: 10,
    borderRadius: 5,
  },
  scaleNum: {
    fontSize: 11,
  },
  scaleNumActive: {
    color: "#44403c",
    fontWeight: "bold",
  },
  scaleNumInactive: {
    color: "#a8a29e",
  },
});
