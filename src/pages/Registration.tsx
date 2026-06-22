import { useState } from 'react';
import { useStore } from '@/store';
import { ClipboardCheck, Search, ShieldAlert, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

export default function Registration() {
  const { pesticideRegistrations } = useStore();
  const [searchIdCard, setSearchIdCard] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchChemical, setSearchChemical] = useState('');

  const filtered = pesticideRegistrations.filter((r) => {
    const matchIdCard = !searchIdCard || r.idCard.includes(searchIdCard);
    const matchName = !searchName || r.buyerName.includes(searchName);
    const matchChemical = !searchChemical || r.chemicalName.includes(searchChemical);
    return matchIdCard && matchName && matchChemical;
  });

  const maskIdCard = (id: string) => {
    if (id.length < 18) return id;
    return id.substring(0, 6) + '********' + id.substring(14);
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">实名登记台</h1>
        <p className="text-sm text-surface-500 mt-1">农药销售实名登记记录查询与台账管理</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="搜索购买人姓名..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="relative flex-1 max-w-xs">
          <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="搜索身份证号..."
            value={searchIdCard}
            onChange={(e) => setSearchIdCard(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-surface-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="relative flex-1 max-w-xs">
          <ClipboardCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="搜索农药名称..."
            value={searchChemical}
            onChange={(e) => setSearchChemical(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-surface-50 border-b border-surface-200 flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-primary-600" />
          <h3 className="text-sm font-semibold text-surface-700">实名登记台账</h3>
          <span className="text-xs px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full font-medium">{filtered.length}条记录</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-surface-400">
            <ClipboardCheck className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">暂无登记记录</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-100">
            {filtered.map((reg) => (
              <div key={reg.id} className="p-5 hover:bg-surface-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-surface-900">{reg.buyerName}</h4>
                        <span className="text-xs font-mono text-surface-500 bg-surface-100 px-2 py-0.5 rounded">{maskIdCard(reg.idCard)}</span>
                      </div>
                      <span className="text-xs text-surface-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(reg.registrationDate), 'yyyy-MM-dd HH:mm')}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-surface-600">
                      <span>农药: <span className="font-medium text-surface-900">{reg.chemicalName}</span></span>
                      <span>数量: <span className="font-mono font-medium">{reg.quantity}</span></span>
                      <span>用途: <span className="font-medium text-primary-600">{reg.purpose}</span></span>
                      <span>电话: {reg.phone}</span>
                    </div>
                    <div className="mt-1.5 text-xs text-surface-400">
                      关联订单: <span className="font-mono">{reg.orderId.slice(0, 12)}...</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
