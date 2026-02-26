export type IncomeType = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'project' | 'custom';

export interface BaseIncome {
  id: string;
  type: IncomeType;
  amount: number;
  hours: number; // Calculated total hours
}

export interface HourlyIncome extends BaseIncome {
  type: 'hourly';
  // amount = hourly rate
  // hours = 1 (implied)
}

export interface DailyIncome extends BaseIncome {
  type: 'daily';
  // amount = daily income
  // hours = hours worked per day
}

export interface WeeklyIncome extends BaseIncome {
  type: 'weekly';
  // amount = weekly income
  daysPerWeek: number; // Number of working days per week
  hoursPerDay: number; // Working hours per day
  // hours = daysPerWeek * hoursPerDay (calculated)
}

export interface MonthlyIncome extends BaseIncome {
  type: 'monthly';
  // amount = monthly income
  daysPerMonth: number; // Number of working days per month
  hoursPerDay: number; // Working hours per day
  // hours = daysPerMonth * hoursPerDay (calculated)
}

export interface ProjectIncome extends BaseIncome {
  type: 'project';
  // amount = average monthly income from projects
  avgDays: number; // Average working days
  hoursPerDay: number; // Working hours per day
  // hours = avgDays * hoursPerDay (calculated)
}

export interface CustomIncome extends BaseIncome {
  type: 'custom';
  title: string; // Name of the custom unit (e.g., "کلیپ")
  // amount = income per unit
  // hours = average hours to complete one unit
  // Note: For time equivalent calculation, uses 8 hours per day default
}

export type Income = HourlyIncome | DailyIncome | WeeklyIncome | MonthlyIncome | ProjectIncome | CustomIncome;

export interface Saving {
  id: string;
  amount: number;
  hours: number;
  month: string; // Persian month format: "اسفند 1402"
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  createdAt: string;
}

// App State
export interface AppState {
  // Onboarding
  isOnboarded: boolean;
  incomes: Income[];
  savings: Saving[];
  user: User | null;
  isAuthenticated: boolean;

  // Actions
  setOnboarded: (value: boolean) => void;
  addIncome: (income: Income) => void;
  updateIncome: (id: string, income: Partial<Income>) => void;
  removeIncome: (id: string) => void;
  addSaving: (saving: Saving) => void;
  setUser: (user: User | null) => void;
  setAuthenticated: (value: boolean) => void;
  clearAll: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

// Form types
export interface IncomeFormData {
  type: IncomeType;
  amount: number;
  hours: number;
  daysPerWeek?: number;
  daysPerMonth?: number;
  avgDays?: number;
  hoursPerDay?: number;
  title?: string; // For custom type
}

// Auth types
export interface SignupData {
  username: string;
  email?: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
