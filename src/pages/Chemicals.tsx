import { useState } from 'react';
import { useStore } from '@/store';
import type { Chemical } from '@/types';
import { Plus, Search, Edit2, Trash2, AlertTriangle, Ban, ShieldAlert, X } from 'lucide-react';

const emptyForm = {
  name: '',
  brand: '',
  type: 'fertilizer' as 'fertilizer' | 'pesticide',
  content: '',
  dosageForm: '',
  registrationNumber: '',
  expiryDate: '',
  stockQuantity: 0,
  purchasePrice: 0,
  sellingPrice: 0,
  isRestricted: false,
};

export default function Chemicals() {
  const { chemicals, addChemical, updateChemical, deleteChemical, settings } = useStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = chemicals.filter((c) => {
    const matchSearch = c.name.includes(search) || c.brand.includes(search) || c.registrationNumber.includes(search);
    const matchType = typeFilter === 'all' || c.type === typeFilter;
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (chem: Chemical) => {
    setEditingId(chem.id);
    setForm({
      name: chem.name,
      brand: chem.brand,
      type: chem.type,
      content: chem.content,
      dosageForm: chem.dosageForm,
      registrationNumber: chem.registrationNumber,
      expiryDate: chem.expiryDate,
      stockQuantity: chem.stockQuantity,
      purchasePrice: chem.purchasePrice,
      sellingPrice: chem.sellingPrice,
      isRestricted: chem.isRestricted,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateChemical(editingId, form);
    } else {
      addChemical(form);
    }
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定删除该商品记录吗？')) {
      deleteChemical(id);
    }
  };

  const statusBadge = (status: Chemical['status']) => {
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
          <h1 className="text-2xl font-bold text-surface-900">化肥农药库存管理</h1>
          <p className="text-sm text-surface-500 mt-1">管理化肥农药品牌、含量、剂型、登记证号及有效期</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          新增商品
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="搜索商品名、品牌、登记证号..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="all">全部类型</option>
          <option value="fertilizer">化肥</option>
          <option value="pesticide">农药</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
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
                <th className="text-left px-4 py-3 font-semibold text-surface-600">商品名称</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600">品牌</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600">类型</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600">含量</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600">剂型</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600">登记证号</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600">有效期</th>
                <th className="text-right px-4 py-3 font-semibold text-surface-600">库存</th>
                <th className="text-right px-4 py-3 font-semibold text-surface-600">售价</th>
                <th className="text-center px-4 py-3 font-semibold text-surface-600">禁限用</th>
                <th className="text-center px-4 py-3 font-semibold text-surface-600">状态</th>
                <th className="text-center px-4 py-3 font-semibold text-surface-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map((chem) => (
                <tr key={chem.id} className={`hover:bg-surface-50 transition-colors ${chem.status === 'expired' ? 'bg-red-50/50' : chem.status === 'warning' ? 'bg-gold-50/50' : ''}`}>
                  <td className="px-4 py-3 font-medium text-surface-900">{chem.name}</td>
                  <td className="px-4 py-3 text-surface-600">{chem.brand}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${chem.type === 'pesticide' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                      {chem.type === 'pesticide' ? '农药' : '化肥'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-surface-600">{chem.content}</td>
                  <td className="px-4 py-3 text-surface-600">{chem.dosageForm}</td>
                  <td className="px-4 py-3 text-surface-600 font-mono text-xs">{chem.registrationNumber}</td>
                  <td className="px-4 py-3 text-surface-600 font-mono text-xs">{chem.expiryDate}</td>
                  <td className="px-4 py-3 text-right font-mono text-surface-900">{chem.stockQuantity}</td>
                  <td className="px-4 py-3 text-right font-mono text-surface-900">¥{chem.sellingPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    {chem.isRestricted && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-medium">
                        <ShieldAlert className="w-3 h-3" />
                        禁限用
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">{statusBadge(chem.status)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(chem)} className="p-1.5 rounded-md hover:bg-surface-100 text-surface-500 hover:text-primary-600 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(chem.id)} className="p-1.5 rounded-md hover:bg-red-50 text-surface-500 hover:text-red-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-surface-400">暂无数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-surface-900">{editingId ? '编辑商品' : '新增商品'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-md hover:bg-surface-100 text-surface-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="商品名称" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                <Field label="品牌" required value={form.brand} onChange={(v) => setForm({ ...form, brand: v })} />
                <div>
                  <label className="block text-xs font-medium text-surface-600 mb-1">类型 <span className="text-red-500">*</span></label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'fertilizer' | 'pesticide' })} className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="fertilizer">化肥</option>
                    <option value="pesticide">农药</option>
                  </select>
                </div>
                <Field label="含量" required value={form.content} onChange={(v) => setForm({ ...form, content: v })} />
                <Field label="剂型" required value={form.dosageForm} onChange={(v) => setForm({ ...form, dosageForm: v })} />
                <Field label="登记证号" required value={form.registrationNumber} onChange={(v) => setForm({ ...form, registrationNumber: v })} />
                <Field label="有效期" required type="date" value={form.expiryDate} onChange={(v) => setForm({ ...form, expiryDate: v })} />
                <Field label="库存数量" required type="number" value={String(form.stockQuantity)} onChange={(v) => setForm({ ...form, stockQuantity: Number(v) })} />
                <Field label="进价(元)" required type="number" value={String(form.purchasePrice)} onChange={(v) => setForm({ ...form, purchasePrice: Number(v) })} />
                <Field label="售价(元)" required type="number" value={String(form.sellingPrice)} onChange={(v) => setForm({ ...form, sellingPrice: Number(v) })} />
                <div className="flex items-center gap-2 col-span-2">
                  <input type="checkbox" id="isRestricted" checked={form.isRestricted} onChange={(e) => setForm({ ...form, isRestricted: e.target.checked })} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                  <label htmlFor="isRestricted" className="text-sm text-surface-700">标记为禁限用农药（销售时强制实名登记）</label>
                </div>
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

function Field({ label, required, value, onChange, type = 'text' }: { label: string; required?: boolean; value: string; onChange: (v: string) => void; type?: string }) {
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
