'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import OnboardingPage from '../components/app/OnboardingPage';
import LoginPage from '../components/app/LoginPage';
import SignupPage from '../components/app/SignupPage';
import HomePage from '../components/app/HomePage';
import SettingsPage from '../components/app/SettingsPage';
import ReportsPage from '../components/app/ReportsPage';
import { useToast } from '../hooks/use-toast';

type Page = 'onboarding' | 'login' | 'signup' | 'home' | 'settings' | 'reports';

export default function MainApp() {
  const {
    isOnboarded,
    incomes,
    setOnboarded,
    token,
    isAuthenticated,
    initialSync,
    syncPendingData,
    loadFromDatabase,
    setUser,
    setToken,
    setAuthenticated,
  } = useAppStore();

  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const { toast } = useToast();

  // Wait for zustand persist hydration to complete
  useEffect(() => {
    // Read directly from localStorage to ensure
    const checkHydration = () => {
      try {
        const stored = localStorage.getItem('income-calculator-storage');
        if (stored) {
          const parsed = JSON.parse(stored);
          const storedOnboarded = parsed.state?.isOnboarded;
          const storedIncomes = parsed.state?.incomes || [];
          const storedAuth = parsed.state?.isAuthenticated;
          const storedToken = parsed.state?.token;

          if (storedOnboarded || storedIncomes.length > 0 || (storedAuth && storedToken)) {
            setOnboarded(true);
            setCurrentPage('home');

            // Sync if logged in
            if (storedAuth && storedToken) {
              initialSync().catch(console.error);
            }
          } else {
            setCurrentPage('onboarding');
          }
        } else {
          setCurrentPage('onboarding');
        }
      } catch (error) {
        console.error('Hydration error:', error);
        setCurrentPage('onboarding');
      }
      setHydrated(true);
    };

    // Run after mount
    const timer = setTimeout(checkHydration, 100);
    return () => clearTimeout(timer);
  }, []);

  // Register service worker
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);
        })
        .catch((error) => {
          console.error('SW registration failed:', error);
        });
    }
  }, []);

  // Listen for online event - sync pending data when back online
  useEffect(() => {
    const handleOnline = async () => {
      console.log('Back online - syncing pending data...');

      if (isAuthenticated && token) {
        try {
          const syncResult = await syncPendingData();

          if (syncResult) {
            await loadFromDatabase();

            toast({
              title: 'همگام‌سازی انجام شد',
              description: 'داده‌های آفلاین شما با سرور همگام شد',
            });
          }
        } catch (error) {
          console.error('Online sync error:', error);
        }
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [isAuthenticated, token, syncPendingData, loadFromDatabase, toast]);

  // Loading
  if (!hydrated || currentPage === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-primary/5 to-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  // Render pages based on state
  const renderPage = () => {
    switch (currentPage) {
      case 'onboarding':
        return (
          <OnboardingPage
            onNavigate={(page) => setCurrentPage(page as Page)}
            onFinish={() => {
              setOnboarded(true);
              setCurrentPage('home');
            }}
          />
        );
      case 'login':
        return (
          <LoginPage
            onBack={() => setCurrentPage('onboarding')}
            onSignup={() => setCurrentPage('signup')}
          />
        );
      case 'signup':
        return (
          <SignupPage
            onBack={() => setCurrentPage('onboarding')}
            onLogin={() => setCurrentPage('login')}
          />
        );
      case 'home':
        return (
          <HomePage
            onNavigate={(page) => setCurrentPage(page as Page)}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            onNavigate={(page) => setCurrentPage(page as Page)}
            onSignup={() => setCurrentPage('signup')}
          />
        );
      case 'reports':
        return (
          <ReportsPage
            onNavigate={(page) => setCurrentPage(page as Page)}
          />
        );
      default:
        return null;
    }
  };

  return renderPage();
}