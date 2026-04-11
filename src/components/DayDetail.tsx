import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FASTING_COLORS, FASTING_DESCRIPTIONS, MONTH_NAMES_MK } from "../types";
import type { FastingLevel, DayProgress } from "../types";

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
  progress?: DayProgress;
  onSetProgress: (prog: DayProgress) => void;
  onDeleteProgress: () => void;
  onClose: () => void;
}

const FASTING_BG: Record<FastingLevel, string> = {
  0: "#f0fdf4",
  1: "#fffbeb",
  2: "#f0f9ff",
  3: "#fffbeb",
  4: "#fef2f2",
};

const FASTING_BORDER: Record<FastingLevel, string> = {
  0: "#bbf7d0",
  1: "#fde68a",
  2: "#bae6fd",
  3: "#fcd34d",
  4: "#fca5a5",
};

const DAY_NAMES = [
  "Недела", "Понеделник", "Вторник", "Среда", "Четврток", "Петок", "Сабота",
];

export function DayDetail({ data, progress, onSetProgress, onDeleteProgress, onClose }: Props) {
  const { date, saint, description, fastingLevel, fastingLabel, isFeast, isToday } = data;

  const dayName = DAY_NAMES[date.getDay()];
  const dateStr = `${date.getDate()} ${MONTH_NAMES_MK[date.getMonth()]} ${date.getFullYear()}`;
  const color = FASTING_COLORS[fastingLevel];

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const isPast = d < now;
  const isFuture = d > now;

  return (
    <Modal
      visible
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor="#78350f" />
      <SafeAreaView style={styles.container}>
        {/* Top navigation bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.navBtn} activeOpacity={0.7}>
            <Text style={styles.navBtnText}>←</Text>
          </TouchableOpacity>

          <View style={styles.topBarCenter}>
            {isToday && (
              <View style={styles.todayBadge}>
                <Text style={styles.todayBadgeText}>Денес</Text>
              </View>
            )}
            <Text style={styles.topBarDayName}>{dayName}</Text>
            <Text style={styles.topBarDate}>{dateStr}</Text>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.navBtn} activeOpacity={0.7}>
            <Text style={styles.navBtnText}>×</Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable content */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Cross banner */}
          <View style={styles.banner}>
            <Text style={styles.bannerCross}>☦</Text>
            {isFeast && (
              <View style={styles.feastBadge}>
                <Text style={styles.feastBadgeText}>★ Празник</Text>
              </View>
            )}
          </View>

          {/* Saint */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Светец на денот</Text>
            <Text style={styles.saintName}>{saint}</Text>
            <Text style={styles.saintDesc}>{description}</Text>
          </View>

          {/* Fasting card */}
          <View style={[styles.fastingCard, { backgroundColor: FASTING_BG[fastingLevel], borderColor: FASTING_BORDER[fastingLevel] }]}>
            <View style={styles.fastingCardHeader}>
              <View style={[styles.fastingColorDot, { backgroundColor: color }]} />
              <Text style={styles.fastingLabel}>{fastingLabel}</Text>
            </View>
            <Text style={styles.fastingDesc}>{FASTING_DESCRIPTIONS[fastingLevel]}</Text>
          </View>

          {/* Level scale */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Ниво на пост</Text>
            <View style={styles.scaleRow}>
              {([0, 1, 2, 3, 4] as FastingLevel[]).map((lvl) => (
                <View key={lvl} style={styles.scaleItem}>
                  <View style={[styles.scaleBar, {
                    backgroundColor: FASTING_COLORS[lvl],
                    opacity: lvl === fastingLevel ? 1 : 0.3,
                    transform: [{ scaleY: lvl === fastingLevel ? 1.2 : 1 }],
                  }]} />
                  <Text style={[styles.scaleNum, lvl === fastingLevel ? styles.scaleNumActive : styles.scaleNumInactive]}>
                    {lvl}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Progress / tracking */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Мој пост</Text>

            {/* ── PAST ─────────────────────────────────────── */}
            {isPast && (
              <>
                {progress === "completed" ? (
                  <>
                    <View style={[styles.statusBadge, styles.statusCompleted]}>
                      <Text style={styles.statusText}>✓  Овој пост е веќе направен</Text>
                    </View>
                    <TouchableOpacity style={[styles.actionBtn, styles.btnDelete]} onPress={onDeleteProgress} activeOpacity={0.8}>
                      <Text style={styles.btnDeleteText}>✕  Избриши го од прогрес</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity style={[styles.actionBtn, styles.btnComplete]} onPress={() => onSetProgress("completed")} activeOpacity={0.8}>
                    <Text style={styles.btnText}>✓  Го направив овој пост</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            {/* ── TODAY ────────────────────────────────────── */}
            {isToday && (
              <>
                {progress === "completed" && (
                  <>
                    <View style={[styles.statusBadge, styles.statusCompleted]}>
                      <Text style={styles.statusText}>✓  Го направив денес</Text>
                    </View>
                    <TouchableOpacity style={[styles.actionBtn, styles.btnDelete]} onPress={onDeleteProgress} activeOpacity={0.8}>
                      <Text style={styles.btnDeleteText}>✕  Избриши го од прогрес</Text>
                    </TouchableOpacity>
                  </>
                )}
                {progress === "committed" && (
                  <>
                    <View style={[styles.statusBadge, styles.statusCommitted]}>
                      <Text style={styles.statusText}>☑  Планирано за денес</Text>
                    </View>
                    <TouchableOpacity style={[styles.actionBtn, styles.btnComplete]} onPress={() => onSetProgress("completed")} activeOpacity={0.8}>
                      <Text style={styles.btnText}>✓  Го направив овој пост</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.btnDelete, { marginTop: 8 }]} onPress={onDeleteProgress} activeOpacity={0.8}>
                      <Text style={styles.btnDeleteText}>✕  Избриши го од прогрес</Text>
                    </TouchableOpacity>
                  </>
                )}
                {!progress && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.actionBtn, styles.btnComplete, styles.actionBtnFlex]} onPress={() => onSetProgress("completed")} activeOpacity={0.8}>
                      <Text style={styles.btnText}>✓  Го направив</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.btnCommit, styles.actionBtnFlex]} onPress={() => onSetProgress("committed")} activeOpacity={0.8}>
                      <Text style={styles.btnText}>☑  Ќе го направам</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}

            {/* ── FUTURE ───────────────────────────────────── */}
            {isFuture && (
              <>
                {progress === "committed" ? (
                  <>
                    <View style={[styles.statusBadge, styles.statusCommitted]}>
                      <Text style={styles.statusText}>☑  Ќе го направам овој пост</Text>
                    </View>
                    <TouchableOpacity style={[styles.actionBtn, styles.btnDelete]} onPress={onDeleteProgress} activeOpacity={0.8}>
                      <Text style={styles.btnDeleteText}>✕  Избриши го од прогрес</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity style={[styles.actionBtn, styles.btnCommit]} onPress={() => onSetProgress("committed")} activeOpacity={0.8}>
                    <Text style={styles.btnText}>☑  Ќе го направам овој пост</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
  navBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  navBtnText: {
    fontSize: 24,
    color: "#fff",
    lineHeight: 28,
  },
  topBarCenter: {
    flex: 1,
    alignItems: "center",
  },
  todayBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 2,
  },
  todayBadgeText: {
    color: "#fde68a",
    fontSize: 11,
    fontWeight: "600",
  },
  topBarDayName: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
  },
  topBarDate: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
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
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#a8a29e",
    marginBottom: 6,
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
    marginHorizontal: 20,
    marginTop: 20,
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
  scaleNum: { fontSize: 11 },
  scaleNumActive: { color: "#44403c", fontWeight: "bold" },
  scaleNumInactive: { color: "#a8a29e" },
  statusBadge: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  statusCompleted: { backgroundColor: "#dcfce7" },
  statusCommitted: { backgroundColor: "#fef3c7" },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1c1917",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  actionBtnFlex: {
    flex: 1,
  },
  btnComplete: { backgroundColor: "#16a34a" },
  btnCommit: { backgroundColor: "#78350f" },
  btnDelete: { backgroundColor: "#fee2e2" },
  btnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  btnDeleteText: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "600",
  },
});
