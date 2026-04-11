import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import type { DayProgress } from "../types";
import { MONTH_NAMES_MK } from "../types";

const DAY_NAMES_FULL = [
  "Недела", "Понеделник", "Вторник", "Среда", "Четврток", "Петок", "Сабота",
];

interface Props {
  date: Date;
  progress?: DayProgress;
  onSetProgress: (prog: DayProgress) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function ProgressPopup({ date, progress, onSetProgress, onDelete, onClose }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const isPast = d < today;

  const dayName = DAY_NAMES_FULL[date.getDay()];
  const dateStr = `${date.getDate()} ${MONTH_NAMES_MK[date.getMonth()]} ${date.getFullYear()}`;

  const canComplete = progress !== "completed";
  const canCommit = !isPast && !progress;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {/* Date header */}
              <Text style={styles.dayName}>{dayName}</Text>
              <Text style={styles.dateStr}>{dateStr}</Text>

              {/* Current status */}
              {progress && (
                <View style={[
                  styles.statusBadge,
                  progress === "completed" ? styles.statusCompleted : styles.statusCommitted,
                ]}>
                  <Text style={styles.statusText}>
                    {progress === "completed" ? "✓ Го направив" : "☑ Ќе го направам"}
                  </Text>
                </View>
              )}

              <View style={styles.buttons}>
                {/* Mark as completed */}
                {canComplete && (
                  <TouchableOpacity
                    style={[styles.btn, styles.btnComplete]}
                    onPress={() => onSetProgress("completed")}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnText}>✓  Го направив овој пост</Text>
                  </TouchableOpacity>
                )}

                {/* Commit to future fasting */}
                {canCommit && (
                  <TouchableOpacity
                    style={[styles.btn, styles.btnCommit]}
                    onPress={() => onSetProgress("committed")}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnText}>☑  Ќе го направам овој пост</Text>
                  </TouchableOpacity>
                )}

                {/* Delete progress */}
                {progress && (
                  <TouchableOpacity
                    style={[styles.btn, styles.btnDelete]}
                    onPress={onDelete}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnDeleteText}>✕  Избриши прогрес</Text>
                  </TouchableOpacity>
                )}

                {/* Cancel */}
                <TouchableOpacity
                  style={[styles.btn, styles.btnCancel]}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnCancelText}>Откажи</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  dayName: {
    fontSize: 13,
    color: "#78716c",
    marginBottom: 2,
  },
  dateStr: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1c1917",
    marginBottom: 16,
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 16,
  },
  statusCompleted: {
    backgroundColor: "#dcfce7",
  },
  statusCommitted: {
    backgroundColor: "#fef3c7",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1c1917",
  },
  buttons: {
    width: "100%",
    gap: 10,
  },
  btn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnComplete: {
    backgroundColor: "#16a34a",
  },
  btnCommit: {
    backgroundColor: "#78350f",
  },
  btnDelete: {
    backgroundColor: "#fee2e2",
  },
  btnCancel: {
    backgroundColor: "#f5f5f4",
    marginTop: 4,
  },
  btnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  btnDeleteText: {
    color: "#dc2626",
    fontSize: 15,
    fontWeight: "600",
  },
  btnCancelText: {
    color: "#57534e",
    fontSize: 15,
    fontWeight: "500",
  },
});
