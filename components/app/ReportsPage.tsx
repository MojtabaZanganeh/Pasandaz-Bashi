'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore, useWorkingDaysPerWeek, useWorkingHoursPerDay } from '@/store/appStore';
import AppLayout from '@/components/app/AppLayout';
import {
  formatHoursToPersianWorking,
  formatCurrency,
  getMonthsForSelection,
  toPersianDigits,
  formatMonthValueToPersian,
} from '@/utils/time';
import {
  TrendingUp,
  PiggyBank,
  Calendar,
  BarChart3,
  Clock,
} from 'lucide-react';
import { Label } from '../ui/label';

type Page = 'home' | 'settings' | 'reports';

interface ReportsPageProps {
  onNavigate: (page: Page) => void;
}

export default function ReportsPage({ onNavigate }: ReportsPageProps) {
  const { savings } = useAppStore();
  const workingDaysPerWeek = useWorkingDaysPerWeek();
  const workingHoursPerDay = useWorkingHoursPerDay();
  const months = getMonthsForSelection();
  const [selectedMonth, setSelectedMonth] = useState(months[12]?.value || months[0]?.value);

  // Calculate monthly summary
  const monthlySummary = useMemo(() => {
    const summary: Record<string, { totalAmount: number; totalHours: number; count: number }> = {};

    savings.forEach((saving) => {
      if (!summary[saving.month]) {
        summary[saving.month] = { totalAmount: 0, totalHours: 0, count: 0 };
      }
      summary[saving.month].totalAmount += saving.amount;
      summary[saving.month].totalHours += saving.hours;
      summary[saving.month].count++;
    });

    return summary;
  }, [savings]);

  // Get current month data
  const currentMonthData = monthlySummary[selectedMonth] || {
    totalAmount: 0,
    totalHours: 0,
    count: 0,
  };

  // Get all time stats
  const allTimeStats = useMemo(() => {
    let totalAmount = 0;
    let totalHours = 0;
    let totalCount = 0;

    Object.values(monthlySummary).forEach((month) => {
      totalAmount += month.totalAmount;
      totalHours += month.totalHours;
      totalCount += month.count;
    });

    return { totalAmount, totalHours, totalCount };
  }, [monthlySummary]);

  // Format time based on working days
  const formatWorkingTime = (hours: number) => {
    return formatHoursToPersianWorking(hours, workingHoursPerDay, workingDaysPerWeek);
  };

  return (
    <AppLayout currentPage="reports" onNavigate={onNavigate}>
      {/* Working Time Info */}
      {/* Filter Section - Combined */}
      <Card className="mb-6 border-border/50">
        <CardContent className="px-4">
          <div className="flex flex-row items-center gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium text-sm">فیلتر گزارش:</span>
            </div>

            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="h-9 bg-muted/30 border-border/50">
                <SelectValue placeholder="انتخاب ماه" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* Monthly Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <PiggyBank className="w-5 h-5 text-green-500" />
              صرفه‌جویی ماه
            </div>
            <Badge variant='secondary' className="text-gray-500">
              <strong>{toPersianDigits(workingDaysPerWeek)} روز کاری در هفته</strong> و{' '}
              <strong>{toPersianDigits(workingHoursPerDay)} ساعت در روز</strong>
            </Badge>
          </CardTitle>
          <CardDescription>{formatMonthValueToPersian(selectedMonth)}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-xl">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(currentMonthData.totalAmount)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">مجموع صرفه‌جویی</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
              <div className="text-lg font-bold text-blue-600 leading-relaxed">
                {formatWorkingTime(currentMonthData.totalHours).string}
              </div>
              <div className="text-sm text-muted-foreground mt-1">معادل زمانی</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Badge variant="secondary" className="text-sm">
              {toPersianDigits(currentMonthData.count)} مورد صرفه‌جویی
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* All Time Stats */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              آمار کلی
            </div>
            <Badge variant='secondary' className="text-gray-500">
              <strong>{toPersianDigits(workingDaysPerWeek)} روز کاری در هفته</strong> و{' '}
              <strong>{toPersianDigits(workingHoursPerDay)} ساعت در روز</strong>
            </Badge>
          </CardTitle>
          <CardDescription>از ابتدا تاکنون</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
              <span className="text-muted-foreground">کل صرفه‌جویی</span>
              <span className="font-bold text-green-600">
                {formatCurrency(allTimeStats.totalAmount)}
              </span>
            </div>
            <div className="flex flex-row justify-between items-center gap-1 p-3 bg-secondary rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">کل زمان صرفه‌جویی شده</span>
              </div>
              <div className="text-left">
                <span className="font-bold text-blue-600 text-sm">
                  {formatWorkingTime(allTimeStats.totalHours).string}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
              <span className="text-muted-foreground">تعداد کل</span>
              <span className="font-bold">
                {toPersianDigits(allTimeStats.totalCount)} مورد
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Breakdown */}
      {Object.keys(monthlySummary).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              تفکیک ماهانه
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(monthlySummary)
                .slice(0, 6)
                .map(([month, data]) => (
                  <div
                    key={month}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{formatMonthValueToPersian(month)}</span>
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-green-600">
                        {formatCurrency(data.totalAmount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {toPersianDigits(data.count)} مورد
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {savings.length === 0 && (
        <div className="text-center py-12">
          <PiggyBank className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-bold text-lg mb-2">هنوز صرفه‌جویی ندارید</h3>
          <p className="text-muted-foreground">
            با کلیک روی «منصرف شدم» در صفحه اصلی، صرفه‌جویی‌هایتان را ثبت کنید
          </p>
        </div>
      )}
    </AppLayout>
  );
}
