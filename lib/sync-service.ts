import type { Saving } from '../types';

const PENDING_SYNC_KEY = 'income-calculator-pending-sync';

interface PendingSyncData {
  savings: Saving[];
}

// Get pending sync data from localStorage
export function getPendingSyncData(): PendingSyncData | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(PENDING_SYNC_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

// Save pending sync data to localStorage
export function savePendingSyncData(data: PendingSyncData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving pending sync data:', error);
  }
}

// Clear pending sync data
export function clearPendingSyncData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PENDING_SYNC_KEY);
}

// Add expense to sync queue
export function addPendingSaving(saving: Saving): void {
  const pending = getPendingSyncData() || { savings: [] };
  pending.savings.push(saving);
  savePendingSyncData(pending);
}

// Save expense to database
export async function saveSavingToDatabase(
  saving: Omit<Saving, 'id' | 'createdAt'>,
  token: string
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const response = await fetch('/api/savings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ saving }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving saving:', error);
    return { success: false, error: 'خطا در ارتباط با سرور' };
  }
}

// Load all data from database
export async function loadAllDataFromDatabase(
  token: string
): Promise<{ success: boolean; data?: { savings: Saving[] }; error?: string }> {
  try {
    const response = await fetch('/api/sync', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading data:', error);
    return { success: false, error: 'خطا در ارتباط با سرور' };
  }
}

// Sync local data with database
export async function syncPendingDataToDatabase(token: string): Promise<{ success: boolean; error?: string }> {
  const pendingData = getPendingSyncData();
  
  if (!pendingData || pendingData.savings.length === 0) {
    return { success: true };
  }

  try {
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        savings: pendingData.savings,
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      clearPendingSyncData();
    }
    
    return data;
  } catch (error) {
    console.error('Error syncing pending data:', error);
    return { success: false, error: 'خطا در ارتباط با سرور' };
  }
}

// Check internet connection
export function isOnline(): boolean {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
}
