import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { FASTING_COLORS, FASTING_LABELS, NotificationSettings } from "../types";
import type { FastingLevel } from "../types";

interface Props {
  settings: NotificationSettings;
  onChange: (s: NotificationSettings) => void;
}

const LEVELS: {
  level: FastingLevel;
  key: keyof NotificationSettings;
  daysKey: keyof NotificationSettings;
  label: string;
  desc: string;
}[] = [
  {
    level: 4,
    key: "notifyLevel4",
    daysKey: "level4Days",
    label: FASTING_LABELS[4],
    desc: "Строго воздржување – без масло, без алкохол, без месо, без млечни производи.",
  },
  {
    level: 3,
    key: "notifyLevel3",
    daysKey: "level3Days",
    label: FASTING_LABELS[3],
    desc: "Пост на масло – без месо и животински производи, масло и вино дозволени.",
  },
  {
    level: 2,
    key: "notifyLevel2",
    daysKey: "level2Days",
    label: FASTING_LABELS[2],
    desc: "Пост на риба – јаде се риба, без месо и животински производи.",
  },
  {
    level: 1,
    key: "notifyLevel1",
    daysKey: "level1Days",
    label: FASTING_LABELS[1],
    desc: "Само во Месопусната седмица – воздржување само од месо.",
  },
];

export function SettingsView({ settings, onChange }: Props) {
  const [showTimePicker, setShowTimePicker] = useState(false);

  const update = (patch: Partial<NotificationSettings>) =>
    onChange({ ...settings, ...patch });

  // Parse "HH:MM" into a Date object for DateTimePicker
  const [hours, minutes] = settings.notificationTime.split(":").map(Number);
  const timeDate = new Date();
  timeDate.setHours(hours, minutes, 0, 0);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.inner}>
        {/* Master toggle */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowTitle}>Известувања</Text>
              <Text style={styles.rowSub}>Известувања за почетокот на постот</Text>
            </View>
            <Toggle
              value={settings.enabled}
              onChange={(v) => update({ enabled: v })}
            />
          </View>

          {/* Time picker */}
          <View style={[styles.cardRow, styles.cardRowBorderTop]}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowTitle2}>Време на известување</Text>
              <Text style={styles.rowSub}>Кога да добиеш известување</Text>
            </View>
            <TouchableOpacity
              onPress={() => settings.enabled && setShowTimePicker(true)}
              style={[styles.timeBtn, !settings.enabled && styles.disabled]}
              activeOpacity={0.7}
            >
              <Text style={styles.timeBtnText}>{settings.notificationTime}</Text>
            </TouchableOpacity>
          </View>

          {showTimePicker && (
            <DateTimePicker
              value={timeDate}
              mode="time"
              is24Hour
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_event, selected) => {
                setShowTimePicker(Platform.OS === "ios");
                if (selected) {
                  const h = String(selected.getHours()).padStart(2, "0");
                  const m = String(selected.getMinutes()).padStart(2, "0");
                  update({ notificationTime: `${h}:${m}` });
                }
              }}
            />
          )}
        </View>

        {/* Per-level settings */}
        <Text style={styles.sectionHeader}>Поставки по ниво на пост</Text>

        {LEVELS.map(({ level, key, daysKey, label, desc }) => {
          const enabled = settings[key] as boolean;
          const days = settings[daysKey] as number;
          const color = FASTING_COLORS[level];

          return (
            <View key={level} style={styles.card}>
              {/* Level header */}
              <View style={styles.cardRow}>
                <View style={[styles.levelDot, { backgroundColor: color }]} />
                <View style={styles.rowLeftFlex}>
                  <Text style={styles.rowTitle}>{label}</Text>
                  <Text style={styles.rowSubSmall}>{desc}</Text>
                </View>
                <Toggle
                  value={enabled && settings.enabled}
                  onChange={(v) =>
                    update({ [key]: v } as Partial<NotificationSettings>)
                  }
                  disabled={!settings.enabled}
                />
              </View>

              {/* Days before */}
              <View style={[styles.cardRow, styles.cardRowBorderTop]}>
                <View style={styles.rowLeft}>
                  <Text style={styles.rowTitle2}>Денови пред почетокот</Text>
                  <Text style={styles.rowSub}>
                    Добиј известување {days} {days === 1 ? "ден" : "денови"} пред
                    постот
                  </Text>
                </View>
                <View style={styles.stepper}>
                  <TouchableOpacity
                    onPress={() =>
                      update({
                        [daysKey]: Math.max(0, days - 1),
                      } as Partial<NotificationSettings>)
                    }
                    disabled={!enabled || !settings.enabled || days <= 0}
                    style={[
                      styles.stepperBtn,
                      (!enabled || !settings.enabled || days <= 0) &&
                        styles.disabled,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.stepperBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepperValue}>{days}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      update({
                        [daysKey]: Math.min(14, days + 1),
                      } as Partial<NotificationSettings>)
                    }
                    disabled={!enabled || !settings.enabled || days >= 14}
                    style={[
                      styles.stepperBtn,
                      (!enabled || !settings.enabled || days >= 14) &&
                        styles.disabled,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.stepperBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        {/* Info section */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCross}>☦</Text>
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>За постењето</Text>
            <Text style={styles.infoBody}>
              Православниот пост е духовна и телесна дисциплина. Постењето не е
              само воздржување од храна, туку и засилена молитва, размислување и
              духовна работа. Консултирај се со твојот свештеник за повеќе
              информации.
            </Text>
          </View>
        </View>

        {/* About */}
        <View style={styles.aboutCard}>
          <Text style={styles.aboutCross}>☦</Text>
          <Text style={styles.aboutTitle}>Православен Календар</Text>
          <Text style={styles.aboutSub}>Македонска Православна Црква</Text>
          <Text style={styles.aboutVersion}>v1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}

interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

function Toggle({ value, onChange, disabled = false }: ToggleProps) {
  return (
    <TouchableOpacity
      onPress={() => !disabled && onChange(!value)}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.toggle,
        value ? styles.toggleOn : styles.toggleOff,
        disabled && styles.disabled,
      ]}
    >
      <View
        style={[
          styles.toggleThumb,
          value ? styles.toggleThumbOn : styles.toggleThumbOff,
        ]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafaf9",
  },
  inner: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    marginBottom: 4,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  cardRowBorderTop: {
    borderTopWidth: 1,
    borderTopColor: "#f5f5f4",
  },
  rowLeft: {
    flex: 1,
    marginRight: 12,
  },
  rowLeftFlex: {
    flex: 1,
    marginHorizontal: 10,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1c1917",
  },
  rowTitle2: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1c1917",
  },
  rowSub: {
    fontSize: 11,
    color: "#78716c",
    marginTop: 2,
  },
  rowSubSmall: {
    fontSize: 10,
    color: "#78716c",
    marginTop: 2,
    lineHeight: 14,
  },
  sectionHeader: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#78716c",
    paddingHorizontal: 4,
    marginTop: 4,
    marginBottom: 0,
  },
  levelDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    flexShrink: 0,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f5f4",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnText: {
    fontSize: 18,
    color: "#44403c",
    fontWeight: "bold",
    lineHeight: 22,
  },
  stepperValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1c1917",
    width: 24,
    textAlign: "center",
  },
  timeBtn: {
    borderWidth: 1,
    borderColor: "#d6d3d1",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  timeBtnText: {
    fontSize: 13,
    color: "#1c1917",
    fontWeight: "500",
  },
  infoCard: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  infoCross: {
    fontSize: 18,
    color: "#d97706",
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#78350f",
    marginBottom: 4,
  },
  infoBody: {
    fontSize: 11,
    color: "#92400e",
    lineHeight: 17,
  },
  aboutCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    marginTop: 4,
    marginBottom: 16,
  },
  aboutCross: {
    fontSize: 20,
    color: "#78350f",
    marginBottom: 4,
  },
  aboutTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#44403c",
    marginBottom: 2,
  },
  aboutSub: {
    fontSize: 12,
    color: "#78716c",
    marginBottom: 2,
  },
  aboutVersion: {
    fontSize: 11,
    color: "#a8a29e",
  },
  toggle: {
    width: 48,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    flexShrink: 0,
  },
  toggleOn: {
    backgroundColor: "#78350f",
  },
  toggleOff: {
    backgroundColor: "#d6d3d1",
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  toggleThumbOn: {
    marginLeft: 26,
  },
  toggleThumbOff: {
    marginLeft: 2,
  },
  disabled: {
    opacity: 0.4,
  },
});
