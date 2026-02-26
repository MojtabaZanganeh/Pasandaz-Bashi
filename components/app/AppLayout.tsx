'use client';

import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAppStore, useIsLoading } from '../../store/appStore';
import {
  Settings,
  BarChart3,
  Calculator,
  User,
} from 'lucide-react';

type Page = 'home' | 'settings' | 'reports';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function AppLayout({ children, currentPage, onNavigate }: AppLayoutProps) {
  const { user, isAuthenticated } = useAppStore();
  const isLoading = useIsLoading();

  return (
    <div className="min-h-screen bg-linear-to-b from-primary/5 to-background">
      {/* Header */}
      <header className="px-4 py-2 flex justify-between items-center max-w-lg mx-auto border rounded-2xl bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between w-lg p-4 mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Calculator className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold">پس‌انداز باشی</span>
          </div>
          <div className="flex items-center gap-2">
            {isLoading && (
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            )}
            {isAuthenticated && (
              <Badge variant="secondary" className="text-xs p-2">
                <User className="w-3 h-3 ml-1" />
                {user?.username}
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-lg mx-auto pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border rounded-2xl p-2 flex justify-around max-w-lg mx-auto">
        <Button
          variant="ghost"
          className={`flex flex-col h-auto py-2 ${currentPage === 'home' ? 'text-primary' : ''}`}
          onClick={() => onNavigate('home')}
        >
          <Calculator className="w-5 h-5" />
          <span className="text-xs mt-1">محاسبه</span>
        </Button>
        <Button
          variant="ghost"
          className={`flex flex-col h-auto py-2 ${currentPage === 'reports' ? 'text-primary' : ''}`}
          onClick={() => onNavigate('reports')}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-xs mt-1">گزارش‌ها</span>
        </Button>
        <Button
          variant="ghost"
          className={`flex flex-col h-auto py-2 ${currentPage === 'settings' ? 'text-primary' : ''}`}
          onClick={() => onNavigate('settings')}
        >
          <Settings className="w-5 h-5" />
          <span className="text-xs mt-1">تنظیمات</span>
        </Button>
      </nav>
    </div>
  );
}