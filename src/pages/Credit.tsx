import { useState } from 'react';
import { useStore } from '@/store';
import { Users, Plus, DollarSign, Clock, CheckCircle, X as XIcon, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function Credit() {
  const { farmers, creditRecords, saleOrders, addFarmer, addCreditPayment } = useStore();
  const [search, setSearch] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState<string | null>(null);
  const [showAddFarmer, setShowAddFarmer] = useState(false);
  const [showPayment, setShowPayment] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [farmerForm, setFarmerForm] = useState({ name: '', phone: '', address: '', idCard: '', creditRating: 'A' as 'A' | 'B' | 'C' });

  const filteredFarmers = farmers.filter((f) => f.name.includes(search) || f.phone.includes(search));

  const selectedFarmerData = farmers.find((f) => f.id === selectedFarmer);
  const farmerCredits = creditRecords.filter((r) => r.farmerId === selectedFarmer);
  const farmerOrders = saleOrders.filter((o) => o.farmerId === selectedFarmer);

  const handleAddFarmer = (e: React.FormEvent) => {
    e.preventDefault();
    addFarmer(farmerForm);
    setShowAddFarmer(false);
    setFarmerForm({ name: '', phone: '', address: '', idCard: '', creditRating: 'A' });
  };

  const handlePayment = () => {
    if (!showPayment || !paymentAmount) return;
    addCreditPayment(showPayment, Number(paymentAmount));
    setShowPayment(null);
    setPaymentAmount('');
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'unpaid': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-medium"><Clock className="w-3 h-3" />未还款</span>;
      case 'partial': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-50 text-gold-700 text-xs font-medium"><DollarSign className="w-3 h-3" />部分还款</span>;
      case 'paid': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-medium"><CheckCircle className="w-3 h-3" />已结清</span>;
      default: return null;
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">农户赊账管理</h1>
          <p className="text-sm text-surface-500 mt-1">农户档案、挂账记录、秋收后结账</p>
        </div>
        <button onClick={() => setShowAddFarmer(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          新增农户
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 h-[calc(100vh-180px)]">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="搜索农户姓名、电话..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredFarmers.map((farmer) => (
              <div
                key={farmer.id}
                onClick={() => setSelectedFarmer(farmer.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedFarmer === farmer.id
                    ? 'border-primary-500 bg-primary-50 shadow-sm'
                    : 'border-surface-200 bg-white hover:border-surface-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm shrink-0">
                    {farmer.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-surface-900">{farmer.name}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${farmer.creditRating === 'A' ? 'bg-primary-50 text-primary-700' : farmer.creditRating === 'B' ? 'bg-gold-50 text-gold-700' : 'bg-red-50 text-red-700'}`}>
                        {farmer.creditRating}级
                      </span>
                    </div>
                    <p className="text-xs text-surface-500 mt-0.5">{farmer.phone}</p>
                  </div>
                </div>
                {farmer.totalDebt > 0 && (
                  <div className="mt-2 px-3 py-1.5 bg-red-50 rounded-lg">
                    <span className="text-xs text-red-600 font-medium">欠款: <span className="font-mono font-bold">¥{farmer.totalDebt.toFixed(2)}</span></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden flex flex-col">
          {!selectedFarmerData ? (
            <div className="flex-1 flex flex-col items-center justify-center text-surface-400">
              <Users className="w-16 h-16 mb-3 opacity-30" />
              <p className="text-sm">选择左侧农户查看详情</p>
            </div>
          ) : (
            <>
              <div className="p-5 border-b border-surface-200 bg-surface-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-surface-900">{selectedFarmerData.name}</h2>
                    <p className="text-xs text-surface-500 mt-1">{selectedFarmerData.phone} | {selectedFarmerData.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-surface-500">累计欠款</p>
                    <p className="text-2xl font-bold font-mono text-red-600">¥{selectedFarmerData.totalDebt.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                <h3 className="text-sm font-semibold text-surface-700 mb-3">赊账记录</h3>
                {farmerCredits.length === 0 ? (
                  <p className="text-sm text-surface-400 text-center py-8">暂无赊账记录</p>
                ) : (
                  <div className="space-y-3">
                    {farmerCredits.map((credit) => {
                      const order = saleOrders.find((o) => o.id === credit.orderId);
                      const remaining = credit.amount - credit.paidAmount;
                      return (
                        <div key={credit.id} className="border border-surface-200 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-surface-500">{order?.orderNumber}</span>
                              {statusLabel(credit.status)}
                            </div>
                            <span className="text-xs text-surface-400">{format(new Date(credit.createdAt), 'yyyy-MM-dd')}</span>
                          </div>

                          {order && (
                            <div className="mb-2">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex justify-between text-xs text-surface-600 py-0.5">
                                  <span>{item.productName} x{item.quantity}</span>
                                  <span className="font-mono">¥{item.subtotal.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-surface-100">
                            <div className="flex items-center gap-4 text-xs">
                              <span className="text-surface-500">总额: <span className="font-mono font-medium text-surface-900">¥{credit.amount.toFixed(2)}</span></span>
                              <span className="text-surface-500">已付: <span className="font-mono font-medium text-primary-600">¥{credit.paidAmount.toFixed(2)}</span></span>
                              <span className="text-surface-500">剩余: <span className="font-mono font-bold text-red-600">¥{remaining.toFixed(2)}</span></span>
                            </div>
                            {credit.status !== 'paid' && (
                              <button
                                onClick={() => { setShowPayment(credit.id); setPaymentAmount(remaining.toFixed(2)); }}
                                className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors"
                              >
                                还款
                              </button>
                            )}
                          </div>
                          <div className="mt-2">
                            <div className="w-full bg-surface-100 rounded-full h-1.5">
                              <div className="bg-primary-500 h-1.5 rounded-full transition-all" style={{ width: `${(credit.paidAmount / credit.amount) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {showAddFarmer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowAddFarmer(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-surface-900">新增农户</h2>
              <button onClick={() => setShowAddFarmer(false)} className="p-1 rounded-md hover:bg-surface-100 text-surface-400">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddFarmer} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1">姓名 <span className="text-red-500">*</span></label>
                <input type="text" value={farmerForm.name} onChange={(e) => setFarmerForm({ ...farmerForm, name: e.target.value })} className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1">电话 <span className="text-red-500">*</span></label>
                <input type="text" value={farmerForm.phone} onChange={(e) => setFarmerForm({ ...farmerForm, phone: e.target.value })} className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1">地址</label>
                <input type="text" value={farmerForm.address} onChange={(e) => setFarmerForm({ ...farmerForm, address: e.target.value })} className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1">身份证号</label>
                <input type="text" value={farmerForm.idCard} onChange={(e) => setFarmerForm({ ...farmerForm, idCard: e.target.value })} maxLength={18} className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1">信用评级</label>
                <select value={farmerForm.creditRating} onChange={(e) => setFarmerForm({ ...farmerForm, creditRating: e.target.value as 'A' | 'B' | 'C' })} className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="A">A级 - 信用良好</option>
                  <option value="B">B级 - 信用一般</option>
                  <option value="C">C级 - 信用较差</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddFarmer(false)} className="px-4 py-2 border border-surface-300 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-50">取消</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">确认添加</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPayment && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowPayment(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-surface-900 mb-4">还款操作</h2>
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1">还款金额</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowPayment(null)} className="px-4 py-2 border border-surface-300 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-50">取消</button>
              <button onClick={handlePayment} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">确认还款</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
