import { useStore } from '@/store';
import { format, subDays, isAfter } from 'date-fns';
import { TrendingUp, ShoppingCart, AlertTriangle, Users, Sprout, FlaskConical, DollarSign, ArrowRight, ClipboardCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getFarmerTotalDebt } from '@/lib/utils';

export default function Dashboard() {
  const seeds = useStore((s) => s.seeds);
  const chemicals = useStore((s) => s.chemicals);
  const farmers = useStore((s) => s.farmers);
  const saleOrders = useStore((s) => s.saleOrders);
  const creditRecords = useStore((s) => s.creditRecords);
  const settings = useStore((s) => s.settings);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  const todayOrders = saleOrders.filter((o) => format(new Date(o.saleDate), 'yyyy-MM-dd') === todayStr);
  const todaySales = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const todayProfit = todayOrders.reduce((sum, o) => {
    return sum + o.items.reduce((p, item) => {
      if (item.productType === 'seed') {
        const seed = seeds.find((s) => s.id === item.productId);
        return p + (seed ? (item.unitPrice - seed.purchasePrice) * item.quantity : 0);
      }
      const chem = chemicals.find((c) => c.id === item.productId);
      return p + (chem ? (item.unitPrice - chem.purchasePrice) * item.quantity : 0);
    }, 0);
  }, 0);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i);
    const dateStr = format(date, 'MM/dd');
    const dayOrders = saleOrders.filter((o) => format(new Date(o.saleDate), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
    return { date: dateStr, sales: dayOrders.reduce((sum, o) => sum + o.totalAmount, 0) };
  });

  const expiredItems = [...seeds.filter((s) => s.status === 'expired'), ...chemicals.filter((c) => c.status === 'expired')];
  const warningItems = [...seeds.filter((s) => s.status === 'warning'), ...chemicals.filter((c) => c.status === 'warning')];
  const lowStockItems = [...seeds.filter((s) => s.stockQuantity < 20), ...chemicals.filter((c) => c.stockQuantity < 20)];

  const expiredAlertItems = expiredItems.map((item) => ({ id: item.id, name: item.name, detail: item.expiryDate, type: 'expired' as const }));
  const warningAlertItems = warningItems.map((item) => ({ id: item.id, name: item.name, detail: item.expiryDate, type: 'warning' as const }));

  const totalDebt = farmers.reduce((sum, f) => sum + getFarmerTotalDebt(f.id, creditRecords), 0);
  const unpaidRecords = creditRecords.filter((r) => r.status !== 'paid');
  const overdueRecords = creditRecords.filter((r) => r.status !== 'paid' && isAfter(today, new Date(r.expectedPayDate)));

  const debtPaid = creditRecords.filter((r) => r.status === 'paid').reduce((sum, r) => sum + r.paidAmount, 0);
  const debtUnpaid = creditRecords.filter((r) => r.status !== 'paid').reduce((sum, r) => sum + (r.amount - r.paidAmount), 0);

  const pieData = [
    { name: '已收回', value: debtPaid, color: '#2E7D32' },
    { name: '待收回', value: debtUnpaid, color: '#F9A825' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">仪表盘</h1>
          <p className="text-sm text-surface-500 mt-1">{format(today, 'yyyy年MM月dd日 EEEE')}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="今日销售额" value={`¥${todaySales.toFixed(2)}`} color="green" />
        <StatCard icon={ShoppingCart} label="今日订单" value={`${todayOrders.length}单`} color="blue" />
        <StatCard icon={TrendingUp} label="今日利润" value={`¥${todayProfit.toFixed(2)}`} color="amber" />
        <StatCard icon={Users} label="赊账待收" value={`¥${totalDebt.toFixed(2)}`} color="red" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-xl border border-surface-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-surface-700 mb-4">近7日销售趋势</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9E9E9E" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9E9E9E" />
                <Tooltip formatter={(value: number) => [`¥${value.toFixed(2)}`, '销售额']} />
                <Line type="monotone" dataKey="sales" stroke="#1B5E20" strokeWidth={2.5} dot={{ fill: '#1B5E20', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-surface-700 mb-4">赊账回收概况</h3>
          <div className="h-40 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" startAngle={90} endAngle={-270}>
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`¥${value.toFixed(2)}`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
              <span className="text-surface-600">已收回 ¥{debtPaid.toFixed(0)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-gold-500" />
              <span className="text-surface-600">待收回 ¥{debtUnpaid.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <AlertSection
          title="过期禁售"
          items={expiredAlertItems}
          icon={AlertTriangle}
          color="red"
          linkTo="/chemicals"
        />

        <AlertSection
          title="临期预警"
          items={warningAlertItems}
          icon={AlertTriangle}
          color="amber"
          linkTo="/chemicals"
        />

        <AlertSection
          title="赊账逾期"
          items={overdueRecords.map((r) => {
            const farmer = farmers.find((f) => f.id === r.farmerId);
            return { id: r.id, name: farmer?.name || '未知', detail: `¥${(r.amount - r.paidAmount).toFixed(2)}`, type: 'overdue' as const };
          })}
          icon={Users}
          color="red"
          linkTo="/credit"
        />
      </div>

      <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-surface-700 mb-4">快捷操作</h3>
        <div className="grid grid-cols-4 gap-3">
          <QuickAction to="/sales" icon={ShoppingCart} label="新建销售" color="green" />
          <QuickAction to="/seeds" icon={Sprout} label="种子入库" color="amber" />
          <QuickAction to="/credit" icon={Users} label="赊账结账" color="blue" />
          <QuickAction to="/registration" icon={ClipboardCheck} label="农药实名登记" color="purple" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof DollarSign; label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    green: 'bg-primary-50 text-primary-600 border-primary-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    amber: 'bg-gold-50 text-gold-600 border-gold-200',
    red: 'bg-red-50 text-red-600 border-red-200',
  };
  const iconColorMap: Record<string, string> = {
    green: 'bg-primary-100 text-primary-600',
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-gold-100 text-gold-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className={`rounded-xl border p-4 ${colorMap[color]}`}>
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3">
        <p className="text-xs font-medium opacity-70">{label}</p>
        <p className="text-xl font-bold mt-0.5 font-mono">{value}</p>
      </div>
    </div>
  );
}

function AlertSection({ title, items, icon: Icon, color, linkTo }: { title: string; items: { id: string; name: string; detail: string; type: string }[]; icon: typeof AlertTriangle; color: string; linkTo: string }) {
  const borderColor = color === 'red' ? 'border-red-200' : 'border-gold-200';
  const bgColor = color === 'red' ? 'bg-red-50' : 'bg-gold-50';
  const textColor = color === 'red' ? 'text-red-700' : 'text-gold-700';
  const badgeColor = color === 'red' ? 'bg-red-100 text-red-700' : 'bg-gold-100 text-gold-700';

  return (
    <div className={`bg-white rounded-xl border ${borderColor} p-4 shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${textColor}`} />
          <h3 className="text-sm font-semibold text-surface-700">{title}</h3>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-surface-400 text-center py-4">暂无预警</p>
      ) : (
        <div className="space-y-2 max-h-36 overflow-y-auto">
          {items.slice(0, 5).map((item) => (
            <div key={item.id} className={`flex items-center justify-between px-3 py-2 rounded-lg ${bgColor}`}>
              <span className={`text-xs font-medium ${textColor}`}>{item.name}</span>
              <span className="text-xs text-surface-500 font-mono">{item.detail}</span>
            </div>
          ))}
        </div>
      )}
      {items.length > 0 && (
        <Link to={linkTo} className="flex items-center gap-1 mt-3 text-xs text-primary-500 hover:text-primary-600 font-medium">
          查看全部 <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

function QuickAction({ to, icon: Icon, label, color }: { to: string; icon: typeof ShoppingCart; label: string; color: string }) {
  const colorMap: Record<string, string> = {
    green: 'hover:bg-primary-50 hover:border-primary-300 group-hover:text-primary-600',
    amber: 'hover:bg-gold-50 hover:border-gold-300 group-hover:text-gold-600',
    blue: 'hover:bg-blue-50 hover:border-blue-300 group-hover:text-blue-600',
    purple: 'hover:bg-purple-50 hover:border-purple-300 group-hover:text-purple-600',
  };
  const iconColorMap: Record<string, string> = {
    green: 'text-primary-500',
    amber: 'text-gold-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
  };

  return (
    <Link to={to} className={`group flex flex-col items-center gap-2 p-4 rounded-xl border border-surface-200 transition-all duration-200 ${colorMap[color]}`}>
      <Icon className={`w-6 h-6 ${iconColorMap[color]}`} />
      <span className="text-xs font-medium text-surface-600 group-hover:text-surface-800">{label}</span>
    </Link>
  );
}
