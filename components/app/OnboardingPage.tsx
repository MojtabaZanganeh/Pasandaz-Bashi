'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { useAppStore } from '../../store/appStore';
import type { Income, IncomeType, WeeklyIncome, MonthlyIncome, ProjectIncome } from '../../types';
import { generateId } from '../../utils/time';
import {
  Clock,
  Calendar,
  CalendarDays,
  CalendarRange,
  Briefcase,
  Package,
  Plus,
  ArrowLeft,
  Check,
  User,
  ShieldCheck,
  Info,
} from 'lucide-react';

type Page = 'onboarding' | 'login';

interface OnboardingPageProps {
  onNavigate: (page: Page) => void;
  onFinish: () => void;
}

const INCOME_TYPES: { type: IncomeType; label: string; icon: React.ReactNode; description: string }[] = [
  { type: 'hourly', label: 'ساعتی', icon: <Clock className="w-5 h-5" />, description: 'درآمد به ازای هر ساعت کار' },
  { type: 'daily', label: 'روزانه', icon: <Calendar className="w-5 h-5" />, description: 'درآمد ثابت روزانه' },
  { type: 'weekly', label: 'هفتگی', icon: <CalendarDays className="w-5 h-5" />, description: 'درآمد ثابت هفتگی' },
  { type: 'monthly', label: 'ماهانه', icon: <CalendarRange className="w-5 h-5" />, description: 'درآمد ثابت ماهانه' },
  { type: 'project', label: 'پروژه‌ای', icon: <Briefcase className="w-5 h-5" />, description: 'میانگین درآمد پروژه‌ها' },
  { type: 'custom', label: 'سفارشی', icon: <Package className="w-5 h-5" />, description: 'تعریف واحد درآمد اختصاصی' },
];

export default function OnboardingPage({ onNavigate, onFinish }: OnboardingPageProps) {
  const { addIncome, setOnboarded, incomes, isAuthenticated, user } = useAppStore();
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [selectedType, setSelectedType] = useState<IncomeType | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    amount: '',
    hours: '',
    customTitle: '',
    daysPerWeek: '',
    daysPerMonth: '',
    avgDays: '',
    hoursPerDay: '',
  });

  const handleTypeSelect = (type: IncomeType) => {
    setSelectedType(type);
    setStep('form');
    setFormData({
      amount: '',
      hours: '',
      customTitle: '',
      daysPerWeek: '',
      daysPerMonth: '',
      avgDays: '',
      hoursPerDay: '',
    });
  };

  const handleAddIncome = async () => {
    if (!selectedType) return;

    const amount = parseFloat(formData.amount.replace(/,/g, '')) || 0;
    const hours = parseFloat(formData.hours.replace(/,/g, '')) || 0;
    const daysPerWeek = parseFloat(formData.daysPerWeek.replace(/,/g, '')) || 0;
    const daysPerMonth = parseFloat(formData.daysPerMonth.replace(/,/g, '')) || 0;
    const avgDays = parseFloat(formData.avgDays.replace(/,/g, '')) || 0;
    const hoursPerDay = parseFloat(formData.hoursPerDay.replace(/,/g, '')) || 0;

    if (amount <= 0) return;

    let newIncome: Income;

    switch (selectedType) {
      case 'hourly':
        newIncome = {
          id: generateId(),
          type: 'hourly',
          amount,
          hours: 1,
        };
        break;
      case 'daily':
        newIncome = {
          id: generateId(),
          type: 'daily',
          amount,
          hours: hours > 0 ? hours : 8,
        };
        break;
      case 'weekly':
        const weeklyHours = (daysPerWeek > 0 ? daysPerWeek : 6) * (hoursPerDay > 0 ? hoursPerDay : 8);
        newIncome = {
          id: generateId(),
          type: 'weekly',
          amount,
          hours: weeklyHours,
          daysPerWeek: daysPerWeek > 0 ? daysPerWeek : 6,
          hoursPerDay: hoursPerDay > 0 ? hoursPerDay : 8,
        } as WeeklyIncome;
        break;
      case 'monthly':
        const monthlyHours = (daysPerMonth > 0 ? daysPerMonth : 26) * (hoursPerDay > 0 ? hoursPerDay : 8);
        newIncome = {
          id: generateId(),
          type: 'monthly',
          amount,
          hours: monthlyHours,
          daysPerMonth: daysPerMonth > 0 ? daysPerMonth : 26,
          hoursPerDay: hoursPerDay > 0 ? hoursPerDay : 8,
        } as MonthlyIncome;
        break;
      case 'project':
        const projectHours = (avgDays > 0 ? avgDays : 26) * (hoursPerDay > 0 ? hoursPerDay : 8);
        newIncome = {
          id: generateId(),
          type: 'project',
          amount,
          hours: projectHours,
          avgDays: avgDays > 0 ? avgDays : 26,
          hoursPerDay: hoursPerDay > 0 ? hoursPerDay : 8,
        } as ProjectIncome;
        break;
      case 'custom':
        newIncome = {
          id: generateId(),
          type: 'custom',
          amount,
          hours: hours > 0 ? hours : 1,
          title: formData.customTitle || 'واحد سفارشی',
        };
        break;
      default:
        return;
    }

    addIncome(newIncome);
    setStep('select');
    setSelectedType(null);
    setFormData({
      amount: '',
      hours: '',
      customTitle: '',
      daysPerWeek: '',
      daysPerMonth: '',
      avgDays: '',
      hoursPerDay: '',
    });
  };

  const handleFinish = () => {
    setOnboarded(true);
    onFinish();
  };

  const formatNumberInput = (value: string) => {
    const num = value.replace(/[^0-9]/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const isFormValid = () => {
    const amount = parseFloat(formData.amount.replace(/,/g, '')) || 0;
    if (amount <= 0) return false;

    if (selectedType === 'daily') {
      const hours = parseFloat(formData.hours.replace(/,/g, '')) || 0;
      return hours > 0;
    }

    if (selectedType === 'weekly') {
      const daysPerWeek = parseFloat(formData.daysPerWeek.replace(/,/g, '')) || 0;
      const hoursPerDay = parseFloat(formData.hoursPerDay.replace(/,/g, '')) || 0;
      return daysPerWeek > 0 && hoursPerDay > 0;
    }

    if (selectedType === 'monthly') {
      const daysPerMonth = parseFloat(formData.daysPerMonth.replace(/,/g, '')) || 0;
      const hoursPerDay = parseFloat(formData.hoursPerDay.replace(/,/g, '')) || 0;
      return daysPerMonth > 0 && hoursPerDay > 0;
    }

    if (selectedType === 'project') {
      const avgDays = parseFloat(formData.avgDays.replace(/,/g, '')) || 0;
      const hoursPerDay = parseFloat(formData.hoursPerDay.replace(/,/g, '')) || 0;
      return avgDays > 0 && hoursPerDay > 0;
    }

    if (selectedType === 'custom') {
      const hours = parseFloat(formData.hours.replace(/,/g, '')) || 0;
      return hours > 0;
    }

    return true;
  };

  const renderIncomeForm = () => {
    if (!selectedType) return null;

    const typeInfo = INCOME_TYPES.find((t) => t.type === selectedType);

    return (
      <Card className="fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {typeInfo?.icon}
            {typeInfo?.label}
          </CardTitle>
          <CardDescription>{typeInfo?.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedType === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="customTitle">نام واحد درآمد</Label>
              <Input
                id="customTitle"
                placeholder="مثلاً: کلیپ، مقاله، جلسه"
                value={formData.customTitle}
                onChange={(e) => setFormData({ ...formData, customTitle: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">
              {selectedType === 'hourly' && 'مبلغ هر ساعت (تومان)'}
              {selectedType === 'daily' && 'مبلغ روزانه (تومان)'}
              {selectedType === 'weekly' && 'مبلغ هفتگی (تومان)'}
              {selectedType === 'monthly' && 'مبلغ ماهانه (تومان)'}
              {selectedType === 'project' && 'میانگین درآمد ماهانه (تومان)'}
              {selectedType === 'custom' && 'مبلغ هر واحد (تومان)'}
            </Label>
            <Input
              id="amount"
              type="text"
              inputMode="numeric"
              placeholder="۰"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: formatNumberInput(e.target.value) })}
              className="text-left"
              dir="ltr"
            />
          </div>

          {/* Daily: Only hours per day */}
          {selectedType === 'daily' && (
            <div className="space-y-2">
              <Label htmlFor="hours">ساعت کار در روز</Label>
              <Input
                id="hours"
                type="text"
                inputMode="decimal"
                placeholder="۰"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: formatNumberInput(e.target.value) })}
                className="text-left"
                dir="ltr"
              />
            </div>
          )}

          {/* Weekly: Days per week + Hours per day */}
          {selectedType === 'weekly' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="daysPerWeek">تعداد روز کاری در هفته</Label>
                <Input
                  id="daysPerWeek"
                  type="text"
                  inputMode="decimal"
                  placeholder="مثلاً: ۶"
                  value={formData.daysPerWeek}
                  onChange={(e) => setFormData({ ...formData, daysPerWeek: formatNumberInput(e.target.value) })}
                  className="text-left"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hoursPerDayWeekly">ساعت کار در هر روز</Label>
                <Input
                  id="hoursPerDayWeekly"
                  type="text"
                  inputMode="decimal"
                  placeholder="مثلاً: ۸"
                  value={formData.hoursPerDay}
                  onChange={(e) => setFormData({ ...formData, hoursPerDay: formatNumberInput(e.target.value) })}
                  className="text-left"
                  dir="ltr"
                />
              </div>
            </>
          )}

          {/* Monthly: Days per month + Hours per day */}
          {selectedType === 'monthly' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="daysPerMonth">تعداد روز کاری در ماه</Label>
                <Input
                  id="daysPerMonth"
                  type="text"
                  inputMode="decimal"
                  placeholder="مثلاً: ۲۶"
                  value={formData.daysPerMonth}
                  onChange={(e) => setFormData({ ...formData, daysPerMonth: formatNumberInput(e.target.value) })}
                  className="text-left"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hoursPerDayMonthly">ساعت کار در هر روز</Label>
                <Input
                  id="hoursPerDayMonthly"
                  type="text"
                  inputMode="decimal"
                  placeholder="مثلاً: ۸"
                  value={formData.hoursPerDay}
                  onChange={(e) => setFormData({ ...formData, hoursPerDay: formatNumberInput(e.target.value) })}
                  className="text-left"
                  dir="ltr"
                />
              </div>
            </>
          )}

          {/* Project: Average days + Hours per day */}
          {selectedType === 'project' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="avgDays">میانگین روزهای کاری در ماه</Label>
                <Input
                  id="avgDays"
                  type="text"
                  inputMode="decimal"
                  placeholder="مثلاً: ۲۰"
                  value={formData.avgDays}
                  onChange={(e) => setFormData({ ...formData, avgDays: formatNumberInput(e.target.value) })}
                  className="text-left"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hoursPerDayProject">ساعت کار در هر روز</Label>
                <Input
                  id="hoursPerDayProject"
                  type="text"
                  inputMode="decimal"
                  placeholder="مثلاً: ۸"
                  value={formData.hoursPerDay}
                  onChange={(e) => setFormData({ ...formData, hoursPerDay: formatNumberInput(e.target.value) })}
                  className="text-left"
                  dir="ltr"
                />
              </div>
            </>
          )}

          {/* Custom: Hours per unit + Note about 8 hours/day */}
          {selectedType === 'custom' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="hoursCustom">ساعت لازم برای هر واحد</Label>
                <Input
                  id="hoursCustom"
                  type="text"
                  inputMode="decimal"
                  placeholder="۰"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: formatNumberInput(e.target.value) })}
                  className="text-left"
                  dir="ltr"
                />
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    در محاسبه معادل زمانی هزینه، ساعت کاری در روز ۸ ساعت در نظر گرفته می‌شود.
                  </p>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setStep('select')} className="flex-1">
              انصراف
            </Button>
            <Button onClick={handleAddIncome} className="flex-1" disabled={!isFormValid()}>
              <Plus className="w-4 h-4 ml-2" />
              افزودن
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAddedIncomes = () => {
    if (incomes.length === 0) return null;

    return (
      <div className="mt-6 space-y-3">
        <h3 className="font-medium text-sm text-muted-foreground">درآمدهای اضافه شده:</h3>
        <div className="space-y-2">
          {incomes.map((income) => {
            const typeInfo = INCOME_TYPES.find((t) => t.type === income.type);
            return (
              <div
                key={income.id}
                className="flex items-center justify-between p-3 bg-secondary rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-primary">{typeInfo?.icon}</span>
                  <span className="font-medium">
                    {income.type === 'custom' ? (income as { title?: string }).title : typeInfo?.label}
                  </span>
                </div>
                <Badge variant="secondary" className="font-mono">
                  {income.amount.toLocaleString('fa-IR')} تومان
                </Badge>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-primary/5 to-background flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">محاسبه‌گر درآمد</span>
        </div>
        {/* فقط اگر لاگین نیست، دکمه ورود نشان بده */}
        {!isAuthenticated && (
          <Button variant="ghost" size="sm" onClick={() => onNavigate('login')}>
            <User className="w-4 h-4 ml-2" />
            ورود به حساب
          </Button>
        )}
        {/* اگر لاگین است، نام کاربری را نشان بده */}
        {isAuthenticated && user && (
          <Badge variant="secondary" className="text-xs">
            <User className="w-3 h-3 ml-1" />
            {user.username}
          </Badge>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        {step === 'select' && (
          <div className="fade-in">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">نوع درآمد خود را انتخاب کنید</h1>
              <p className="text-muted-foreground">
                می‌توانید چند نوع درآمد مختلف اضافه کنید
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {INCOME_TYPES.map((type) => (
                <Button
                  key={type.type}
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all"
                  onClick={() => handleTypeSelect(type.type)}
                >
                  <span className="text-primary">{type.icon}</span>
                  <span className="font-medium">{type.label}</span>
                </Button>
              ))}
            </div>

            {renderAddedIncomes()}

            {/* Security Note */}
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-800 dark:text-green-200">
                    امنیت اطلاعات شما
                  </p>
                  <p className="text-green-700 dark:text-green-300 mt-1">
                    اطلاعات درآمد شما فقط در این دستگاه ذخیره می‌شود و به هیچ سروری ارسال نمی‌گردد.
                  </p>
                </div>
              </div>
            </div>

            {incomes.length > 0 && (
              <Button
                className="w-full mt-6 h-12 text-lg"
                onClick={handleFinish}
              >
                <Check className="w-5 h-5 ml-2" />
                شروع استفاده
              </Button>
            )}
          </div>
        )}

        {step === 'form' && (
          <div className="slide-up">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4"
              onClick={() => setStep('select')}
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              بازگشت
            </Button>
            {renderIncomeForm()}
          </div>
        )}
      </main>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ورود به حساب کاربری</DialogTitle>
            <DialogDescription>
              برای ورود به حساب کاربری، ابتدا تنظیمات اولیه را تکمیل کنید.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowLoginDialog(false)}
            >
              انصراف
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                setShowLoginDialog(false);
                onNavigate('login');
              }}
            >
              ادامه
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
