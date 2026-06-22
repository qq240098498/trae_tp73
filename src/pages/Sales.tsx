import { useState, useMemo, useEffect } from 'react';
import { useStore } from '@/store';
import type { SaleItem } from '@/types';
import { Search, ShoppingCart, Ban, X, CreditCard, Banknote, ShieldAlert, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

interface CartItem extends SaleItem {
  maxQty: number;
  productType: 'seed' | 'chemical';
  productId: string;
  isPesticide: boolean;
  isRestricted: boolean;
  isExpired: boolean;
}

const purposeOptions = ['病虫害防治', '除草', '杀菌', '杀虫', '调节生长', '其他'];

export default function Sales() {
  const { seeds, chemicals, farmers, createSale, settings } = useStore();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit'>('cash');
  const [selectedFarmerId, setSelectedFarmerId] = useState('');
  const [showRegistration, setShowRegistration] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastOrderNumber, setLastOrderNumber] = useState('');
  const [fromFarmer, setFromFarmer] = useState(false);

  const [regForm, setRegForm] = useState({ buyerName: '', idCard: '', phone: '', purpose: '' });

  useEffect(() => {
    const farmerId = searchParams.get('farmerId');
    const source = searchParams.get('source');
    if (farmerId && farmers.some((f) => f.id === farmerId)) {
      setSelectedFarmerId(farmerId);
      setPaymentMethod('credit');
      if (source === 'credit' || source === 'collection') {
        setFromFarmer(true);
      }
    }
  }, [searchParams, farmers]);

  const allProducts = useMemo(() => [
    ...seeds.map((s) => ({ id: s.id, name: `${s.name} ${s.variety}`, price: s.sellingPrice, stock: s.stockQuantity, type: 'seed' as const, isPesticide: false, isRestricted: false, isExpired: s.status === 'expired', status: s.status })),
    ...chemicals.map((c) => ({ id: c.id, name: c.name, price: c.sellingPrice, stock: c.stockQuantity, type: 'chemical' as const, isPesticide: c.type === 'pesticide', isRestricted: c.isRestricted, isExpired: c.status === 'expired', status: c.status })),
  ], [seeds, chemicals]);

  const searchResults = search.trim()
    ? allProducts.filter((p) => p.name.includes(search) && p.stock > 0)
    : [];

  const addToCart = (product: typeof allProducts[0]) => {
    if (product.isExpired) return;
    const existing = cart.find((c) => c.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) return;
      setCart(cart.map((c) => c.id === existing.id ? { ...c, quantity: c.quantity + 1, subtotal: (c.quantity + 1) * c.unitPrice } : c));
    } else {
      const item: CartItem = {
        id: `cart-${Date.now()}-${product.id}`,
        productType: product.type,
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.price,
        subtotal: product.price,
        maxQty: product.stock,
        isPesticide: product.isPesticide,
        isRestricted: product.isRestricted,
        isExpired: product.isExpired,
      };
      setCart([...cart, item]);
    }
    setSearch('');
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart(cart.filter((c) => c.id !== id));
    } else {
      setCart(cart.map((c) => c.id === id ? { ...c, quantity: qty, subtotal: qty * c.unitPrice } : c));
    }
  };

  const totalAmount = cart.reduce((sum, c) => sum + c.subtotal, 0);
  const hasPesticide = cart.some((c) => c.isPesticide);
  const hasRestricted = cart.some((c) => c.isRestricted);
  const needsRegistration = hasPesticide || hasRestricted;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (needsRegistration && !showRegistration) {
      setShowRegistration(true);
      return;
    }

    const items = cart.map((c) => ({
      productType: c.productType,
      productId: c.productId,
      productName: c.productName,
      quantity: c.quantity,
      unitPrice: c.unitPrice,
      subtotal: c.subtotal,
    }));

    const registration = needsRegistration
      ? {
          buyerName: regForm.buyerName,
          idCard: regForm.idCard,
          phone: regForm.phone,
          purpose: regForm.purpose,
          chemicalName: cart.filter((c) => c.isPesticide || c.isRestricted).map((c) => c.productName).join('、'),
          quantity: cart.filter((c) => c.isPesticide || c.isRestricted).reduce((sum, c) => sum + c.quantity, 0),
        }
      : undefined;

    const order = createSale({
      items,
      paymentMethod,
      farmerId: paymentMethod === 'credit' ? selectedFarmerId : undefined,
      registration,
    });

    setLastOrderNumber(order.orderNumber);
    setShowSuccess(true);
    setCart([]);
    setShowRegistration(false);
    setRegForm({ buyerName: '', idCard: '', phone: '', purpose: '' });
  };

  const validateIdCard = (id: string) => {
    const reg = /^\d{17}[\dXx]$/;
    return reg.test(id);
  };

  return (
    <div className="p-6 space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {fromFarmer && (
            <Link
              to={searchParams.get('source') === 'collection' ? '/collection' : '/credit'}
              className="p-2 rounded-lg border border-surface-200 text-surface-600 hover:bg-surface-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )}
          <div>
            <h1 className="text-2xl font-bold text-surface-900">
              销售出库
              {fromFarmer && selectedFarmerId && (
                <span className="ml-3 text-sm font-normal text-gold-600 bg-gold-50 px-2 py-1 rounded">
                  赊账给 {farmers.find((f) => f.id === selectedFarmerId)?.name}
                </span>
              )}
            </h1>
            <p className="text-sm text-surface-500 mt-1">搜索商品、加入购物车、选择结算方式完成出库</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-5 gap-4 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="搜索商品名称..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {search.trim() && (
            <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
              {searchResults.length === 0 ? (
                <div className="p-6 text-center text-surface-400 text-sm">未找到匹配商品</div>
              ) : (
                <div className="divide-y divide-surface-100 max-h-64 overflow-y-auto">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      className={`flex items-center justify-between px-4 py-3 hover:bg-surface-50 transition-colors ${product.isExpired ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      onClick={() => !product.isExpired && addToCart(product)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${product.type === 'seed' ? 'bg-primary-50 text-primary-600' : 'bg-purple-50 text-purple-600'}`}>
                          {product.type === 'seed' ? '种' : product.isPesticide ? '药' : '肥'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-surface-900">{product.name}</p>
                          <p className="text-xs text-surface-500">库存: {product.stock}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {product.isExpired && <span className="text-xs text-red-500 font-medium flex items-center gap-1"><Ban className="w-3 h-3" />已禁售</span>}
                        {product.isRestricted && <span className="text-xs px-1.5 py-0.5 bg-red-50 text-red-600 rounded font-medium flex items-center gap-1"><ShieldAlert className="w-3 h-3" />禁限用</span>}
                        <span className="text-sm font-mono font-bold text-primary-600">¥{product.price.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex-1 bg-white rounded-xl border border-surface-200 p-4 shadow-sm overflow-y-auto">
            <h3 className="text-sm font-semibold text-surface-700 mb-3 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              购物车 ({cart.length}件)
            </h3>
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-surface-400">
                <ShoppingCart className="w-12 h-12 mb-2 opacity-30" />
                <p className="text-sm">搜索并添加商品到购物车</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-3 py-2.5 bg-surface-50 rounded-lg">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold shrink-0 ${item.productType === 'seed' ? 'bg-primary-100 text-primary-600' : 'bg-purple-100 text-purple-600'}`}>
                        {item.productType === 'seed' ? '种' : '药'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-surface-900 truncate">{item.productName}</p>
                        <p className="text-xs text-surface-500">¥{item.unitPrice.toFixed(2)}/{item.productType === 'seed' ? '袋' : '单位'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded border border-surface-300 flex items-center justify-center text-surface-500 hover:bg-surface-100 text-xs">-</button>
                        <span className="w-8 text-center text-sm font-mono font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded border border-surface-300 flex items-center justify-center text-surface-500 hover:bg-surface-100 text-xs">+</button>
                      </div>
                      <span className="text-sm font-mono font-bold text-primary-600 w-16 text-right">¥{item.subtotal.toFixed(2)}</span>
                      <button onClick={() => updateQuantity(item.id, 0)} className="p-1 rounded text-surface-400 hover:text-red-500 hover:bg-red-50">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-span-2 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-surface-700 mb-4">结算方式</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${paymentMethod === 'cash' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-surface-200 text-surface-600 hover:border-surface-300'}`}
              >
                <Banknote className="w-4 h-4" />
                现金结算
              </button>
              <button
                onClick={() => setPaymentMethod('credit')}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${paymentMethod === 'credit' ? 'border-gold-500 bg-gold-50 text-gold-700' : 'border-surface-200 text-surface-600 hover:border-surface-300'}`}
              >
                <CreditCard className="w-4 h-4" />
                赊账挂账
              </button>
            </div>

            {paymentMethod === 'credit' && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-surface-600 mb-1">选择农户</label>
                <select
                  value={selectedFarmerId}
                  onChange={(e) => setSelectedFarmerId(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">请选择农户</option>
                  {farmers.map((f) => (
                    <option key={f.id} value={f.id}>{f.name} - {f.phone} (欠款: ¥{f.totalDebt.toFixed(2)})</option>
                  ))}
                </select>
              </div>
            )}

            {needsRegistration && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-700 font-medium flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {hasRestricted ? '含禁限用农药，必须实名登记' : '含农药，需登记购买人信息'}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm flex-1">
            <h3 className="text-sm font-semibold text-surface-700 mb-3">订单汇总</h3>
            <div className="space-y-2 mb-4">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-xs text-surface-600">
                  <span className="truncate flex-1 mr-2">{item.productName} x{item.quantity}</span>
                  <span className="font-mono">¥{item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-surface-200 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-surface-700">合计</span>
                <span className="text-2xl font-bold font-mono text-primary-600">¥{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || (paymentMethod === 'credit' && !selectedFarmerId)}
            className="w-full py-3 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/20"
          >
            {needsRegistration && !showRegistration ? '填写实名登记' : `确认结算 ¥${totalAmount.toFixed(2)}`}
          </button>
        </div>
      </div>

      {showRegistration && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowRegistration(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                农药实名登记
              </h2>
              <button onClick={() => setShowRegistration(false)} className="p-1 rounded-md hover:bg-surface-100 text-surface-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1">购买人姓名 <span className="text-red-500">*</span></label>
                <input type="text" value={regForm.buyerName} onChange={(e) => setRegForm({ ...regForm, buyerName: e.target.value })} className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1">身份证号 <span className="text-red-500">*</span></label>
                <input type="text" value={regForm.idCard} onChange={(e) => setRegForm({ ...regForm, idCard: e.target.value })} maxLength={18} className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500" />
                {regForm.idCard && !validateIdCard(regForm.idCard) && <p className="text-xs text-red-500 mt-1">请输入正确的18位身份证号</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1">联系电话 <span className="text-red-500">*</span></label>
                <input type="text" value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1">购买用途 <span className="text-red-500">*</span></label>
                <select value={regForm.purpose} onChange={(e) => setRegForm({ ...regForm, purpose: e.target.value })} className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">请选择用途</option>
                  {purposeOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setShowRegistration(false)} className="px-4 py-2 border border-surface-300 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-50">取消</button>
              <button
                onClick={handleCheckout}
                disabled={!regForm.buyerName || !validateIdCard(regForm.idCard) || !regForm.phone || !regForm.purpose}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认登记并结算
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-8 text-center">
            <CheckCircle className="w-16 h-16 text-primary-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-surface-900 mb-2">销售成功!</h2>
            <p className="text-sm text-surface-500 mb-1">订单号: <span className="font-mono font-medium text-surface-700">{lastOrderNumber}</span></p>
            <p className="text-2xl font-bold font-mono text-primary-600 mt-3">¥{totalAmount.toFixed(2)}</p>
            <button onClick={() => setShowSuccess(false)} className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
              完成
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
