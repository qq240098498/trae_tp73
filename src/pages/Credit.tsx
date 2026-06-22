import { useState, useMemo } from 'react';
import { useStore } from '@/store';
import { Users, Plus, DollarSign, Clock, CheckCircle, X as XIcon, Search, XCircle, Edit2, Award, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import { getFarmerTotalDebt } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function Credit() {
  const farmers = useStore((s) => s.farmers);
  const creditRecords = useStore((s) => s.creditRecords);
  const saleOrders = useStore((s) => s.saleOrders);
  const addFarmer = useStore((s) => s.addFarmer);
  const updateFarmer = useStore((s) => s.updateFarmer);
  const addCreditPayment = useStore((s) => s.addCreditPayment);

  const [search, setSearch] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState<string | null>(null);
  const [showAddFarmer, setShowAddFarmer] = useState(false);
  const [editingFarmerId, setEditingFarmerId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [farmerForm, setFarmerForm] = useState({ name: '', phone: '', address: '', idCard: '', creditRating: 'A' as 'A' | 'B' | 'C' });
  const [refreshKey, setRefreshKey] = useState(0);

  const farmersWithDebt = useMemo(() => {
    return farmers.map((f) => ({
      ...f,
      totalDebt: getFarmerTotalDebt(f.id, creditRecords),
    }));
  }, [farmers, creditRecords, refreshKey]);

  const filteredFarmers = farmersWithDebt.filter(
    (f) => f.name.includes(search) || f.phone.includes(search)
  );

  const selectedFarmerData = farmersWithDebt.find((f) => f.id === selectedFarmer);
  const farmerCredits = creditRecords.filter((r) => r.farmerId === selectedFarmer);

  const handleAddFarmer = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFarmerId) {
      updateFarmer(editingFarmerId, farmerForm);
    } else {
      addFarmer(farmerForm);
    }
    setShowAddFarmer(false);
    setEditingFarmerId(null);
    setFarmerForm({ name: '', phone: '', address: '', idCard: '', creditRating: 'A' });
    setRefreshKey((k) => k + 1);
  };

  const openEditFarmer = (farmer: typeof farmersWithDebt[0]) => {
    setEditingFarmerId(farmer.id);
    setFarmerForm({
      name: farmer.name,
      phone: farmer.phone,
      address: farmer.address,
      idCard: farmer.idCard,
      creditRating: farmer.creditRating,
    });
    setShowAddFarmer(true);
  };

  const handlePayment = () => {
    if (!showPayment || !paymentAmount) return;
    const amount = Number(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;
    addCreditPayment(showPayment, amount);
    setShowPayment(null);
    setPaymentAmount('');
    setRefreshKey((k) => k + 1);
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'unpaid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-medium">
            <XCircle className="w-3 h-3" />
            未还款
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-50 text-gold-700 text-xs font-medium">
            <DollarSign className="w-3 h-3" />
            部分还款
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            已结清
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">农户赊账管理</h1>
          <p className="text-sm text-surface-500 mt-1">农户档案、挂账记录、秋收后结账</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/sales"
            className="flex items-center gap-2 px-4 py-2.5 bg-gold-500 text-white rounded-lg text-sm font-medium hover:bg-gold-600 transition-colors shadow-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            新增赊账
          </Link>
          <button
            onClick={() => setShowAddFarmer(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            新增农户
          </button>
        </div>
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
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      farmer.creditRating === 'A'
                        ? 'bg-primary-100 text-primary-600'
                        : farmer.creditRating === 'B'
                        ? 'bg-gold-100 text-gold-700'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {farmer.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-surface-900">{farmer.name}</p>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                          farmer.creditRating === 'A'
                            ? 'bg-primary-50 text-primary-700'
                            : farmer.creditRating === 'B'
                            ? 'bg-gold-50 text-gold-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {farmer.creditRating}级
                      </span>
                    </div>
                    <p className="text-xs text-surface-500 mt-0.5">{farmer.phone}</p>
                  </div>
                </div>
                {farmer.totalDebt > 0 ? (
                  <div className="mt-2 px-3 py-1.5 bg-red-50 border border-red-100 rounded-lg">
                    <span className="text-xs text-red-600 font-medium">
                      欠款: <span className="font-mono font-bold">¥{farmer.totalDebt.toFixed(2)}</span>
                    </span>
                  </div>
                ) : (
                  <div className="mt-2 px-3 py-1.5 bg-primary-50 border border-primary-100 rounded-lg">
                    <span className="text-xs text-primary-700 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      无欠款
                    </span>
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
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        selectedFarmerData.creditRating === 'A'
                          ? 'bg-primary-100 text-primary-600'
                          : selectedFarmerData.creditRating === 'B'
                          ? 'bg-gold-100 text-gold-700'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {selectedFarmerData.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-surface-900">{selectedFarmerData.name}</h2>
                      <p className="text-xs text-surface-500 mt-0.5">
                        {selectedFarmerData.phone} | {selectedFarmerData.address || '地址未填写'} |{' '}
                        信用{selectedFarmerData.creditRating}级
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-surface-500">累计欠款</p>
                    {selectedFarmerData.totalDebt > 0 ? (
                      <p className="text-2xl font-bold font-mono text-red-600">
                        ¥{selectedFarmerData.totalDebt.toFixed(2)}
                      </p>
                    ) : (
                      <p className="text-2xl font-bold font-mono text-primary-600 flex items-center justify-end gap-1">
                        <CheckCircle className="w-5 h-5" />
                        ¥0.00
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-end gap-2">
                      <Link
                        to={`/sales?farmerId=${selectedFarmerData.id}&source=credit`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-white bg-gold-500 rounded-md hover:bg-gold-600 transition-colors"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        新增赊账
                      </Link>
                      <button
                        onClick={() => openEditFarmer(selectedFarmerData)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        编辑农户
                      </button>
                    </div>
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
                      const remaining = Math.max(0, credit.amount - credit.paidAmount);
                      const progress = credit.amount > 0 ? (credit.paidAmount / credit.amount) * 100 : 0;
                      return (
                        <div
                          key={credit.id}
                          className={`border rounded-xl p-4 transition-colors ${
                            credit.status === 'paid'
                              ? 'border-primary-200 bg-primary-50/30'
                              : 'border-surface-200 hover:border-surface-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-surface-500">
                                {order?.orderNumber || '未知订单'}
                              </span>
                              {statusLabel(credit.status)}
                            </div>
                            <span className="text-xs text-surface-400">
                              {format(new Date(credit.createdAt), 'yyyy-MM-dd')}
                            </span>
                          </div>

                          {order && (
                            <div className="mb-2 bg-white rounded-lg p-2 border border-surface-100">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex justify-between text-xs text-surface-600 py-0.5">
                                  <span>{item.productName} × {item.quantity}</span>
                                  <span className="font-mono">¥{item.subtotal.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-surface-100">
                            <div className="flex items-center gap-4 text-xs">
                              <span className="text-surface-500">
                                总额:{' '}
                                <span className="font-mono font-medium text-surface-900">
                                  ¥{credit.amount.toFixed(2)}
                                </span>
                              </span>
                              <span className="text-surface-500">
                                已付:{' '}
                                <span className="font-mono font-medium text-primary-600">
                                  ¥{credit.paidAmount.toFixed(2)}
                                </span>
                              </span>
                              <span className="text-surface-500">
                                剩余:{' '}
                                <span
                                  className={`font-mono font-bold ${
                                    remaining > 0 ? 'text-red-600' : 'text-primary-600'
                                  }`}
                                >
                                  ¥{remaining.toFixed(2)}
                                </span>
                              </span>
                            </div>
                            {credit.status !== 'paid' && (
                              <button
                                onClick={() => {
                                  setShowPayment(credit.id);
                                  setPaymentAmount(remaining.toFixed(2));
                                }}
                                className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors shadow-sm"
                              >
                                {credit.status === 'partial' ? '继续还款' : '还款'}
                              </button>
                            )}
                          </div>
                          <div className="mt-3">
                            <div className="w-full bg-surface-100 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  credit.status === 'paid' ? 'bg-primary-500' : 'bg-primary-400'
                                }`}
                                style={{ width: `${Math.min(100, progress)}%` }}
                              />
                            </div>
                            <p className="text-xs text-surface-400 mt-1 text-right">
                              还款进度: {progress.toFixed(0)}%
                              {credit.expectedPayDate && (
                                <span className="ml-2">
                                  · 预计还款: {format(new Date(credit.expectedPayDate), 'yyyy-MM-dd')}
                                </span>
                              )}
                            </p>
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
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowAddFarmer(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-surface-900">{editingFarmerId ? '编辑农户档案' : '新增农户'}</h2>
              <button
                onClick={() => { setShowAddFarmer(false); setEditingFarmerId(null); }}
                className="p-1 rounded-md hover:bg-surface-100 text-surface-400"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddFarmer} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1">
                  姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={farmerForm.name}
                  onChange={(e) => setFarmerForm({ ...farmerForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1">
                  电话 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={farmerForm.phone}
                  onChange={(e) => setFarmerForm({ ...farmerForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1">地址</label>
                <input
                  type="text"
                  value={farmerForm.address}
                  onChange={(e) => setFarmerForm({ ...farmerForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1">身份证号</label>
                <input
                  type="text"
                  value={farmerForm.idCard}
                  onChange={(e) => setFarmerForm({ ...farmerForm, idCard: e.target.value })}
                  maxLength={18}
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-surface-600 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-gold-500" />
                    信用等级评判
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'A', label: 'A级', desc: '信用良好', color: 'primary' },
                    { value: 'B', label: 'B级', desc: '信用一般', color: 'gold' },
                    { value: 'C', label: 'C级', desc: '信用较差', color: 'red' },
                  ].map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setFarmerForm({ ...farmerForm, creditRating: level.value as 'A' | 'B' | 'C' })}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        farmerForm.creditRating === level.value
                          ? level.color === 'primary'
                            ? 'border-primary-500 bg-primary-50'
                            : level.color === 'gold'
                            ? 'border-gold-500 bg-gold-50'
                            : 'border-red-500 bg-red-50'
                          : 'border-surface-200 bg-white hover:border-surface-300'
                      }`}
                    >
                      <p
                        className={`text-lg font-bold ${
                          farmerForm.creditRating === level.value
                            ? level.color === 'primary'
                              ? 'text-primary-600'
                              : level.color === 'gold'
                              ? 'text-gold-600'
                              : 'text-red-600'
                            : 'text-surface-600'
                        }`}
                      >
                        {level.label}
                      </p>
                      <p className="text-xs text-surface-500 mt-0.5">{level.desc}</p>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-surface-400 mt-2">
                  提示：A级可赊账额度高，B级需审核，C级限制赊账
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddFarmer(false); setEditingFarmerId(null); }}
                  className="px-4 py-2 border border-surface-300 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                >
                  {editingFarmerId ? '保存修改' : '确认添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPayment && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowPayment(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary-600" />
              还款操作
            </h2>
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1">还款金额(元)</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                min="0.01"
                step="0.01"
                autoFocus
                className="w-full px-3 py-2.5 border border-surface-200 rounded-lg text-sm font-mono text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <p className="text-xs text-surface-400 mt-2">输入还款金额，可部分还款或全额结清</p>
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowPayment(null)}
                className="px-4 py-2 border border-surface-300 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-50"
              >
                取消
              </button>
              <button
                onClick={handlePayment}
                disabled={!paymentAmount || Number(paymentAmount) <= 0}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                确认还款
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
