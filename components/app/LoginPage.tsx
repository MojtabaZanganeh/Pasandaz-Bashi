'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useAppStore } from '../../store/appStore';
import { ArrowLeft, User, Lock, LogIn } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface LoginPageProps {
  onBack: () => void;
  onSignup: () => void;
}

export default function LoginPage({ onBack, onSignup }: LoginPageProps) {
  const { setUser, setToken, setAuthenticated, initialSync } = useAppStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!username || !password) {
      toast({
        title: 'خطا',
        description: 'لطفاً نام کاربری و رمز عبور را وارد کنید',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Login request
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!data.success) {
        toast({
          title: 'خطا',
          description: data.error || 'ورود ناموفق بود',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Save token and user info
      setUser(data.data.user);
      setToken(data.data.token);
      setAuthenticated(true);

      // Initial sync - Load data from database
      await initialSync();

      toast({
        title: 'خوش آمدید',
        description: `سلام ${data.data.user.username}!`,
      });

      onBack();
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'خطا',
        description: 'خطا در ارتباط با سرور',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-primary/5 to-background flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 ml-2" />
          بازگشت
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-md mx-auto w-full flex items-center">
        <Card className="w-full fade-in">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">ورود به حساب</CardTitle>
            <CardDescription>
              نام کاربری و رمز عبور خود را وارد کنید
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">نام کاربری</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="نام کاربری خود را وارد کنید"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pr-10"
                  dir="ltr"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="رمز عبور خود را وارد کنید"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  dir="ltr"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>

            <Button
              className="w-full h-11"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4 ml-2" />
                  ورود
                </>
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              حساب کاربری ندارید؟{' '}
              <Button variant="link" className="p-0 h-auto" onClick={onSignup}>
                ثبت‌نام کنید
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}