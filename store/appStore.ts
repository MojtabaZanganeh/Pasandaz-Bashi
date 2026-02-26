import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Income, Saving, User } from '../types';
import {
  saveSavingToDatabase,
  loadAllDataFromDatabase,
  syncPendingDataToDatabase,
  addPendingSaving,
  isOnline,
} from '../lib/sync-service';

interface StoreState {
  isOnboarded: boolean;
  incomes: Income[];
  savings: Saving[];
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface StoreActions {
  setOnboarded: (value: boolean) => void;
  addIncome: (income: Income) => void;
  updateIncome: (id: string, income: Partial<Income>) => void;
  removeIncome: (id: string) => void;
  addSaving: (saving: Saving) => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  clearAll: () => void;
  setIncomes: (incomes: Income[]) => void;
  setSavings: (savings: Saving[]) => void;
  logout: () => void;
  loadFromDatabase: () => Promise<boolean>;
  initialSync: () => Promise<boolean>;
  syncPendingData: () => Promise<boolean>;
}

type Store = StoreState & StoreActions;

const initialState: StoreState = {
  isOnboarded: false,
  incomes: [],
  savings: [],
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
};

export const useAppStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialState,

      setOnboarded: (value) => set({ isOnboarded: value }),

      // incomes فقط در localStorage ذخیره می‌شوند
      addIncome: (income) => {
        set((state) => ({
          incomes: [...state.incomes, income],
        }));
      },

      updateIncome: (id, incomeUpdate) => {
        set((state) => ({
          incomes: state.incomes.map((inc) =>
            inc.id === id ? { ...inc, ...incomeUpdate } : inc
          ) as Income[],
        }));
      },

      removeIncome: (id) => {
        set((state) => ({
          incomes: state.incomes.filter((inc) => inc.id !== id),
        }));
      },

      // savings در localStorage و دیتابیس ذخیره می‌شوند
      addSaving: async (saving) => {
        // همیشه ابتدا در state لوکال ذخیره کن
        set((state) => ({
          savings: [...state.savings, saving],
        }));

        const { token, isAuthenticated } = get();
        
        // اگر لاگین است و اینترنت متصل است، در دیتابیس ذخیره کن
        if (isAuthenticated && token && isOnline()) {
          const result = await saveSavingToDatabase(
            { amount: saving.amount, hours: saving.hours, month: saving.month },
            token
          );
          if (!result.success) {
            // اگر ذخیره در دیتابیس ناموفق بود، به pending اضافه کن
            addPendingSaving(saving);
          }
        } else if (isAuthenticated && token) {
          // اگر لاگین است ولی آفلاین، به pending اضافه کن
          addPendingSaving(saving);
        }
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setToken: (token) => set({ token }),

      setAuthenticated: (value) => set({ isAuthenticated: value }),

      setLoading: (value) => set({ isLoading: value }),

      clearAll: () => set(initialState),

      setIncomes: (incomes) => set({ incomes }),

      setSavings: (savings) => set({ savings }),

      logout: () => set({ ...initialState, isOnboarded: true }),

      // بارگذاری داده‌ها از دیتابیس (فقط savings)
      loadFromDatabase: async () => {
        const { token, isAuthenticated } = get();
        
        if (!isAuthenticated || !token) {
          return false;
        }

        set({ isLoading: true });
        
        try {
          const result = await loadAllDataFromDatabase(token);
          
          if (result.success && result.data) {
            // فقط savings را از دیتابیس بگیر، incomes از localStorage
            set({
              savings: result.data.savings || [],
            });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Load from database error:', error);
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // همگام‌سازی داده‌های در انتظار
      syncPendingData: async () => {
        const { token, isAuthenticated } = get();
        
        if (!isAuthenticated || !token || !isOnline()) {
          return false;
        }

        try {
          const result = await syncPendingDataToDatabase(token);
          return result.success;
        } catch (error) {
          console.error('Sync pending data error:', error);
          return false;
        }
      },

      // همگام‌سازی اولیه بعد از لاگین یا رفرش صفحه
      initialSync: async () => {
        const { token, isAuthenticated } = get();
        
        if (!isAuthenticated || !token) {
          return false;
        }

        set({ isLoading: true });
        
        try {
          // اگر آنلاین است، داده‌های در انتظار را سینک کن
          if (isOnline()) {
            await syncPendingDataToDatabase(token);
            
            // سپس savings را از دیتابیس بارگذاری کن
            const result = await loadAllDataFromDatabase(token);
            
            if (result.success && result.data) {
              set({
                savings: result.data.savings || [],
              });
              return true;
            }
          }
          return false;
        } catch (error) {
          console.error('Initial sync error:', error);
          return false;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'income-calculator-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isOnboarded: state.isOnboarded,
        incomes: state.incomes,
        savings: state.savings,
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper hooks
export const useIncomes = () => useAppStore((state) => state.incomes);
export const useSavings = () => useAppStore((state) => state.savings);
export const useUser = () => useAppStore((state) => state.user);
export const useToken = () => useAppStore((state) => state.token);
export const useIsOnboarded = () => useAppStore((state) => state.isOnboarded);
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated);
export const useIsLoading = () => useAppStore((state) => state.isLoading);

// Calculate average hourly rate from all incomes
export const useAverageHourlyRate = () => {
  const incomes = useAppStore((state) => state.incomes);

  if (incomes.length === 0) return 0;

  let totalHourlyRate = 0;
  let count = 0;

  incomes.forEach((income) => {
    switch (income.type) {
      case 'hourly':
        totalHourlyRate += income.amount;
        count++;
        break;
      case 'daily':
        if (income.hours > 0) {
          totalHourlyRate += income.amount / income.hours;
          count++;
        }
        break;
      case 'weekly':
        // hours = daysPerWeek * hoursPerDay
        if (income.hours > 0) {
          totalHourlyRate += income.amount / income.hours;
          count++;
        }
        break;
      case 'monthly':
        // hours = daysPerMonth * hoursPerDay
        if (income.hours > 0) {
          totalHourlyRate += income.amount / income.hours;
          count++;
        }
        break;
      case 'project':
        // hours = avgDays * hoursPerDay
        if (income.hours > 0) {
          totalHourlyRate += income.amount / income.hours;
          count++;
        }
        break;
      case 'custom':
        if (income.hours > 0) {
          totalHourlyRate += income.amount / income.hours;
          count++;
        }
        break;
    }
  });

  return count > 0 ? totalHourlyRate / count : 0;
};

// Helper function to get working days per week for time equivalent calculation
export const useWorkingDaysPerWeek = () => {
  const incomes = useAppStore((state) => state.incomes);
  
  if (incomes.length === 0) return 6; // Default to 6 days

  // Get the first income that has working days info
  for (const income of incomes) {
    if (income.type === 'weekly' && (income as { daysPerWeek?: number }).daysPerWeek) {
      return (income as { daysPerWeek: number }).daysPerWeek;
    }
    if (income.type === 'monthly' && (income as { daysPerMonth?: number }).daysPerMonth) {
      // Convert monthly days to weekly (approximate)
      const daysPerMonth = (income as { daysPerMonth: number }).daysPerMonth;
      return Math.round(daysPerMonth / 4.33); // Average weeks per month
    }
    if (income.type === 'project' && (income as { avgDays?: number }).avgDays) {
      // Convert monthly average days to weekly
      const avgDays = (income as { avgDays: number }).avgDays;
      return Math.round(avgDays / 4.33);
    }
  }
  
  return 6; // Default to 6 days
};

// Helper function to get working hours per day
export const useWorkingHoursPerDay = () => {
  const incomes = useAppStore((state) => state.incomes);
  
  if (incomes.length === 0) return 8; // Default to 8 hours

  // Get the first income that has hours per day info
  for (const income of incomes) {
    if (income.type === 'daily' && income.hours > 0) {
      return income.hours;
    }
    if (income.type === 'weekly' && (income as { hoursPerDay?: number }).hoursPerDay) {
      return (income as { hoursPerDay: number }).hoursPerDay;
    }
    if (income.type === 'monthly' && (income as { hoursPerDay?: number }).hoursPerDay) {
      return (income as { hoursPerDay: number }).hoursPerDay;
    }
    if (income.type === 'project' && (income as { hoursPerDay?: number }).hoursPerDay) {
      return (income as { hoursPerDay: number }).hoursPerDay;
    }
  }
  
  return 8; // Default to 8 hours
};
