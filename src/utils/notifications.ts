import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import type { FastingLevel, NotificationSettings } from "../types";
import { FASTING_LABELS } from "../types";
import { computeFastingLevel } from "./fasting";
import { orthodoxEaster, addDays } from "./easter";

export async function ensureNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) return false;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("fasting", {
      name: "Пост известувања",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

function findUpcomingFastStarts(
  fromDate: Date,
  lookAheadDays = 14
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
      starts.push({ startDate: d, level });
    }
    prevLevel = level;
  }
  return starts;
}

export async function scheduleUpcomingNotifications(
  settings: NotificationSettings
): Promise<void> {
  if (!settings.enabled) return;

  const granted = await ensureNotificationPermission();
  if (!granted) return;

  // Cancel previously scheduled notifications before rescheduling
  await Notifications.cancelAllScheduledNotificationsAsync();

  const today = new Date();
  const starts = findUpcomingFastStarts(today, 14);

  for (const { startDate, level } of starts) {
    const daysUntil = Math.round(
      (startDate.getTime() - today.getTime()) / 86400000
    );

    const shouldNotify = (() => {
      switch (level) {
        case 4: return settings.notifyLevel4 && daysUntil <= settings.level4Days;
        case 3: return settings.notifyLevel3 && daysUntil <= settings.level3Days;
        case 2: return settings.notifyLevel2 && daysUntil <= settings.level2Days;
        case 1: return settings.notifyLevel1 && daysUntil <= settings.level1Days;
        default: return false;
      }
    })();

    if (!shouldNotify) continue;

    const label = FASTING_LABELS[level];
    const dateStr = startDate.toLocaleDateString("mk-MK", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    const title =
      daysUntil === 0
        ? `☦ Денес е ${label}`
        : daysUntil === 1
        ? `☦ Утре почнува ${label}`
        : `☦ За ${daysUntil} денови: ${label}`;

    const body =
      daysUntil === 0
        ? getBodyForLevel(level)
        : `${label} почнува ${dateStr}. ${getBodyForLevel(level)}`;

    // Parse notification time HH:MM
    const [hours, minutes] = settings.notificationTime.split(":").map(Number);

    // Schedule for today if daysUntil === 0 and time hasn't passed, else schedule for that future date
    const trigger = new Date(today);
    trigger.setDate(trigger.getDate() + daysUntil);
    trigger.setHours(hours, minutes, 0, 0);

    // Only schedule if in the future
    if (trigger > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: { title, body, sound: true },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: trigger },
      });
    }
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
