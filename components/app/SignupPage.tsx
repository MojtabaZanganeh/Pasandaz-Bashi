'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/store/appStore';
import { ArrowLeft, User, Lock, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SignupPageProps {
  onBack: () => void;
  onLogin: () => void;
  onSuccess: () => void;
}

export default function SignupPage({ onBack, onLogin, onSuccess }: SignupPageProps) {
  const { setUser, setToken, setAuthenticated, initialSync } = useAppStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSignup = async () => {
    if (!username || !password) {
      toast({
        title: 'خطا',
        description: 'نام کاربری و رمز عبور الزامی است',
        variant: 'destructive',
      });
      return;
    }

    if (username.length < 3) {
      toast({
        title: 'خطا',
        description: 'نام کاربری باید حداقل ۳ کاراکتر باشد',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'خطا',
        description: 'رمز عبور باید حداقل ۶ کاراکتر باشد',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'خطا',
        description: 'رمز عبور و تکرار آن مطابقت ندارند',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // User register
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!data.success) {
        toast({
          title: 'خطا',
          description: data.error || 'ثبت‌نام ناموفق بود',
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
        title: 'ثبت‌نام موفق',
        description: 'حساب کاربری شما ایجاد شد',
      });

      // Navigate to home page
      onSuccess();
    } catch (error) {
      console.error('Signup error:', error);
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
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">ثبت‌نام</CardTitle>
            <CardDescription>
              یک حساب کاربری جدید بسازید
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">نام کاربری *</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="حداقل ۳ کاراکتر"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pr-10"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور *</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="حداقل ۶ کاراکتر"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تکرار رمز عبور *</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="تکرار رمز عبور"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                  dir="ltr"
                />
              </div>
            </div>

            <Button
              className="w-full h-11"
              onClick={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4 ml-2" />
                  ثبت‌نام
                </>
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              قبلاً ثبت‌نام کرده‌اید؟{' '}
              <Button variant="link" className="p-0 h-auto" onClick={onLogin}>
                وارد شوید
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
