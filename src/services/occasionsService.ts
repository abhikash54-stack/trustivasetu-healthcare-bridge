import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, OccasionMatch, OccasionType } from '../types/auth';

const SHOWN_KEY_PREFIX = '@trustiva:occasion_shown:';

function todayMD(): string {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function yearsSince(isoDate: string): number {
  const d = new Date(isoDate);
  return new Date().getFullYear() - d.getFullYear();
}

function dateMD(isoDate: string): string {
  const d = new Date(isoDate);
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const OCCASION_MESSAGES: Record<OccasionType, (name: string, years?: number, custom?: string) => string> = {
  BIRTHDAY: (name) => `Wishing you a wonderful birthday, ${name.split(' ')[0]}! May this year bring you joy, health, and success. 🎂`,
  WORK_ANNIVERSARY: (name, years) =>
    years === 1
      ? `Congratulations on completing your first year with TrustivaSetu, ${name.split(' ')[0]}! 🌟`
      : `Congratulations on ${years} amazing years with TrustivaSetu, ${name.split(' ')[0]}! Your dedication is truly valued. 🌟`,
  MARRIAGE_ANNIVERSARY: (name, years) =>
    years && years > 0
      ? `Wishing you and your partner a very Happy ${years}th Anniversary, ${name.split(' ')[0]}! 💍`
      : `Wishing you and your partner a very Happy Anniversary, ${name.split(' ')[0]}! 💍`,
  JOINING_DATE: (name, years) => `Happy ${years}-year work anniversary, ${name.split(' ')[0]}! Thank you for your continued contribution. 🎊`,
  CUSTOM: (name, _years, custom) => `Happy ${custom ?? 'Special Day'}, ${name.split(' ')[0]}! 🎉`,
};

const OCCASION_EMOJIS: Record<OccasionType, string> = {
  BIRTHDAY: '🎂',
  WORK_ANNIVERSARY: '🌟',
  MARRIAGE_ANNIVERSARY: '💍',
  JOINING_DATE: '🎊',
  CUSTOM: '🎉',
};

const OCCASION_LABELS: Record<OccasionType, string> = {
  BIRTHDAY: 'Happy Birthday!',
  WORK_ANNIVERSARY: 'Work Anniversary',
  MARRIAGE_ANNIVERSARY: 'Marriage Anniversary',
  JOINING_DATE: 'Joining Anniversary',
  CUSTOM: 'Special Day',
};

export function detectTodaysOccasions(user: UserProfile): OccasionMatch[] {
  const today = todayMD();
  const matches: OccasionMatch[] = [];

  if (user.birthday && user.birthday === today) {
    matches.push({
      type: 'BIRTHDAY',
      label: OCCASION_LABELS.BIRTHDAY,
      emoji: OCCASION_EMOJIS.BIRTHDAY,
      message: OCCASION_MESSAGES.BIRTHDAY(user.name),
    });
  }

  if (user.joiningDate) {
    const joinMD = dateMD(user.joiningDate);
    if (joinMD === today) {
      const years = yearsSince(user.joiningDate);
      if (years > 0) {
        matches.push({
          type: 'WORK_ANNIVERSARY',
          label: OCCASION_LABELS.WORK_ANNIVERSARY,
          emoji: OCCASION_EMOJIS.WORK_ANNIVERSARY,
          message: OCCASION_MESSAGES.WORK_ANNIVERSARY(user.name, years),
          yearsCount: years,
        });
      }
    }
  }

  if (user.marriageAnniversary && user.marriageAnniversary === today) {
    matches.push({
      type: 'MARRIAGE_ANNIVERSARY',
      label: OCCASION_LABELS.MARRIAGE_ANNIVERSARY,
      emoji: OCCASION_EMOJIS.MARRIAGE_ANNIVERSARY,
      message: OCCASION_MESSAGES.MARRIAGE_ANNIVERSARY(user.name),
    });
  }

  if (user.customOccasions) {
    for (const occ of user.customOccasions) {
      if (occ.date === today) {
        matches.push({
          type: 'CUSTOM',
          label: occ.name,
          emoji: OCCASION_EMOJIS.CUSTOM,
          message: OCCASION_MESSAGES.CUSTOM(user.name, undefined, occ.name),
          customName: occ.name,
        });
      }
    }
  }

  return matches;
}

export function getUpcomingOccasions(user: UserProfile, days: number = 7): { occasion: OccasionMatch; daysAway: number }[] {
  const upcoming: { occasion: OccasionMatch; daysAway: number }[] = [];
  const now = new Date();

  function daysUntil(md: string): number {
    const [mm, dd] = md.split('-').map(Number);
    const thisYear = new Date(now.getFullYear(), mm - 1, dd);
    const nextYear = new Date(now.getFullYear() + 1, mm - 1, dd);
    const target = thisYear >= now ? thisYear : nextYear;
    return Math.ceil((target.getTime() - now.getTime()) / 86400000);
  }

  if (user.birthday) {
    const n = daysUntil(user.birthday);
    if (n > 0 && n <= days) {
      upcoming.push({
        occasion: {
          type: 'BIRTHDAY',
          label: OCCASION_LABELS.BIRTHDAY,
          emoji: OCCASION_EMOJIS.BIRTHDAY,
          message: OCCASION_MESSAGES.BIRTHDAY(user.name),
        },
        daysAway: n,
      });
    }
  }

  if (user.joiningDate) {
    const n = daysUntil(dateMD(user.joiningDate));
    if (n > 0 && n <= days) {
      const years = yearsSince(user.joiningDate) + (n <= 1 ? 0 : 0);
      upcoming.push({
        occasion: {
          type: 'WORK_ANNIVERSARY',
          label: OCCASION_LABELS.WORK_ANNIVERSARY,
          emoji: OCCASION_EMOJIS.WORK_ANNIVERSARY,
          message: OCCASION_MESSAGES.WORK_ANNIVERSARY(user.name, years),
          yearsCount: years,
        },
        daysAway: n,
      });
    }
  }

  if (user.marriageAnniversary) {
    const n = daysUntil(user.marriageAnniversary);
    if (n > 0 && n <= days) {
      upcoming.push({
        occasion: {
          type: 'MARRIAGE_ANNIVERSARY',
          label: OCCASION_LABELS.MARRIAGE_ANNIVERSARY,
          emoji: OCCASION_EMOJIS.MARRIAGE_ANNIVERSARY,
          message: OCCASION_MESSAGES.MARRIAGE_ANNIVERSARY(user.name),
        },
        daysAway: n,
      });
    }
  }

  if (user.customOccasions) {
    for (const occ of user.customOccasions) {
      const n = daysUntil(occ.date);
      if (n > 0 && n <= days) {
        upcoming.push({
          occasion: {
            type: 'CUSTOM',
            label: occ.name,
            emoji: OCCASION_EMOJIS.CUSTOM,
            message: OCCASION_MESSAGES.CUSTOM(user.name, undefined, occ.name),
            customName: occ.name,
          },
          daysAway: n,
        });
      }
    }
  }

  return upcoming.sort((a, b) => a.daysAway - b.daysAway);
}

export async function hasCelebrationBeenShownToday(userId: string): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(`${SHOWN_KEY_PREFIX}${userId}`);
    return val === todayISO();
  } catch {
    return false;
  }
}

export async function markCelebrationShownToday(userId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(`${SHOWN_KEY_PREFIX}${userId}`, todayISO());
  } catch {
    // silent
  }
}
