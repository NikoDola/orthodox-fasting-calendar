// 0 = no fast (Green)
// 1 = no meat / Без месо (Brown)
// 2 = fish fast / Пост на риба (Light blue)
// 3 = oil fast / Пост на масло (Pink)
// 4 = strict fast / Строг пост (Dark gray)
export type FastingLevel = 0 | 1 | 2 | 3 | 4;

export interface DayData {
  date: Date;
  saint: string;         // Saint name in Macedonian
  description: string;   // Short description of the day
  fastingLevel: FastingLevel;
  fastingLabel: string;  // Human-readable fasting description
  imageUrl?: string;
  isToday: boolean;
  isFeast: boolean;      // Major feast day
}

export interface NotificationSettings {
  enabled: boolean;
  level4Days: number;  // Days before Level 4 fast starts (default 4)
  level3Days: number;  // Days before Level 3 fast starts (default 3)
  level2Days: number;  // Days before Level 2 fast starts (default 2)
  level1Days: number;  // Days before Level 1 fast starts (default 1)
  notifyLevel4: boolean;
  notifyLevel3: boolean;
  notifyLevel2: boolean;
  notifyLevel1: boolean;
  notificationTime: string; // "HH:MM" format, default "08:00"
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  level4Days: 4,
  level3Days: 3,
  level2Days: 2,
  level1Days: 1,
  notifyLevel4: true,
  notifyLevel3: true,
  notifyLevel2: true,
  notifyLevel1: true,
  notificationTime: "08:00",
};

export const FASTING_COLORS: Record<FastingLevel, string> = {
  0: "#4CAF50",  // Green
  1: "#795548",  // Brown
  2: "#4FC3F7",  // Light blue
  3: "#F48FB1",  // Pink
  4: "#616161",  // Dark gray
};

export const FASTING_LABELS: Record<FastingLevel, string> = {
  0: "Нема пост",
  1: "Без месо",
  2: "Пост на риба",
  3: "Пост на масло",
  4: "Строг пост",
};

export const FASTING_DESCRIPTIONS: Record<FastingLevel, string> = {
  0: "Денот е без пост.",
  1: "Воздржување од јадење месо. Ова се случува само во месопусната седмица, пред почетокот на Великиот пост.",
  2: "Пост на масло, но се јаде и риба. Воздржување од месо и животински производи, освен риба.",
  3: "Воздржување од јадење месо и сите други видови храна од животинско потекло: млеко, млечни производи, јајца. Дозволува се употреба на растително масло во храната, како и умереното конзумирање на вино и друг вид алкохол.",
  4: "Строго воздржување од јадење не само на месо и храна од животинско потекло, туку и на употребата на масло во приготвувањето на храната. Не се конзумира алкохол.",
};

export const MONTH_NAMES_MK = [
  "Јануари", "Февруари", "Март", "Април", "Мај", "Јуни",
  "Јули", "Август", "Септември", "Октомври", "Ноември", "Декември",
];

export const DAY_NAMES_MK_SHORT = ["Нед", "Пон", "Вто", "Сре", "Чет", "Пет", "Саб"];
