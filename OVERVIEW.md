# Православен Календар — React Native App

A mobile application displaying the Macedonian Orthodox Church calendar with fasting levels, saints, and prayer reminders.

**Platform:** iOS · Android · Web (Expo)  
**Language:** TypeScript  
**Version:** 1.0.0

---

## File Structure

```
pravoslaven-calendar_react-native/
├── App.tsx                      # Root component, tab navigation, state
├── index.ts                     # Expo entry point
├── app.json                     # Expo config (name, icons, plugins)
├── tsconfig.json                # TypeScript config (extends expo/tsconfig.base)
├── package.json
├── assets/                      # icon.png, splash-icon.png, adaptive-icon.png
└── src/
    ├── types.ts                 # Shared interfaces, enums, constants
    ├── components/
    │   ├── CalendarView.tsx     # Monthly calendar grid
    │   ├── YearView.tsx         # 12-month overview
    │   ├── DayDetail.tsx        # Day detail bottom sheet modal
    │   └── SettingsView.tsx     # Notification settings screen
    ├── data/
    │   ├── saints.ts            # Fixed saints database (~484 entries, Cyrillic)
    │   └── calendar2026.ts      # Auto-generated 2026 calendar (scraped)
    └── utils/
        ├── easter.ts            # Orthodox Easter algorithm + date math
        ├── fasting.ts           # Fasting level rules engine (0–4)
        ├── notifications.ts     # Local push notification scheduler
        └── useAsyncStorage.ts   # React hook for AsyncStorage persistence
```

---

## Architecture

**State management:** Local React state in `App.tsx`, persisted notification settings via AsyncStorage.

**Component pattern:** `App.tsx` acts as container (owns all state), passes props down. No external state library.

**Data flow:**
```
saints.ts + calendar2026.ts
        ↓
    fasting.ts  ←  easter.ts
        ↓
  CalendarView / YearView / DayDetail
        ↓
  notifications.ts  →  expo-notifications
```

**Bottom navigation:** Custom (no React Navigation) — `activeTab` state in `App.tsx` switches between 3 screens.

---

## Screens

### Month Tab — `CalendarView.tsx`
- Monthly grid (Mon–Sun layout)
- Navigate prev/next month; tap month/year header to jump to today
- Each day cell shows:
  - Day number (brown circle if today)
  - Feast star (★) top-left if `isFeast`
  - Fasting color dot top-right if level > 0
  - Colored bottom bar as fasting indicator
- Fasting level legend at bottom

### Year Tab — `YearView.tsx`
- Scrollable 12-month overview; year navigation arrows
- Mini month cards with compact grid
- Fasting color tints on each day cell
- Today highlighted with brown circle

### Settings Tab — `SettingsView.tsx`
- Master enable/disable toggle for all notifications
- Time picker for daily notification time (default 08:00)
- Per-fasting-level cards (levels 1–4):
  - Toggle enable/disable
  - Stepper (±) for days-before value (0–14)
- All settings auto-saved to AsyncStorage
- Info card about Orthodox fasting + app version footer

### Day Detail — `DayDetail.tsx` (modal)
- Bottom sheet, opens on any day tap from Month or Year view
- Shows: date string, day-of-week, "Денес" badge if today
- Orthodox cross (☦) banner, feast badge if applicable
- Saint name + description
- Fasting card (color-coded) + visual level scale bar (0–4)

---

## Key Libraries

| Library | Version | Role |
|---|---|---|
| React | 19.1.0 | UI framework |
| React Native | 0.81.5 | Cross-platform mobile runtime |
| Expo | ~54.0.33 | Build, tooling, deployment |
| AsyncStorage | 2.2.0 | Persistent key-value storage |
| DateTimePicker | 8.4.4 | Native time picker UI |
| expo-notifications | ~0.32.16 | Local push notification scheduling |
| react-native-safe-area-context | ~5.6.0 | Notch / safe area handling |
| expo-device | ~8.0.10 | Device capability detection |

---

## Business Logic

### Easter Calculation — `easter.ts`
- Computes Orthodox (Julian) Easter via modular arithmetic
- Adds +13 days to convert Julian → Gregorian (valid 1900–2099)
- Helpers: `addDays()`, `daysDiff()`, `daysFromEaster()`

### Fasting Levels — `fasting.ts`

| Level | Label | Color |
|---|---|---|
| 0 | Нема пост | Green `#4CAF50` |
| 1 | Без месо | Brown `#795548` |
| 2 | Пост на риба | Light Blue `#4FC3F7` |
| 3 | Пост на масло | Pink `#F48FB1` |
| 4 | Строг пост | Dark Gray `#616161` |

`computeFastingLevel(date, easter)` evaluates in priority order:
1. Scraped 2026 data (overrides everything if date is in 2026)
2. Fast-free periods (Bright Week, Trinity Week, Christmastide, Bela Sedmica)
3. Meatfare week
4. Great Lent + Holy Week
5. Apostles' Fast
6. Dormition Fast (Aug 1–14)
7. Nativity Fast (Nov 15 – Jan 6)
8. Special strict days (Sept 14, Aug 29, Jan 5)
9. Weekly fasts (Wed & Fri → Level 2)
10. Default: Level 0

### Notifications — `notifications.ts`
- Runs on every app launch
- Cancels all previously scheduled notifications
- Scans 14 days forward for fasting level increases (transitions)
- Schedules a notification N days before each detected transition
- Time and per-level preferences come from AsyncStorage settings
- All notification text is in Macedonian (Cyrillic)

---

## Data Sources

| Source | Format | Coverage |
|---|---|---|
| `saints.ts` (FIXED_SAINTS) | `"M-D"` → `{ name, description, isFeast }` | All years (fallback) |
| `calendar2026.ts` | `"M-D"` → `{ saint, fast, isFeast }` | 2026 only (scraped) |
| `fasting.ts` rules | Algorithmic | All years |

2026 scraped data takes priority over fixed saints at runtime.

To regenerate 2026 data:
```bash
node scripts/scrape-calendar.mjs 2026
node scripts/build-ts.mjs 2026
```

---

## Dev Commands

```bash
npm start          # Start Expo dev server
npm run android    # Build & run on Android
npm run ios        # Build & run on iOS
npm run web        # Build & run in browser
```

---

## Styling

- All styles via React Native `StyleSheet.create()` — no external CSS library
- Primary color: Brown `#78350f` (header, highlights, today indicator)
- Accent: Golden `#fde68a`
- Fully Macedonian / Cyrillic localization throughout
