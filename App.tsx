import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { CalendarView } from "./src/components/CalendarView";
import { DayDetail } from "./src/components/DayDetail";
import { SettingsView } from "./src/components/SettingsView";
import { YearView } from "./src/components/YearView";
import { ProgressPopup } from "./src/components/ProgressPopup";
import { ProfileView } from "./src/components/ProfileView";
import {
  FASTING_COLORS,
  NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
  dateKey,
} from "./src/types";
import type { DayProgress } from "./src/types";
import { orthodoxEaster } from "./src/utils/easter";
import { computeFastingLevel, getFastingLabel } from "./src/utils/fasting";
import { getSaintInfo } from "./src/data/saints";
import { scheduleUpcomingNotifications } from "./src/utils/notifications";
import { useAsyncStorage } from "./src/utils/useAsyncStorage";

type Tab = "calendar" | "year" | "settings";

const TABS = [
  { tab: "calendar" as Tab, icon: "📅", label: "Ова Година" },
  { tab: "year" as Tab, icon: "🗓️", label: "Сите Години" },
  { tab: "settings" as Tab, icon: "🔔", label: "Поставки" },
] as const;

export default function App() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("calendar");
  const [notifSettings, setNotifSettings, settingsLoaded] =
    useAsyncStorage<NotificationSettings>(
      "notification-settings",
      DEFAULT_NOTIFICATION_SETTINGS
    );
  const [progress, setProgress, progressLoaded] =
    useAsyncStorage<Record<string, DayProgress>>("day-progress", {});

  // Long-press popup state
  const [longPressDate, setLongPressDate] = useState<Date | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const getEaster = useCallback((year: number) => orthodoxEaster(year), []);

  useEffect(() => {
    if (settingsLoaded && progressLoaded) {
      scheduleUpcomingNotifications(notifSettings, progress).catch(console.error);
    }
  }, [notifSettings, settingsLoaded, progress, progressLoaded]);

  const handleSetProgress = useCallback((date: Date, prog: DayProgress) => {
    setProgress((prev) => ({ ...prev, [dateKey(date)]: prog }));
  }, [setProgress]);

  const handleDeleteProgress = useCallback((date: Date) => {
    setProgress((prev) => {
      const next = { ...prev };
      delete next[dateKey(date)];
      return next;
    });
  }, [setProgress]);

  const handleDayPress = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedDate(null);
  }, []);

  const selectedDayData = selectedDate
    ? (() => {
        const easter = getEaster(selectedDate.getFullYear());
        const level = computeFastingLevel(selectedDate, easter);
        const saint = getSaintInfo(selectedDate, easter);
        return {
          date: selectedDate,
          saint: saint.name,
          description: saint.description,
          fastingLevel: level,
          fastingLabel: getFastingLabel(level),
          isFeast: saint.isFeast,
          isToday: selectedDate.toDateString() === today.toDateString(),
        };
      })()
    : null;

  return (
    <SafeAreaProvider>
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#78350f" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>☦</Text>
          <View>
            <Text style={styles.headerTitle}>Православен</Text>
            <Text style={styles.headerSubtitle}>Календар</Text>
          </View>
        </View>
        {/* Header right: fasting dots + profile */}
        <View style={styles.headerRight}>
          <View style={styles.legendDots}>
            {([0, 1, 2, 3, 4] as const).map((level) => (
              <View
                key={level}
                style={[
                  styles.legendDot,
                  { backgroundColor: FASTING_COLORS[level] },
                ]}
              />
            ))}
          </View>
          <TouchableOpacity
            onPress={() => setShowProfile(true)}
            style={styles.profileBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.profileBtnText}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main content */}
      <View style={styles.main}>
        {activeTab === "calendar" && (
          <CalendarView
            currentDate={currentDate}
            today={today}
            onDayPress={handleDayPress}
            onLongPress={setLongPressDate}
            onMonthChange={setCurrentDate}
            getEaster={getEaster}
            progress={progress}
          />
        )}
        {activeTab === "year" && (
          <YearView
            today={today}
            onDayPress={handleDayPress}
            onLongPress={setLongPressDate}
            getEaster={getEaster}
            progress={progress}
          />
        )}
        {activeTab === "settings" && (
          <SettingsView settings={notifSettings} onChange={setNotifSettings} />
        )}
      </View>

      {/* Bottom navigation */}
      <View style={styles.navBar}>
        {TABS.map(({ tab, icon, label }) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={styles.navItem}
            activeOpacity={0.7}
          >
            <Text style={styles.navIcon}>{icon}</Text>
            <Text
              style={[
                styles.navLabel,
                activeTab === tab ? styles.navLabelActive : styles.navLabelInactive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Day Detail Modal */}
      {selectedDayData && (
        <DayDetail
          data={selectedDayData}
          progress={progress[dateKey(selectedDayData.date)]}
          onSetProgress={(prog) => handleSetProgress(selectedDayData.date, prog)}
          onDeleteProgress={() => handleDeleteProgress(selectedDayData.date)}
          onClose={handleCloseDetail}
        />
      )}

      {/* Profile modal */}
      {showProfile && (
        <ProfileView
          progress={progress}
          onClose={() => setShowProfile(false)}
        />
      )}

      {/* Long press popup */}
      {longPressDate && (
        <ProgressPopup
          date={longPressDate}
          progress={progress[dateKey(longPressDate)]}
          onSetProgress={(prog) => {
            handleSetProgress(longPressDate, prog);
            setLongPressDate(null);
          }}
          onDelete={() => {
            handleDeleteProgress(longPressDate);
            setLongPressDate(null);
          }}
          onClose={() => setLongPressDate(null)}
        />
      )}
    </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafaf9",
  },
  header: {
    backgroundColor: "#78350f",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    fontSize: 24,
    color: "#fff",
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    lineHeight: 22,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#fde68a",
    lineHeight: 16,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  legendDots: {
    flexDirection: "row",
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    marginLeft: 4,
  },
  profileBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileBtnText: {
    fontSize: 16,
  },
  main: {
    flex: 1,
  },
  navBar: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e7e5e4",
    flexDirection: "row",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  navIcon: {
    fontSize: 20,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  navLabelActive: {
    color: "#78350f",
  },
  navLabelInactive: {
    color: "#a8a29e",
  },
});
