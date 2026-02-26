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
import AppLayout from './AppLayout';
import type { Income, IncomeType, WeeklyIncome, MonthlyIncome, ProjectIncome } from '../../types';
import { generateId, formatCurrency, toPersianDigits, gregorianToJalali } from '../../utils/time';
import {
  Trash2,
  Clock,
  Calendar,
  CalendarDays,
  CalendarRange,
  Briefcase,
  Package,
  LogOut,
  Edit2,
  User,
  ShieldCheck,
  Info,
  Instagram,
  Send,
  Linkedin,
  Github,
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

type Page = 'home' | 'settings' | 'reports';

interface SettingsPageProps {
  onNavigate: (page: Page) => void;
  onSignup: () => void;
}

const INCOME_TYPES: { type: IncomeType; label: string; icon: React.ReactNode }[] = [
  { type: 'hourly', label: 'ساعتی', icon: <Clock className="w-4 h-4" /> },
  { type: 'daily', label: 'روزانه', icon: <Calendar className="w-4 h-4" /> },
  { type: 'weekly', label: 'هفتگی', icon: <CalendarDays className="w-4 h-4" /> },
  { type: 'monthly', label: 'ماهانه', icon: <CalendarRange className="w-4 h-4" /> },
  { type: 'project', label: 'پروژه‌ای', icon: <Briefcase className="w-4 h-4" /> },
  { type: 'custom', label: 'سفارشی', icon: <Package className="w-4 h-4" /> },
];

export default function SettingsPage({ onNavigate, onSignup }: SettingsPageProps) {
  const {
    incomes,
    addIncome,
    updateIncome,
    removeIncome,
    user,
    isAuthenticated,
    logout,
  } = useAppStore();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [selectedType, setSelectedType] = useState<IncomeType>('hourly');
  const [formData, setFormData] = useState({
    amount: '',
    hours: '',
    customTitle: '',
    daysPerWeek: '',
    daysPerMonth: '',
    avgDays: '',
    hoursPerDay: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const formatNumberInput = (value: string) => {
    const num = value.replace(/[^0-9]/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const openAddDialog = (type: IncomeType) => {
    setSelectedType(type);
    setFormData({
      amount: '',
      hours: '',
      customTitle: '',
      daysPerWeek: '',
      daysPerMonth: '',
      avgDays: '',
      hoursPerDay: '',
    });
    setShowAddDialog(true);
  };

  const openEditDialog = (income: Income) => {
    setEditingIncome(income);
    setSelectedType(income.type);

    const baseData = {
      amount: income.amount.toLocaleString('en-US'),
      hours: '',
      customTitle: '',
      daysPerWeek: '',
      daysPerMonth: '',
      avgDays: '',
      hoursPerDay: '',
    };

    switch (income.type) {
      case 'hourly':
        setFormData(baseData);
        break;
      case 'daily':
        setFormData({ ...baseData, hours: income.hours.toString() });
        break;
      case 'weekly':
        const weeklyIncome = income as WeeklyIncome;
        setFormData({
          ...baseData,
          daysPerWeek: (weeklyIncome.daysPerWeek || 6).toString(),
          hoursPerDay: (weeklyIncome.hoursPerDay || 8).toString(),
        });
        break;
      case 'monthly':
        const monthlyIncome = income as MonthlyIncome;
        setFormData({
          ...baseData,
          daysPerMonth: (monthlyIncome.daysPerMonth || 26).toString(),
          hoursPerDay: (monthlyIncome.hoursPerDay || 8).toString(),
        });
        break;
      case 'project':
        const projectIncome = income as ProjectIncome;
        setFormData({
          ...baseData,
          avgDays: (projectIncome.avgDays || 26).toString(),
          hoursPerDay: (projectIncome.hoursPerDay || 8).toString(),
        });
        break;
      case 'custom':
        setFormData({
          ...baseData,
          hours: income.hours.toString(),
          customTitle: (income as { title?: string }).title || '',
        });
        break;
      default:
        setFormData(baseData);
    }

    setShowAddDialog(true);
  };

  const handleSave = async () => {
    const amount = parseFloat(formData.amount.replace(/,/g, '')) || 0;
    const hours = parseFloat(formData.hours.replace(/,/g, '')) || 0;
    const daysPerWeek = parseFloat(formData.daysPerWeek.replace(/,/g, '')) || 0;
    const daysPerMonth = parseFloat(formData.daysPerMonth.replace(/,/g, '')) || 0;
    const avgDays = parseFloat(formData.avgDays.replace(/,/g, '')) || 0;
    const hoursPerDay = parseFloat(formData.hoursPerDay.replace(/,/g, '')) || 0;

    if (amount <= 0) {
      toast({
        title: 'خطا',
        description: 'لطفاً مبلغ را وارد کنید',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      let newIncome: Income;

      if (editingIncome) {
        // Update existing income
        switch (selectedType) {
          case 'hourly':
            newIncome = {
              ...editingIncome,
              amount,
              hours: 1,
            } as Income;
            break;
          case 'daily':
            newIncome = {
              ...editingIncome,
              amount,
              hours: hours > 0 ? hours : 8,
            } as Income;
            break;
          case 'weekly':
            const weeklyHours = (daysPerWeek > 0 ? daysPerWeek : 6) * (hoursPerDay > 0 ? hoursPerDay : 8);
            newIncome = {
              ...editingIncome,
              amount,
              hours: weeklyHours,
              daysPerWeek: daysPerWeek > 0 ? daysPerWeek : 6,
              hoursPerDay: hoursPerDay > 0 ? hoursPerDay : 8,
            } as WeeklyIncome;
            break;
          case 'monthly':
            const monthlyHours = (daysPerMonth > 0 ? daysPerMonth : 26) * (hoursPerDay > 0 ? hoursPerDay : 8);
            newIncome = {
              ...editingIncome,
              amount,
              hours: monthlyHours,
              daysPerMonth: daysPerMonth > 0 ? daysPerMonth : 26,
              hoursPerDay: hoursPerDay > 0 ? hoursPerDay : 8,
            } as MonthlyIncome;
            break;
          case 'project':
            const projectHours = (avgDays > 0 ? avgDays : 26) * (hoursPerDay > 0 ? hoursPerDay : 8);
            newIncome = {
              ...editingIncome,
              amount,
              hours: projectHours,
              avgDays: avgDays > 0 ? avgDays : 26,
              hoursPerDay: hoursPerDay > 0 ? hoursPerDay : 8,
            } as ProjectIncome;
            break;
          case 'custom':
            newIncome = {
              ...editingIncome,
              amount,
              hours: hours > 0 ? hours : 1,
              // title: formData.customTitle || 'واحد سفارشی',
            };
            break;
          default:
            return;
        }
        updateIncome(editingIncome.id, newIncome);
        toast({
          title: 'ویرایش شد',
          description: 'درآمد با موفقیت ویرایش شد',
        });
      } else {
        // Create new income
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
        await addIncome(newIncome);
        toast({
          title: 'اضافه شد',
          description: 'درآمد جدید اضافه شد',
        });
      }

      setShowAddDialog(false);
      setEditingIncome(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await removeIncome(id);
      toast({
        title: 'حذف شد',
        description: 'درآمد حذف شد',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: 'خروج موفق',
      description: 'از حساب کاربری خارج شدید',
    });
  };

  const getIncomeLabel = (income: Income) => {
    if (income.type === 'custom') {
      return (income as { title?: string }).title || 'سفارشی';
    }
    return INCOME_TYPES.find((t) => t.type === income.type)?.label || income.type;
  };

  const getIncomeDescription = (income: Income) => {
    switch (income.type) {
      case 'hourly':
        return `${formatCurrency(income.amount)} در ساعت`;
      case 'daily':
        return `${formatCurrency(income.amount)} در روز (${income.hours} ساعت)`;
      case 'weekly': {
        const weekly = income as WeeklyIncome;
        const days = weekly.daysPerWeek || 6;
        const hours = weekly.hoursPerDay || 8;
        return `${formatCurrency(income.amount)} در هفته (${days} روز × ${hours} ساعت)`;
      }
      case 'monthly': {
        const monthly = income as MonthlyIncome;
        const days = monthly.daysPerMonth || 26;
        const hours = monthly.hoursPerDay || 8;
        return `${formatCurrency(income.amount)} در ماه (${days} روز × ${hours} ساعت)`;
      }
      case 'project': {
        const project = income as ProjectIncome;
        const days = project.avgDays || 26;
        const hours = project.hoursPerDay || 8;
        return `میانگین ${formatCurrency(income.amount)} (${days} روز × ${hours} ساعت)`;
      }
      case 'custom': {
        const title = (income as { title?: string }).title || 'واحد';
        return `${formatCurrency(income.amount)} به ازای هر ${title} (${income.hours} ساعت)`;
      }
      default:
        return '';
    }
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

  return (
    <AppLayout currentPage="settings" onNavigate={onNavigate}>
      {/* Incomes Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>درآمدها</span>
            <Badge variant="secondary">{incomes.length}</Badge>
          </CardTitle>
          <CardDescription>نوع درآمد خود را مدیریت کنید</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {incomes.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              هنوز درآمدی اضافه نشده
            </p>
          ) : (
            incomes.map((income) => (
              <div
                key={income.id}
                className="flex items-center justify-between p-3 bg-secondary rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium">{getIncomeLabel(income)}</div>
                  <div className="text-sm text-muted-foreground">
                    {getIncomeDescription(income)}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(income)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDelete(income.id)}
                    disabled={deletingId === income.id}
                  >
                    {deletingId === income.id ? (
                      <div className="w-4 h-4 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}

          {/* Add Income Type Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-4">
            {INCOME_TYPES.map((type) => (
              <Button
                key={type.type}
                variant="outline"
                size="sm"
                className="flex flex-col h-auto py-2"
                onClick={() => openAddDialog(type.type)}
              >
                <span className="text-primary mb-1">{type.icon}</span>
                <span className="text-xs">{type.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Note */}
      <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800">
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

      {/* Account Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            حساب کاربری
          </CardTitle>
          <CardDescription>
            {isAuthenticated
              ? `وارد شده به عنوان ${user?.username}`
              : 'برای ذخیره داده‌ها در سرور، وارد شوید'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!isAuthenticated ? (
            <Button
              className="w-full"
              onClick={onSignup}
            >
              ورود / ثبت‌نام
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 ml-2" />
              خروج از حساب
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Developer Footer */}
      <div className="py-6 text-center border-t mt-8">
        <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mb-4">
          <span>توسعه‌دهنده:</span>
          <a
            href="https://mojtaba-zanganeh.ir"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline decoration-primary/30 underline-offset-4 transition-all"
          >
            mojtaba-zanganeh.ir
          </a>
        </div>

        <div className="flex items-center justify-center gap-1">
          <a
            href="https://github.com/MojtabaZanganeh/your-repo"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all"
            title="گیت‌هاب پروژه"
            aria-label="گیت‌هاب پروژه"
          >
            <Github className="w-4 h-4" />
          </a>

          <a
            href="https://www.linkedin.com/in/mojtaba-zanganeh"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all"
            title="لینکدین"
            aria-label="لینکدین"
          >
            <Linkedin className="w-4 h-4" />
          </a>

          <a
            href="https://t.me/mojtaba_z01"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all"
            title="تلگرام"
            aria-label="تلگرام"
          >
            <Send className="w-4 h-4" />
          </a>

          <a
            href="https://www.instagram.com/mojtaba_zanganeh_"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all"
            title="صفحه شخصی"
            aria-label="صفحه شخصی"
          >
            <Instagram className="w-4 h-4" />
          </a>
        </div>

        <p className="text-xs text-muted-foreground/60 mt-4">
          © {toPersianDigits(gregorianToJalali(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())[0])} — تمام حقوق محفوظ است
        </p>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        if (!isSaving) {
          setShowAddDialog(open);
          if (!open) setEditingIncome(null);
        }
      }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingIncome ? 'ویرایش درآمد' : 'افزودن درآمد جدید'}
            </DialogTitle>
            <DialogDescription>
              اطلاعات درآمد را وارد کنید
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {selectedType === 'custom' && (
              <div className="space-y-2">
                <Label>نام واحد درآمد</Label>
                <Input
                  placeholder="مثلاً: کلیپ، مقاله"
                  value={formData.customTitle}
                  onChange={(e) => setFormData({ ...formData, customTitle: e.target.value })}
                  disabled={isSaving}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>
                {selectedType === 'hourly' && 'مبلغ هر ساعت (تومان)'}
                {selectedType === 'daily' && 'مبلغ روزانه (تومان)'}
                {selectedType === 'weekly' && 'مبلغ هفتگی (تومان)'}
                {selectedType === 'monthly' && 'مبلغ ماهانه (تومان)'}
                {selectedType === 'project' && 'میانگین درآمد ماهانه (تومان)'}
                {selectedType === 'custom' && 'مبلغ هر واحد (تومان)'}
              </Label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="۰"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: formatNumberInput(e.target.value) })}
                dir="ltr"
                className="text-left"
                disabled={isSaving}
              />
            </div>

            {/* Daily: Only hours per day */}
            {selectedType === 'daily' && (
              <div className="space-y-2">
                <Label>ساعت کار در روز</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="۰"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: formatNumberInput(e.target.value) })}
                  dir="ltr"
                  className="text-left"
                  disabled={isSaving}
                />
              </div>
            )}

            {/* Weekly: Days per week + Hours per day */}
            {selectedType === 'weekly' && (
              <>
                <div className="space-y-2">
                  <Label>تعداد روز کاری در هفته</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="مثلاً: ۶"
                    value={formData.daysPerWeek}
                    onChange={(e) => setFormData({ ...formData, daysPerWeek: formatNumberInput(e.target.value) })}
                    dir="ltr"
                    className="text-left"
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label>ساعت کار در هر روز</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="مثلاً: ۸"
                    value={formData.hoursPerDay}
                    onChange={(e) => setFormData({ ...formData, hoursPerDay: formatNumberInput(e.target.value) })}
                    dir="ltr"
                    className="text-left"
                    disabled={isSaving}
                  />
                </div>
              </>
            )}

            {/* Monthly: Days per month + Hours per day */}
            {selectedType === 'monthly' && (
              <>
                <div className="space-y-2">
                  <Label>تعداد روز کاری در ماه</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="مثلاً: ۲۶"
                    value={formData.daysPerMonth}
                    onChange={(e) => setFormData({ ...formData, daysPerMonth: formatNumberInput(e.target.value) })}
                    dir="ltr"
                    className="text-left"
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label>ساعت کار در هر روز</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="مثلاً: ۸"
                    value={formData.hoursPerDay}
                    onChange={(e) => setFormData({ ...formData, hoursPerDay: formatNumberInput(e.target.value) })}
                    dir="ltr"
                    className="text-left"
                    disabled={isSaving}
                  />
                </div>
              </>
            )}

            {/* Project: Average days + Hours per day */}
            {selectedType === 'project' && (
              <>
                <div className="space-y-2">
                  <Label>میانگین روزهای کاری در ماه</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="مثلاً: ۲۰"
                    value={formData.avgDays}
                    onChange={(e) => setFormData({ ...formData, avgDays: formatNumberInput(e.target.value) })}
                    dir="ltr"
                    className="text-left"
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label>ساعت کار در هر روز</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="مثلاً: ۸"
                    value={formData.hoursPerDay}
                    onChange={(e) => setFormData({ ...formData, hoursPerDay: formatNumberInput(e.target.value) })}
                    dir="ltr"
                    className="text-left"
                    disabled={isSaving}
                  />
                </div>
              </>
            )}

            {/* Custom: Hours per unit + Note about 8 hours/day */}
            {selectedType === 'custom' && (
              <>
                <div className="space-y-2">
                  <Label>ساعت لازم برای هر واحد</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="۰"
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: formatNumberInput(e.target.value) })}
                    dir="ltr"
                    className="text-left"
                    disabled={isSaving}
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

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowAddDialog(false);
                  setEditingIncome(null);
                }}
                disabled={isSaving}
              >
                انصراف
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={isSaving || !isFormValid()}
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin ml-2" />
                ) : null}
                {editingIncome ? 'ویرایش' : 'افزودن'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
