import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import type { FastingLevel, NotificationSettings, DayProgress } from "../types";
import { FASTING_LABELS, dateKey } from "../types";
import { computeFastingLevel } from "./fasting";
import { orthodoxEaster, addDays } from "./easter";
import { getSaintInfo } from "../data/saints";

// Show notifications even when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) return false;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("fasting", {
      name: "Пост известувања",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// Returns fasting level increases within the look-ahead window
function findUpcomingFastStarts(
  fromDate: Date,
  lookAheadDays: number
): Array<{ startDate: Date; level: FastingLevel }> {
  const starts: Array<{ startDate: Date; level: FastingLevel }> = [];
  let prevLevel = computeFastingLevel(
    addDays(fromDate, -1),
    orthodoxEaster(fromDate.getFullYear())
  );

  for (let i = 0; i <= lookAheadDays; i++) {
    const d = addDays(fromDate, i);
    const easter = orthodoxEaster(d.getFullYear());
    const level = computeFastingLevel(d, easter);
    if (level > prevLevel && level > 0) {
      starts.push({ startDate: d, level: level as FastingLevel });
    }
    prevLevel = level;
  }
  return starts;
}

export async function scheduleUpcomingNotifications(
  settings: NotificationSettings,
  progress: Record<string, DayProgress> = {}
): Promise<void> {
  if (!settings.enabled) {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return;
  }

  const granted = await ensureNotificationPermission();
  if (!granted) return;

  // Cancel previously scheduled notifications before rescheduling
  await Notifications.cancelAllScheduledNotificationsAsync();

  const today = new Date();

  // Look ahead far enough to catch any fast start that needs a notification
  const maxDaysBefore = Math.max(
    settings.level4Days,
    settings.level3Days,
    settings.level2Days,
    settings.level1Days
  );
  const lookAhead = maxDaysBefore + 30; // extra buffer for weekly fasts
  const starts = findUpcomingFastStarts(today, lookAhead);

  const [hours, minutes] = settings.notificationTime.split(":").map(Number);

  for (const { startDate, level } of starts) {
    const notifyEnabled = (() => {
      switch (level) {
        case 4: return settings.notifyLevel4;
        case 3: return settings.notifyLevel3;
        case 2: return settings.notifyLevel2;
        case 1: return settings.notifyLevel1;
        default: return false;
      }
    })();

    if (!notifyEnabled) continue;

    // If "only planned" is on, skip fasts the user hasn't committed to
    if (settings.onlyPlanned) {
      const key = dateKey(startDate);
      if (progress[key] !== "committed" && progress[key] !== "completed") continue;
    }

    const daysBeforeNotify = (() => {
      switch (level) {
        case 4: return settings.level4Days;
        case 3: return settings.level3Days;
        case 2: return settings.level2Days;
        case 1: return settings.level1Days;
        default: return 0;
      }
    })();

    const repeatDaily = (() => {
      switch (level) {
        case 4: return settings.repeatDailyLevel4;
        case 3: return settings.repeatDailyLevel3;
        case 2: return settings.repeatDailyLevel2;
        case 1: return settings.repeatDailyLevel1;
        default: return false;
      }
    })();

    // notifyDate = the first day we should send a notification (startDate - daysBeforeNotify)
    const notifyDate = addDays(startDate, -daysBeforeNotify);

    // Determine the range of days to schedule for
    // repeatDaily: schedule every day from notifyDate up to (but not including) startDate
    // once: schedule only on notifyDate
    const scheduleCount = repeatDaily ? daysBeforeNotify : 1;

    for (let offset = 0; offset < scheduleCount; offset++) {
      const triggerDay = addDays(notifyDate, offset);
      const trigger = new Date(triggerDay);
      trigger.setHours(hours, minutes, 0, 0);

      // Skip if this trigger time is already in the past
      if (trigger <= new Date()) continue;

      const daysUntilStart = Math.round(
        (startDate.getTime() - triggerDay.getTime()) / 86400000
      );

      const label = FASTING_LABELS[level];
      const dateStr = startDate.toLocaleDateString("mk-MK", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });

      const title =
        daysUntilStart === 0
          ? `☦ Денес е ${label}`
          : daysUntilStart === 1
          ? `☦ Утре почнува ${label}`
          : `☦ За ${daysUntilStart} ${daysUntilStart === 1 ? "ден" : "денови"}: ${label}`;

      const body =
        daysUntilStart === 0
          ? getBodyForLevel(level)
          : `${label} почнува ${dateStr}. ${getBodyForLevel(level)}`;

      await Notifications.scheduleNotificationAsync({
        content: { title, body, sound: true },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: trigger,
        },
      });
    }
  }

  // Day-of reminders for every committed future day (any fasting level)
  await scheduleCommittedDayNotifications(progress, hours, minutes);
}

// Fires ON each committed future day at the notification time.
// Covers all fasting levels, including level 0 (saint-only days).
// The fast-start loop above handles "X days before a period starts" warnings separately.
async function scheduleCommittedDayNotifications(
  progress: Record<string, DayProgress>,
  hours: number,
  minutes: number
): Promise<void> {
  const now = new Date();
  const todayNorm = new Date(now);
  todayNorm.setHours(0, 0, 0, 0);

  for (const [key, prog] of Object.entries(progress)) {
    if (prog !== "committed") continue;

    const date = new Date(key);
    if (isNaN(date.getTime())) continue;

    const dateNorm = new Date(date);
    dateNorm.setHours(0, 0, 0, 0);

    // Include today — lets user test immediately by committing to today
    if (dateNorm < todayNorm) continue;

    const easter = orthodoxEaster(date.getFullYear());
    const level = computeFastingLevel(date, easter);
    const saint = getSaintInfo(date, easter);

    const trigger = new Date(dateNorm);
    trigger.setHours(hours, minutes, 0, 0);

    // Skip if the trigger moment is already in the past
    if (trigger <= now) continue;

    const dateStr = date.toLocaleDateString("mk-MK", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    let title: string;
    let body: string;

    if (level > 0) {
      const label = FASTING_LABELS[level];
      title = `☦ Денес постиш: ${label}`;
      body = `${dateStr}. ${getBodyForLevel(level)}`;
    } else {
      title = `☦ ${saint.name}`;
      body = `${dateStr}. ${saint.description || "Прославување на светецот."}`;
    }

    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: trigger,
      },
    });
  }
}

function getBodyForLevel(level: FastingLevel): string {
  switch (level) {
    case 4: return "Строго воздржување – без масло, без алкохол, без месо и млечни производи.";
    case 3: return "Пост на масло – без месо и животински производи. Масло и вино дозволени.";
    case 2: return "Пост на риба – без месо, но риба е дозволена.";
    case 1: return "Без месо – воздржување само од месо (Месопусна седмица).";
    default: return "";
  }
}
