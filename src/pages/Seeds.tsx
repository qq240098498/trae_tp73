import { useState } from 'react';
import { useStore } from '@/store';
import type { Seed } from '@/types';
import { Plus, Search, Edit2, Trash2, AlertTriangle, Ban, X } from 'lucide-react';

const emptyForm = {
  name: '',
  variety: '',
  specification: '',
  origin: '',
  expiryDate: '',
  batchNumber: '',
  stockQuantity: 0,
  purchasePrice: 0,
  sellingPrice: 0,
};

export default function Seeds() {
  const { seeds, addSeed, updateSeed, deleteSeed, settings } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = seeds.filter((s) => {
    const matchSearch = s.name.includes(search) || s.variety.includes(search) || s.batchNumber.includes(search) || s.origin.includes(search);
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (seed: Seed) => {
    setEditingId(seed.id);
    setForm({
      name: seed.name,
      variety: seed.variety,
      specification: seed.specification,
      origin: seed.origin,
      expiryDate: seed.expiryDate,
      batchNumber: seed.batchNumber,
      stockQuantity: seed.stockQuantity,
      purchasePrice: seed.purchasePrice,
      sellingPrice: seed.sellingPrice,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateSeed(editingId, form);
    } else {
      addSeed(form);
    }
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定删除该种子记录吗？')) {
      deleteSeed(id);
    }
  };

  const statusBadge = (status: Seed['status']) => {
    const map = {
      normal: 'bg-primary-50 text-primary-700 border-primary-200',
      warning: 'bg-gold-50 text-gold-700 border-gold-200',
      expired: 'bg-red-50 text-red-700 border-red-200',
    };
    const labelMap = { normal: '正常', warning: '临期', expired: '已过期' };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${map[status]}`}>
        {status === 'expired' && <Ban className="w-3 h-3" />}
        {status === 'warning' && <AlertTriangle className="w-3 h-3" />}
        {labelMap[status]}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">种子库存管理</h1>
          <p className="text-sm text-surface-500 mt-1">管理种子品种、规格、产地、保质期和批号</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          新增种子
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="搜索品种、产地、批号..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">全部状态</option>
          <option value="normal">正常</option>
          <option value="warning">临期</option>
          <option value="expired">已过期</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200">
                <th className="text-left px-4 py-3 font-semibold text-surface-600">品种名称</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600">品种</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600">规格</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600">产地</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600">保质期</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600">批号</th>
                <th className="text-right px-4 py-3 font-semibold text-surface-600">库存</th>
                <th className="text-right px-4 py-3 font-semibold text-surface-600">进价</th>
                <th className="text-right px-4 py-3 font-semibold text-surface-600">售价</th>
                <th className="text-center px-4 py-3 font-semibold text-surface-600">状态</th>
                <th className="text-center px-4 py-3 font-semibold text-surface-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map((seed) => (
                <tr key={seed.id} className={`hover:bg-surface-50 transition-colors ${seed.status === 'expired' ? 'bg-red-50/50' : seed.status === 'warning' ? 'bg-gold-50/50' : ''}`}>
                  <td className="px-4 py-3 font-medium text-surface-900">{seed.name}</td>
                  <td className="px-4 py-3 text-surface-600">{seed.variety}</td>
                  <td className="px-4 py-3 text-surface-600">{seed.specification}</td>
                  <td className="px-4 py-3 text-surface-600">{seed.origin}</td>
                  <td className="px-4 py-3 text-surface-600 font-mono text-xs">{seed.expiryDate}</td>
                  <td className="px-4 py-3 text-surface-600 font-mono text-xs">{seed.batchNumber}</td>
                  <td className="px-4 py-3 text-right font-mono text-surface-900">{seed.stockQuantity}</td>
                  <td className="px-4 py-3 text-right font-mono text-surface-600">¥{seed.purchasePrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono text-surface-900">¥{seed.sellingPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">{statusBadge(seed.status)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(seed)} className="p-1.5 rounded-md hover:bg-surface-100 text-surface-500 hover:text-primary-600 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(seed.id)} className="p-1.5 rounded-md hover:bg-red-50 text-surface-500 hover:text-red-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-surface-400">暂无数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-surface-900">{editingId ? '编辑种子' : '新增种子'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-md hover:bg-surface-100 text-surface-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="品种名称" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                <FormField label="品种" required value={form.variety} onChange={(v) => setForm({ ...form, variety: v })} />
                <FormField label="规格" required value={form.specification} onChange={(v) => setForm({ ...form, specification: v })} />
                <FormField label="产地" required value={form.origin} onChange={(v) => setForm({ ...form, origin: v })} />
                <FormField label="保质期" required type="date" value={form.expiryDate} onChange={(v) => setForm({ ...form, expiryDate: v })} />
                <FormField label="批号" required value={form.batchNumber} onChange={(v) => setForm({ ...form, batchNumber: v })} />
                <FormField label="库存数量" required type="number" value={String(form.stockQuantity)} onChange={(v) => setForm({ ...form, stockQuantity: Number(v) })} />
                <FormField label="进价(元)" required type="number" value={String(form.purchasePrice)} onChange={(v) => setForm({ ...form, purchasePrice: Number(v) })} />
                <FormField label="售价(元)" required type="number" value={String(form.sellingPrice)} onChange={(v) => setForm({ ...form, sellingPrice: Number(v) })} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-surface-300 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-50">取消</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">{editingId ? '保存修改' : '确认添加'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, required, value, onChange, type = 'text' }: { label: string; required?: boolean; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-surface-600 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
    </div>
  );
}
