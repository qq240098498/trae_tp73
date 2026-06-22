import { useState, useMemo } from 'react';
import { useStore } from '@/store';
import { Calendar, Bell, Sprout, Plus, X as XIcon, AlertCircle, CheckCircle, Clock, Info, Trash2, Edit2, Leaf, Droplets, Sun, RefreshCcw } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { SeedingCrop } from '@/types';

export default function SeedingCalendar() {
  const seedingCrops = useStore((s) => s.seedingCrops);
  const getSeedingReminders = useStore((s) => s.getSeedingReminders);
  const dismissReminder = useStore((s) => s.dismissReminder);
  const addSeedingCrop = useStore((s) => s.addSeedingCrop);
  const updateSeedingCrop = useStore((s) => s.updateSeedingCrop);
  const deleteSeedingCrop = useStore((s) => s.deleteSeedingCrop);
  const updateSettings = useStore((s) => s.updateSettings);
  const seeds = useStore((s) => s.seeds);
  const settings = useStore((s) => s.settings);
  const dismissedReminders = useStore((s) => s.dismissedReminders);
  const clearDismissedReminders = useStore((s) => s.clearDismissedReminders);

  const [activeTab, setActiveTab] = useState<'calendar' | 'reminders' | 'crops'>('calendar');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddCrop, setShowAddCrop] = useState(false);
  const [editingCropId, setEditingCropId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const [tempReminderDays, setTempReminderDays] = useState(settings.seedingReminderDays);

  const [cropForm, setCropForm] = useState({
    name: '',
    category: '水稻',
    sowingStartMonth: 3,
    sowingStartDay: 15,
    sowingEndMonth: 4,
    sowingEndDay: 10,
    recommendedVarieties: [{ name: '', description: '' }],
    usagePerMu: 1.5,
    usageUnit: 'kg',
    growingPeriod: '120天',
    notes: '',
    region: '华中地区',
  });

  const reminders = useMemo(() => getSeedingReminders(), [getSeedingReminders]);
  const activeReminders = reminders.filter((r) => r.isActive && r.daysUntilSowing >= 0);

  const categories = useMemo(() => {
    const cats = [...new Set(seedingCrops.map((c) => c.category))];
    return ['all', ...cats];
  }, [seedingCrops]);

  const filteredCrops = useMemo(() => {
    if (selectedCategory === 'all') return seedingCrops;
    return seedingCrops.filter((c) => c.category === selectedCategory);
  }, [seedingCrops, selectedCategory]);

  const calendarData = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay();
    const days: (Date | null)[] = [];

    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [selectedDate]);

  const getCropsForDate = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return seedingCrops.filter((crop) => {
      const start = crop.sowingStartMonth * 100 + crop.sowingStartDay;
      const end = crop.sowingEndMonth * 100 + crop.sowingEndDay;
      const current = month * 100 + day;
      if (start <= end) {
        return current >= start && current <= end;
      }
      return current >= start || current <= end;
    });
  };

  const getRemindersForDate = (date: Date) => {
    return reminders.filter((r) => {
      const reminderDate = format(new Date(r.sowingStartDate), 'yyyy-MM-dd');
      const dateStr = format(date, 'yyyy-MM-dd');
      const diff = differenceInDays(new Date(reminderDate), new Date(dateStr));
      return diff >= 0 && diff <= settings.seedingReminderDays;
    });
  };

  const handleAddCrop = (e: React.FormEvent) => {
    e.preventDefault();
    const cropData = {
      ...cropForm,
      recommendedVarieties: cropForm.recommendedVarieties.filter((v) => v.name.trim()),
    };
    if (editingCropId) {
      updateSeedingCrop(editingCropId, cropData);
    } else {
      addSeedingCrop(cropData);
    }
    setShowAddCrop(false);
    setEditingCropId(null);
    resetForm();
  };

  const resetForm = () => {
    setCropForm({
      name: '',
      category: '水稻',
      sowingStartMonth: 3,
      sowingStartDay: 15,
      sowingEndMonth: 4,
      sowingEndDay: 10,
      recommendedVarieties: [{ name: '', description: '' }],
      usagePerMu: 1.5,
      usageUnit: 'kg',
      growingPeriod: '120天',
      notes: '',
      region: '华中地区',
    });
  };

  const openEditCrop = (crop: SeedingCrop) => {
    setEditingCropId(crop.id);
    setCropForm({
      name: crop.name,
      category: crop.category,
      sowingStartMonth: crop.sowingStartMonth,
      sowingStartDay: crop.sowingStartDay,
      sowingEndMonth: crop.sowingEndMonth,
      sowingEndDay: crop.sowingEndDay,
      recommendedVarieties: crop.recommendedVarieties.length > 0 ? crop.recommendedVarieties : [{ name: '', description: '' }],
      usagePerMu: crop.usagePerMu,
      usageUnit: crop.usageUnit,
      growingPeriod: crop.growingPeriod,
      notes: crop.notes,
      region: crop.region,
    });
    setShowAddCrop(true);
  };

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      '水稻': 'bg-green-100 text-green-700',
      '玉米': 'bg-yellow-100 text-yellow-700',
      '小麦': 'bg-amber-100 text-amber-700',
      '经济作物': 'bg-purple-100 text-purple-700',
      '油料作物': 'bg-orange-100 text-orange-700',
      '蔬菜': 'bg-emerald-100 text-emerald-700',
    };
    return colorMap[category] || 'bg-surface-100 text-surface-700';
  };

  const getReminderStatus = (days: number) => {
    if (days <= 0) return { label: '播种期', color: 'bg-green-500' };
    if (days <= 7) return { label: '紧急', color: 'bg-red-500' };
    if (days <= 15) return { label: '临近', color: 'bg-gold-500' };
    return { label: '提醒', color: 'bg-blue-500' };
  };

  const today = new Date();

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">播种日历</h1>
          <p className="text-sm text-surface-500 mt-1">
            按本地农时预设播种窗口，窗口期前{settings.seedingReminderDays}天自动提醒备种
          </p>
        </div>
        <button
          onClick={() => setShowAddCrop(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          新增作物
        </button>
      </div>

      <div className="flex items-center gap-1 bg-surface-100 p-1 rounded-lg w-fit">
        {[
          { key: 'calendar', label: '日历视图', icon: Calendar },
          { key: 'reminders', label: '待办提醒', icon: Bell },
          { key: 'crops', label: '作物管理', icon: Sprout },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-surface-600 hover:text-surface-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.key === 'reminders' && activeReminders.length > 0 && (
              <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {activeReminders.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'calendar' && (
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-3 bg-white rounded-xl border border-surface-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-surface-900">
                {format(selectedDate, 'yyyy年MM月', { locale: zhCN })}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                  className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
                >
                  <span className="text-surface-600">←</span>
                </button>
                <button
                  onClick={() => setSelectedDate(new Date())}
                  className="px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  今天
                </button>
                <button
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                  className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
                >
                  <span className="text-surface-600">→</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-surface-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarData.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="h-24 bg-surface-50/50 rounded-lg" />;
                }
                const crops = getCropsForDate(date);
                const dayReminders = getRemindersForDate(date);
                const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

                return (
                  <div
                    key={date.toISOString()}
                    className={`h-24 p-1.5 rounded-lg border transition-all ${
                      isToday
                        ? 'border-primary-500 bg-primary-50/30'
                        : crops.length > 0
                        ? 'border-green-200 bg-green-50/30'
                        : 'border-surface-100 bg-white hover:border-surface-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium ${isToday ? 'text-primary-600' : 'text-surface-700'}`}>
                        {date.getDate()}
                      </span>
                      {dayReminders.length > 0 && (
                        <Bell className="w-3 h-3 text-gold-500" />
                      )}
                    </div>
                    <div className="space-y-1">
                      {crops.slice(0, 2).map((crop) => (
                        <div
                          key={crop.id}
                          className={`text-[10px] px-1.5 py-0.5 rounded truncate ${getCategoryColor(crop.category)}`}
                        >
                          {crop.name}
                        </div>
                      ))}
                      {crops.length > 2 && (
                        <div className="text-[10px] text-surface-500">+{crops.length - 2}种</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-surface-100">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-green-200 border border-green-300" />
                <span className="text-xs text-surface-600">播种期</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bell className="w-3 h-3 text-gold-500" />
                <span className="text-xs text-surface-600">备种提醒</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-primary-100 border border-primary-300" />
                <span className="text-xs text-surface-600">今天</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-surface-200 p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-surface-700 mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4 text-gold-500" />
                备种提醒
              </h3>
              {activeReminders.length === 0 ? (
                <div className="text-center py-6 text-surface-400">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">暂无备种提醒</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {activeReminders.slice(0, 5).map((reminder) => {
                    const status = getReminderStatus(reminder.daysUntilSowing);
                    return (
                      <div key={reminder.id} className="p-3 bg-surface-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-surface-900">{reminder.cropName}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded text-white ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-xs text-surface-500">
                          {reminder.daysUntilSowing > 0
                            ? `${reminder.daysUntilSowing}天后开始播种`
                            : '正在播种期'}
                        </p>
                        <p className="text-xs text-surface-400 mt-1">
                          {format(new Date(reminder.sowingStartDate), 'MM/dd')} -{' '}
                          {format(new Date(reminder.sowingEndDate), 'MM/dd')}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-surface-200 p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-surface-700 mb-3 flex items-center gap-2">
                <Sprout className="w-4 h-4 text-primary-500" />
                本月播种作物
              </h3>
              {(() => {
                const monthCrops = seedingCrops.filter((crop) => {
                  const month = selectedDate.getMonth() + 1;
                  const start = crop.sowingStartMonth;
                  const end = crop.sowingEndMonth;
                  if (start <= end) return month >= start && month <= end;
                  return month >= start || month <= end;
                });
                if (monthCrops.length === 0) {
                  return <p className="text-xs text-surface-400 text-center py-4">本月暂无播种作物</p>;
                }
                return (
                  <div className="space-y-2">
                    {monthCrops.map((crop) => (
                      <div key={crop.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(crop.category)}`}>
                            {crop.name}
                          </span>
                        </div>
                        <span className="text-xs text-surface-500">
                          {crop.sowingStartMonth}/{crop.sowingStartDay} - {crop.sowingEndMonth}/{crop.sowingEndDay}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reminders' && (
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 bg-white rounded-xl border border-surface-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-surface-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-gold-500" />
                备种提醒列表
              </h3>
              <button
                onClick={() => setShowAddCrop(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                新增作物提醒
              </button>
            </div>
            {reminders.length === 0 ? (
              <div className="text-center py-16 text-surface-400">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">暂无备种提醒</p>
                <p className="text-xs mt-1">系统会在播种窗口前{settings.seedingReminderDays}天自动提醒</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reminders.map((reminder) => {
                  const status = getReminderStatus(reminder.daysUntilSowing);
                  return (
                    <div
                      key={reminder.id}
                      className={`p-4 rounded-xl border transition-all ${
                        reminder.isActive
                          ? 'border-gold-200 bg-gold-50/30'
                          : 'border-surface-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${status.color} text-white`}>
                            {reminder.daysUntilSowing > 0 ? (
                              <Clock className="w-5 h-5" />
                            ) : (
                              <Sprout className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-surface-900">{reminder.cropName}</h4>
                              <span className={`text-[10px] px-2 py-0.5 rounded text-white ${status.color}`}>
                                {status.label}
                              </span>
                            </div>
                            <p className="text-sm text-surface-600 mt-1">
                              播种窗口: {format(new Date(reminder.sowingStartDate), 'yyyy年MM月dd日')} -{' '}
                              {format(new Date(reminder.sowingEndDate), 'MM月dd日')}
                            </p>
                            {reminder.daysUntilSowing > 0 && (
                              <p className="text-sm text-gold-600 mt-0.5 font-medium">
                                还有 {reminder.daysUntilSowing} 天进入播种期，请及时备种
                              </p>
                            )}
                            {reminder.daysUntilSowing <= 0 && reminder.daysUntilSowing >= -15 && (
                              <p className="text-sm text-green-600 mt-0.5 font-medium flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                当前正处于播种期
                              </p>
                            )}
                            <div className="mt-3 pt-3 border-t border-surface-100">
                              <p className="text-xs font-medium text-surface-700 mb-2">推荐品种:</p>
                              <div className="flex flex-wrap gap-2">
                                {reminder.recommendedVarieties.map((v, idx) => (
                                  <div key={idx} className="text-xs bg-white px-2 py-1 rounded-lg border border-surface-200">
                                    <span className="font-medium text-surface-900">{v.name}</span>
                                    {v.description && (
                                      <span className="text-surface-500 ml-1">({v.description})</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-xs text-surface-600">
                                <span className="flex items-center gap-1">
                                  <Droplets className="w-3.5 h-3.5" />
                                  亩用量: {reminder.usagePerMu}{reminder.usageUnit}
                                </span>
                              </div>
                              {reminder.notes && (
                                <p className="text-xs text-surface-500 mt-2 flex items-start gap-1">
                                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                  {reminder.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => dismissReminder(reminder.id)}
                          className="text-xs text-surface-400 hover:text-surface-600 transition-colors"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-5 text-white shadow-sm">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Sun className="w-5 h-5" />
                农事建议
              </h3>
              <p className="text-sm text-primary-100 mb-3">
                根据当前季节和本地气候，为您推荐以下农事活动：
              </p>
              <div className="space-y-2">
                {activeReminders.slice(0, 3).map((reminder) => (
                  <div key={reminder.id} className="bg-white/20 rounded-lg p-3">
                    <p className="text-sm font-medium">准备{reminder.cropName}种子</p>
                    <p className="text-xs text-primary-100 mt-1">
                      建议采购: {reminder.recommendedVarieties.map((v) => v.name).join('、')}
                    </p>
                  </div>
                ))}
                {activeReminders.length === 0 && (
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-sm font-medium">暂无紧急农事</p>
                    <p className="text-xs text-primary-100 mt-1">请关注后续播种提醒</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-surface-200 p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-surface-700 mb-3">提醒设置</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-surface-600">提前提醒天数</span>
                    {!showReminderSettings ? (
                      <button
                        onClick={() => {
                          setTempReminderDays(settings.seedingReminderDays);
                          setShowReminderSettings(true);
                        }}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                      >
                        编辑
                      </button>
                    ) : null}
                  </div>
                  {!showReminderSettings ? (
                    <span className="text-lg font-bold text-primary-600">{settings.seedingReminderDays}天</span>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="1"
                          max="60"
                          value={tempReminderDays}
                          onChange={(e) => setTempReminderDays(Number(e.target.value))}
                          className="flex-1 h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                        />
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={tempReminderDays}
                          onChange={(e) => setTempReminderDays(Math.min(60, Math.max(1, Number(e.target.value))))}
                          className="w-16 px-2 py-1 border border-surface-200 rounded-lg text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <span className="text-sm text-surface-500">天</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            updateSettings({ seedingReminderDays: tempReminderDays });
                            setShowReminderSettings(false);
                          }}
                          className="flex-1 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => setShowReminderSettings(false)}
                          className="flex-1 px-3 py-1.5 border border-surface-300 text-surface-600 rounded-lg text-xs font-medium hover:bg-surface-50 transition-colors"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="pt-3 border-t border-surface-100">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm text-surface-600">已忽略提醒</span>
                      <span className="text-sm font-medium text-surface-500 ml-2">
                        {dismissedReminders.length}条
                      </span>
                    </div>
                    {dismissedReminders.length > 0 && (
                      <button
                        onClick={() => clearDismissedReminders()}
                        className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        <RefreshCcw className="w-3 h-3" />
                        重置
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'crops' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary-600 text-white'
                    : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                }`}
              >
                {cat === 'all' ? '全部' : cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {filteredCrops.map((crop) => (
              <div
                key={crop.id}
                className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-surface-900">{crop.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(crop.category)}`}>
                        {crop.category}
                      </span>
                    </div>
                    <p className="text-xs text-surface-500 mt-1">{crop.region}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditCrop(crop)}
                      className="p-1.5 hover:bg-surface-100 rounded-lg transition-colors text-surface-400 hover:text-primary-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteSeedingCrop(crop.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-surface-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-surface-400" />
                    <span className="text-surface-600">播种窗口:</span>
                    <span className="font-medium text-surface-900">
                      {crop.sowingStartMonth}月{crop.sowingStartDay}日 - {crop.sowingEndMonth}月{crop.sowingEndDay}日
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Leaf className="w-4 h-4 text-surface-400" />
                    <span className="text-surface-600">生育期:</span>
                    <span className="font-medium text-surface-900">{crop.growingPeriod}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Droplets className="w-4 h-4 text-surface-400" />
                    <span className="text-surface-600">亩用量:</span>
                    <span className="font-medium text-surface-900">{crop.usagePerMu}{crop.usageUnit}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-surface-100">
                  <p className="text-xs font-medium text-surface-700 mb-2">推荐品种:</p>
                  <div className="space-y-1.5">
                    {crop.recommendedVarieties.map((v, idx) => {
                      const seedInStock = v.seedId ? seeds.find((s) => s.id === v.seedId) : null;
                      return (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <Sprout className="w-3.5 h-3.5 text-primary-500" />
                            <span className="font-medium text-surface-900">{v.name}</span>
                            {v.description && (
                              <span className="text-surface-500">({v.description})</span>
                            )}
                          </div>
                          {seedInStock && (
                            <span className={`px-1.5 py-0.5 rounded ${
                              seedInStock.stockQuantity > 50
                                ? 'bg-green-100 text-green-700'
                                : seedInStock.stockQuantity > 10
                                ? 'bg-gold-100 text-gold-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              库存 {seedInStock.stockQuantity}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {crop.notes && (
                  <div className="mt-3 pt-3 border-t border-surface-100">
                    <p className="text-xs text-surface-500 flex items-start gap-1">
                      <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      {crop.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddCrop && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => { setShowAddCrop(false); setEditingCropId(null); }}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-surface-900">
                {editingCropId ? '编辑作物' : '新增作物'}
              </h2>
              <button
                onClick={() => { setShowAddCrop(false); setEditingCropId(null); }}
                className="p-1 rounded-md hover:bg-surface-100 text-surface-400"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCrop} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-surface-600 mb-1">
                    作物名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cropForm.name}
                    onChange={(e) => setCropForm({ ...cropForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-600 mb-1">
                    分类 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={cropForm.category}
                    onChange={(e) => setCropForm({ ...cropForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="水稻">水稻</option>
                    <option value="玉米">玉米</option>
                    <option value="小麦">小麦</option>
                    <option value="经济作物">经济作物</option>
                    <option value="油料作物">油料作物</option>
                    <option value="蔬菜">蔬菜</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-surface-600 mb-2">
                    播种开始日期 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={cropForm.sowingStartMonth}
                      onChange={(e) => setCropForm({ ...cropForm, sowingStartMonth: Number(e.target.value) })}
                      className="flex-1 px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}月</option>
                      ))}
                    </select>
                    <select
                      value={cropForm.sowingStartDay}
                      onChange={(e) => setCropForm({ ...cropForm, sowingStartDay: Number(e.target.value) })}
                      className="flex-1 px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}日</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-600 mb-2">
                    播种结束日期 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={cropForm.sowingEndMonth}
                      onChange={(e) => setCropForm({ ...cropForm, sowingEndMonth: Number(e.target.value) })}
                      className="flex-1 px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}月</option>
                      ))}
                    </select>
                    <select
                      value={cropForm.sowingEndDay}
                      onChange={(e) => setCropForm({ ...cropForm, sowingEndDay: Number(e.target.value) })}
                      className="flex-1 px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}日</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-surface-600 mb-1">
                    亩用量 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={cropForm.usagePerMu}
                    onChange={(e) => setCropForm({ ...cropForm, usagePerMu: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-600 mb-1">
                    单位 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={cropForm.usageUnit}
                    onChange={(e) => setCropForm({ ...cropForm, usageUnit: e.target.value })}
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="斤">斤</option>
                    <option value="袋">袋</option>
                    <option value="株">株</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-600 mb-1">
                    生育期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cropForm.growingPeriod}
                    onChange={(e) => setCropForm({ ...cropForm, growingPeriod: e.target.value })}
                    placeholder="如: 120天"
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-surface-600 mb-2">
                  推荐品种
                </label>
                <div className="space-y-2">
                  {cropForm.recommendedVarieties.map((v, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <input
                        type="text"
                        value={v.name}
                        onChange={(e) => {
                          const newVarieties = [...cropForm.recommendedVarieties];
                          newVarieties[idx] = { ...v, name: e.target.value };
                          setCropForm({ ...cropForm, recommendedVarieties: newVarieties });
                        }}
                        placeholder="品种名称"
                        className="flex-1 px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <input
                        type="text"
                        value={v.description}
                        onChange={(e) => {
                          const newVarieties = [...cropForm.recommendedVarieties];
                          newVarieties[idx] = { ...v, description: e.target.value };
                          setCropForm({ ...cropForm, recommendedVarieties: newVarieties });
                        }}
                        placeholder="品种描述"
                        className="flex-1 px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      {cropForm.recommendedVarieties.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newVarieties = cropForm.recommendedVarieties.filter((_, i) => i !== idx);
                            setCropForm({ ...cropForm, recommendedVarieties: newVarieties });
                          }}
                          className="p-2 text-surface-400 hover:text-red-600"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCropForm({
                      ...cropForm,
                      recommendedVarieties: [...cropForm.recommendedVarieties, { name: '', description: '' }]
                    })}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    添加品种
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1">
                  适种区域
                </label>
                <input
                  type="text"
                  value={cropForm.region}
                  onChange={(e) => setCropForm({ ...cropForm, region: e.target.value })}
                  placeholder="如: 华中地区"
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1">
                  注意事项
                </label>
                <textarea
                  value={cropForm.notes}
                  onChange={(e) => setCropForm({ ...cropForm, notes: e.target.value })}
                  placeholder="播种前准备、病虫害防治等注意事项"
                  rows={3}
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddCrop(false); setEditingCropId(null); }}
                  className="px-4 py-2 border border-surface-300 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                >
                  {editingCropId ? '保存修改' : '确认添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
