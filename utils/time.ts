// Persian month names
const PERSIAN_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

const PERSIAN_NUMBERS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

// Convert number to Persian digits
export function toPersianDigits(num: number | string): string {
  return String(num).replace(/\d/g, (d) => PERSIAN_NUMBERS[parseInt(d)]);
}

// Convert Persian digits to English
export function toEnglishDigits(str: string): string {
  const persianToEnglish: Record<string, string> = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
  };
  return str.replace(/[۰-۹]/g, (d) => persianToEnglish[d] || d);
}

// Format number with commas (Persian style)
export function formatNumber(num: number): string {
  return toPersianDigits(num.toLocaleString('en-US'));
}

// Format currency (Toman)
export function formatCurrency(amount: number): string {
  return `${formatNumber(Math.round(amount))} تومان`;
}

// Convert Gregorian date to Jalali (Persian) date
export function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = (gy <= 1600) ? 0 : 979;
  gy -= (gy <= 1600) ? 621 : 1600;
  const gy2 = (gm > 2) ? (gy + 1) : gy;
  let days = (365 * gy) + (Math.floor((gy2 + 3) / 4)) - (Math.floor((gy2 + 99) / 100))
    + (Math.floor((gy2 + 399) / 400)) - 80 + gd + g_d_m[gm - 1];
  jy += 33 * (Math.floor(days / 12053));
  days %= 12053;
  jy += 4 * (Math.floor(days / 1461));
  days %= 1461;
  jy += Math.floor((days - 1) / 365);
  if (days > 365) days = (days - 1) % 365;
  const jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
  return [jy, jm, jd];
}

// Get current Persian month string (e.g., "اسفند 1402")
export function getCurrentPersianMonth(): string {
  const now = new Date();
  const [jy, jm] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  return `${PERSIAN_MONTHS[jm - 1]} ${toPersianDigits(jy)}`;
}

// Time conversion utilities
export interface TimeBreakdown {
  centuries: number;
  years: number;
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Convert hours to all time units
export function hoursToAllUnits(totalHours: number): TimeBreakdown {
  const totalSeconds = totalHours * 3600;
  const totalMinutes = totalHours * 60;

  const centuries = Math.floor(totalHours / (24 * 365.25 * 100));
  const remainingAfterCenturies = totalHours - (centuries * 24 * 365.25 * 100);

  const years = Math.floor(remainingAfterCenturies / (24 * 365.25));
  const remainingAfterYears = remainingAfterCenturies - (years * 24 * 365.25);

  const months = Math.floor(remainingAfterYears / (24 * 30));
  const remainingAfterMonths = remainingAfterYears - (months * 24 * 30);

  const weeks = Math.floor(remainingAfterMonths / (24 * 7));
  const remainingAfterWeeks = remainingAfterMonths - (weeks * 24 * 7);

  const days = Math.floor(remainingAfterWeeks / 24);
  const hours = remainingAfterWeeks - (days * 24);

  const minutes = (totalHours % 1) * 60;
  const seconds = (minutes % 1) * 60;

  return {
    centuries: Math.round(centuries),
    years: Math.round(years),
    months: Math.round(months),
    weeks: Math.round(weeks),
    days: Math.round(days),
    hours: Math.round(hours),
    minutes: Math.round(minutes),
    seconds: Math.round(seconds),
  };
}

// Format hours to human readable Persian string
export function formatHoursToPersian(totalHours: number): string {
  if (totalHours <= 0) {
    return '۰ ثانیه';
  }

  const breakdown = hoursToAllUnits(totalHours);
  const parts: string[] = [];

  // Determine the best representation based on magnitude
  if (breakdown.centuries > 0) {
    parts.push(`${toPersianDigits(breakdown.centuries)} قرن`);
    if (breakdown.years > 0) {
      parts.push(`${toPersianDigits(breakdown.years)} سال`);
    }
  } else if (breakdown.years > 0) {
    parts.push(`${toPersianDigits(breakdown.years)} سال`);
    if (breakdown.months > 0) {
      parts.push(`${toPersianDigits(breakdown.months)} ماه`);
    }
  } else if (breakdown.months > 0) {
    parts.push(`${toPersianDigits(breakdown.months)} ماه`);
    if (breakdown.weeks > 0) {
      parts.push(`${toPersianDigits(breakdown.weeks)} هفته`);
    }
  } else if (breakdown.weeks > 0) {
    parts.push(`${toPersianDigits(breakdown.weeks)} هفته`);
    if (breakdown.days > 0) {
      parts.push(`${toPersianDigits(breakdown.days)} روز`);
    }
  } else if (breakdown.days > 0) {
    parts.push(`${toPersianDigits(breakdown.days)} روز`);
    if (breakdown.hours > 0) {
      parts.push(`${toPersianDigits(breakdown.hours)} ساعت`);
    }
  } else if (breakdown.hours > 0) {
    parts.push(`${toPersianDigits(breakdown.hours)} ساعت`);
    if (breakdown.minutes > 0) {
      parts.push(`${toPersianDigits(Math.round(breakdown.minutes))} دقیقه`);
    }
  } else if (breakdown.minutes > 0) {
    parts.push(`${toPersianDigits(Math.round(breakdown.minutes))} دقیقه`);
    if (breakdown.seconds > 0) {
      parts.push(`${toPersianDigits(Math.round(breakdown.seconds))} ثانیه`);
    }
  } else if (breakdown.seconds > 0) {
    parts.push(`${toPersianDigits(Math.round(breakdown.seconds))} ثانیه`);
  }

  // Add the total hours equivalent for context
  const totalHoursRounded = Math.round(totalHours);
  if (totalHoursRounded > 24 && parts.length > 0) {
    return `${parts.join(' و ')}`;
  }

  return parts.join(' و ') || 'کمتر از یک ثانیه';
}

// Format hours to Persian string based on working days
// This calculates time based on how many working days it represents
export function formatHoursToPersianWorking(totalHours: number, hoursPerDay: number = 8, daysPerWeek: number = 6): { string: string, totalHours: number } {
  if (totalHours <= 0) {
    return { string: '۰ ثانیه', totalHours: 0 };
  }

  const totalHoursRounded = Math.round(totalHours);
  const parts: string[] = [];

  // Calculate working days needed
  const workingDays = totalHours / hoursPerDay;
  const fullWorkingDays = Math.floor(workingDays);
  const remainingHours = totalHours - (fullWorkingDays * hoursPerDay);

  // Calculate weeks (based on working days per week)
  const workingWeeks = Math.floor(fullWorkingDays / daysPerWeek);
  const remainingDays = fullWorkingDays - (workingWeeks * daysPerWeek);

  // Calculate months (approximately 4.33 weeks per month)
  const workingMonths = Math.floor(workingWeeks / 4.33);
  const remainingWeeks = Math.round(workingWeeks - (workingMonths * 4.33));

  // Calculate years (12 months)
  const workingYears = Math.floor(workingMonths / 12);
  const remainingMonths = Math.round(workingMonths - (workingYears * 12));

  // Build the output string
  if (workingYears > 0) {
    parts.push(`${toPersianDigits(workingYears)} سال`);
    if (remainingMonths > 0) {
      parts.push(`${toPersianDigits(remainingMonths)} ماه`);
    }
  } else if (workingMonths > 0) {
    parts.push(`${toPersianDigits(workingMonths)} ماه`);
    if (remainingWeeks > 0) {
      parts.push(`${toPersianDigits(remainingWeeks)} هفته`);
    }
  } else if (workingWeeks > 0) {
    parts.push(`${toPersianDigits(workingWeeks)} هفته`);
    if (remainingDays > 0) {
      parts.push(`${toPersianDigits(remainingDays)} روز`);
    }
  } else if (fullWorkingDays > 0) {
    parts.push(`${toPersianDigits(fullWorkingDays)} روز`);
    if (remainingHours > 0) {
      parts.push(`${toPersianDigits(Math.round(remainingHours))} ساعت`);
    }
  } else if (remainingHours > 0) {
    parts.push(`${toPersianDigits(Math.round(remainingHours))} ساعت`);
  } else {
    parts.push('کمتر از ۱ ساعت');
  }

  // Add the total hours equivalent for context
  if (totalHoursRounded > 0 && parts.length > 0) {
    return {
      string: `${parts.join(' و ')} کاری`,
      totalHours: totalHoursRounded
    };
  }

  return { string: parts.join(' و ') || 'کمتر از یک ساعت', totalHours: 0 };
}

// Get detailed time breakdown for display
export function getDetailedTimeBreakdown(totalHours: number): string {
  const breakdown = hoursToAllUnits(totalHours);
  const parts: string[] = [];

  if (breakdown.centuries > 0) parts.push(`${toPersianDigits(breakdown.centuries)} قرن`);
  if (breakdown.years > 0) parts.push(`${toPersianDigits(breakdown.years)} سال`);
  if (breakdown.months > 0) parts.push(`${toPersianDigits(breakdown.months)} ماه`);
  if (breakdown.weeks > 0) parts.push(`${toPersianDigits(breakdown.weeks)} هفته`);
  if (breakdown.days > 0) parts.push(`${toPersianDigits(breakdown.days)} روز`);
  if (breakdown.hours > 0) parts.push(`${toPersianDigits(breakdown.hours)} ساعت`);
  if (breakdown.minutes > 0 && breakdown.days === 0 && breakdown.years === 0) {
    parts.push(`${toPersianDigits(Math.round(breakdown.minutes))} دقیقه`);
  }

  return parts.join('، ');
}

// Calculate hours needed to earn a specific amount
export function calculateHoursNeeded(amount: number, hourlyRate: number): number {
  if (hourlyRate <= 0) return 0;
  return amount / hourlyRate;
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Parse Persian number input to number
export function parsePersianNumber(input: string): number {
  const englishStr = toEnglishDigits(input.replace(/,/g, ''));
  return parseFloat(englishStr) || 0;
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function getMonthsForSelection(): { value: string; label: string }[] {
  const months: { value: string; label: string }[] = [];
  const now = new Date();

  const [currentJy, currentJm] = gregorianToJalali(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate()
  );

  for (let i = 0; i < 12; i++) {
    let targetJm = currentJm - i;
    let targetJy = currentJy;

    if (targetJm <= 0) {
      targetJm += 12;
      targetJy -= 1;
    }

    // Main fix: Convert month to two-digit format (e.g., 1 -> 01)
    const monthPadded = String(targetJm).padStart(2, '0');

    // The value now has ISO-like format: 1402-12
    const value = `${targetJy}-${monthPadded}`;

    // For the label, if you want to display the month as two digits, use monthPadded
    const label = `${PERSIAN_MONTHS[targetJm - 1]} ${toPersianDigits(targetJy)}`;

    months.push({ value, label });
  }

  return months;
}

export function formatMonthValueToPersian(monthValue: string): string {
  if (!monthValue) return '';

  // Parsing the value into year and month (e.g., "1402-12")
  const [yearStr, monthStr] = monthValue.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  // Convert to persian format
  const monthName = PERSIAN_MONTHS[month - 1];
  const persianYear = toPersianDigits(year);

  return `${monthName} ${persianYear}`;
}