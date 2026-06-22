import { useState } from 'react';
import { useStore } from '@/store';
import { Settings as SettingsIcon, ShieldAlert, Clock, ToggleLeft, ToggleRight, Plus, X, RefreshCw, Calendar, AlertTriangle } from 'lucide-react';

export default function Settings() {
  const { settings, updateSettings, refreshStatuses } = useStore();
  const [newRestricted, setNewRestricted] = useState('');

  const handleAddRestricted = () => {
    if (newRestricted.trim() && !settings.restrictedPesticides.includes(newRestricted.trim())) {
      updateSettings({ restrictedPesticides: [...settings.restrictedPesticides, newRestricted.trim()] });
      setNewRestricted('');
    }
  };

  const handleRemoveRestricted = (name: string) => {
    updateSettings({ restrictedPesticides: settings.restrictedPesticides.filter((p) => p !== name) });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">系统设置</h1>
        <p className="text-sm text-surface-500 mt-1">管理商品分类、禁限用农药名录及过期规则</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-surface-900">过期规则配置</h3>
              <p className="text-xs text-surface-500">设置商品过期预警和自动禁售规则</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">临期预警天数</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={settings.warningDays}
                  onChange={(e) => updateSettings({ warningDays: Number(e.target.value) })}
                  min={1}
                  max={365}
                  className="w-24 px-3 py-2 border border-surface-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-sm text-surface-500">天</span>
              </div>
              <p className="text-xs text-surface-400 mt-1">保质期到期前 {settings.warningDays} 天标记为临期预警</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-surface-700">自动禁售过期商品</p>
                <p className="text-xs text-surface-500 mt-0.5">过期商品无法加入购物车进行销售</p>
              </div>
              <button
                onClick={() => updateSettings({ autoBanExpired: !settings.autoBanExpired })}
                className="shrink-0"
              >
                {settings.autoBanExpired ? (
                  <ToggleRight className="w-10 h-6 text-primary-600" />
                ) : (
                  <ToggleLeft className="w-10 h-6 text-surface-400" />
                )}
              </button>
            </div>

            <button
              onClick={refreshStatuses}
              className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              立即刷新所有商品状态
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-gold-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-gold-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-surface-900">播种提醒配置</h3>
              <p className="text-xs text-surface-500">设置播种日历的提前提醒天数</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">播种提醒天数</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={settings.seedingReminderDays}
                  onChange={(e) => updateSettings({ seedingReminderDays: Number(e.target.value) })}
                  min={1}
                  max={60}
                  className="w-24 px-3 py-2 border border-surface-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-sm text-surface-500">天</span>
              </div>
              <p className="text-xs text-surface-400 mt-1">播种期前 {settings.seedingReminderDays} 天开始提醒</p>
            </div>

            <div className="p-4 bg-surface-50 rounded-xl">
              <p className="text-sm font-medium text-surface-700">提醒范围</p>
              <p className="text-xs text-surface-500 mt-0.5">系统将自动计算适宜播种期，提前 {settings.seedingReminderDays} 天在日历中高亮显示，并推送提醒通知</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-surface-900">催收提醒配置</h3>
              <p className="text-xs text-surface-500">设置赊账催收的提前提醒天数</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">催收提醒天数</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={settings.collectionReminderDays}
                  onChange={(e) => updateSettings({ collectionReminderDays: Number(e.target.value) })}
                  min={1}
                  max={90}
                  className="w-24 px-3 py-2 border border-surface-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-sm text-surface-500">天</span>
              </div>
              <p className="text-xs text-surface-400 mt-1">约定还款日期前 {settings.collectionReminderDays} 天自动生成催收清单</p>
            </div>

            <div className="p-4 bg-surface-50 rounded-xl">
              <p className="text-sm font-medium text-surface-700">自动催收</p>
              <p className="text-xs text-surface-500 mt-0.5">系统将自动扫描未结清的赊账记录，在还款日期前 {settings.collectionReminderDays} 天生成催收任务，并按紧急程度排序</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-surface-900">禁限用农药名录</h3>
              <p className="text-xs text-surface-500">标记后销售时强制实名登记</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              placeholder="输入农药名称添加到名录..."
              value={newRestricted}
              onChange={(e) => setNewRestricted(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddRestricted()}
              className="flex-1 px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button onClick={handleAddRestricted} className="px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 flex items-center gap-1">
              <Plus className="w-4 h-4" />
              添加
            </button>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {settings.restrictedPesticides.map((name) => (
              <div key={name} className="flex items-center justify-between px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-800">{name}</span>
                </div>
                <button
                  onClick={() => handleRemoveRestricted(name)}
                  className="p-1 rounded-md hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {settings.restrictedPesticides.length === 0 && (
              <p className="text-sm text-surface-400 text-center py-4">暂无禁限用农药</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-gold-50 rounded-lg flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-gold-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-surface-900">系统信息</h3>
            <p className="text-xs text-surface-500">农资店管理系统当前运行状态</p>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-4">
          <InfoCard label="数据存储" value="localStorage" detail="浏览器本地存储" />
          <InfoCard label="系统版本" value="v1.0.0" detail="农资管理系统" />
          <InfoCard label="过期规则" value={`${settings.warningDays}天预警`} detail={settings.autoBanExpired ? '自动禁售已开启' : '自动禁售已关闭'} />
          <InfoCard label="播种提醒" value={`${settings.seedingReminderDays}天`} detail="播种前自动提醒" />
          <InfoCard label="催收提醒" value={`${settings.collectionReminderDays}天`} detail="还款前自动催收" />
          <InfoCard label="禁限用农药" value={`${settings.restrictedPesticides.length}种`} detail="需实名登记" />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="p-4 bg-surface-50 rounded-xl">
      <p className="text-xs text-surface-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-surface-900 font-mono">{value}</p>
      <p className="text-xs text-surface-400 mt-1">{detail}</p>
    </div>
  );
}
