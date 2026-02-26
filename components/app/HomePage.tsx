'use client';

import { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useAppStore, useAverageHourlyRate, useWorkingDaysPerWeek, useWorkingHoursPerDay } from '../../store/appStore';
import { formatHoursToPersianWorking, formatCurrency, getCurrentPersianMonth, generateId } from '../../utils/time';
import AppLayout from './AppLayout';
import { Wallet, TrendingDown } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

type Page = 'home' | 'settings' | 'reports';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { addSaving } = useAppStore();
  const averageHourlyRate = useAverageHourlyRate();
  const workingDaysPerWeek = useWorkingDaysPerWeek();
  const workingHoursPerDay = useWorkingHoursPerDay();
  const [amount, setAmount] = useState('');
  const { toast } = useToast();

  const hoursNeeded = useMemo(() => {
    if (amount && averageHourlyRate > 0) {
      const numAmount = parseFloat(amount.replace(/,/g, ''));
      if (numAmount > 0) {
        return numAmount / averageHourlyRate;
      }
    }
    return null;
  }, [amount, averageHourlyRate]);

  const formatNumberInput = (value: string) => {
    const num = value.replace(/[^0-9]/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleSpend = () => {
    toast({
      title: 'هزینه شد',
      description: 'این مبلغ از بودجه شما کسر شد',
    });
    setAmount('');
  };

  const handleSave = async () => {
    const numAmount = parseFloat(amount.replace(/,/g, '')) || 0;

    if (numAmount <= 0 || !hoursNeeded) return;

    const saving = {
      id: generateId(),
      amount: numAmount,
      hours: hoursNeeded,
      month: getCurrentPersianMonth(),
      createdAt: new Date().toISOString(),
    };

    await addSaving(saving);

    toast({
      title: 'عالی! صرفه‌جویی کردید',
      description: `مبلغ ${formatCurrency(numAmount)} به صرفه‌جویی‌های شما اضافه شد`,
    });

    setAmount('');
  };

  // Format time based on working days
  const formattedTime = useMemo(() => {
    if (!hoursNeeded) return null;
    return formatHoursToPersianWorking(hoursNeeded, workingHoursPerDay, workingDaysPerWeek);
  }, [hoursNeeded, workingHoursPerDay, workingDaysPerWeek]);

  return (
    <AppLayout currentPage="home" onNavigate={onNavigate}>
      {/* Hero Section */}
      <div className="text-center py-6">
        <h1 className="text-2xl font-bold mb-2">چقدر باید کار کنم؟</h1>
        <p className="text-muted-foreground">
          مبلغ مورد نظر را وارد کنید و ببینید چقدر باید کار کنید
        </p>
      </div>

      {/* Input Card */}
      <Card className="mb-6 fade-in">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            مبلغ هزینه
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Input
              type="text"
              inputMode="numeric"
              placeholder="۰"
              value={amount}
              onChange={(e) => setAmount(formatNumberInput(e.target.value))}
              className="text-2xl text-center h-14 font-bold"
              dir="ltr"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              تومان
            </span>
          </div>

          {formattedTime && hoursNeeded && hoursNeeded > 0 && (
            <div className="mt-4 p-4 bg-primary/10 rounded-xl fade-in">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">باید کار کنید:</p>
                <p className="text-xl font-bold text-primary">
                  {formattedTime.string}
                </p>
                <p className="text-xs font-bold text-primary mt-3">
                  معادل {formattedTime.totalHours.toLocaleString()} ساعت
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {hoursNeeded !== null && hoursNeeded > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6 fade-in">
          <Button
            variant="outline"
            className="h-14 flex flex-col"
            onClick={handleSpend}
          >
            <Wallet className="w-5 h-5 mb-1" />
            هزینه کردم
          </Button>
          <Button
            className="h-14 flex flex-col bg-green-600 hover:bg-green-700"
            onClick={handleSave}
          >
            <TrendingDown className="w-5 h-5 mb-1" />
            منصرف شدم
          </Button>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">نرخ ساعتی شما</div>
          <div className="text-lg font-bold text-primary">
            {averageHourlyRate > 0 ? formatCurrency(averageHourlyRate) : 'تنظیم نشده'}
          </div>
          <div className="text-xs text-muted-foreground">در ساعت</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">ماه جاری</div>
          <div className="text-lg font-bold">
            {getCurrentPersianMonth()}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
