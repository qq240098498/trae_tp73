import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Seed, Chemical, Farmer, SaleOrder, SaleItem, CreditRecord, PesticideRegistration, AppSettings } from '@/types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function generateOrderNumber(): string {
  const now = new Date();
  const prefix = 'NZ';
  const date = now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, '0') + now.getDate().toString().padStart(2, '0');
  const seq = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return prefix + date + seq;
}

function computeStatus(expiryDate: string, warningDays: number): 'normal' | 'warning' | 'expired' {
  const now = new Date();
  const exp = new Date(expiryDate);
  const diff = exp.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (daysRemaining <= 0) return 'expired';
  if (daysRemaining <= warningDays) return 'warning';
  return 'normal';
}

const mockSeeds: Seed[] = [
  {
    id: 'seed-001',
    name: '杂交水稻种',
    variety: 'Y两优900',
    specification: '1kg/袋',
    origin: '湖南长沙',
    expiryDate: '2026-12-31',
    batchNumber: 'HN2025-001',
    stockQuantity: 200,
    purchasePrice: 35,
    sellingPrice: 48,
    status: 'normal',
    createdAt: '2025-03-15T08:00:00.000Z',
    updatedAt: '2025-03-15T08:00:00.000Z',
  },
  {
    id: 'seed-002',
    name: '玉米种子',
    variety: '郑单958',
    specification: '2kg/袋',
    origin: '河南郑州',
    expiryDate: '2026-06-15',
    batchNumber: 'HN2025-002',
    stockQuantity: 150,
    purchasePrice: 28,
    sellingPrice: 40,
    status: 'warning',
    createdAt: '2025-04-01T08:00:00.000Z',
    updatedAt: '2025-04-01T08:00:00.000Z',
  },
  {
    id: 'seed-003',
    name: '小麦种子',
    variety: '百农207',
    specification: '5kg/袋',
    origin: '河北邯郸',
    expiryDate: '2025-09-30',
    batchNumber: 'HB2025-001',
    stockQuantity: 80,
    purchasePrice: 15,
    sellingPrice: 22,
    status: 'expired',
    createdAt: '2025-01-10T08:00:00.000Z',
    updatedAt: '2025-01-10T08:00:00.000Z',
  },
  {
    id: 'seed-004',
    name: '棉花种子',
    variety: '中棉所49',
    specification: '0.5kg/袋',
    origin: '山东聊城',
    expiryDate: '2027-03-01',
    batchNumber: 'SD2025-001',
    stockQuantity: 120,
    purchasePrice: 45,
    sellingPrice: 62,
    status: 'normal',
    createdAt: '2025-05-20T08:00:00.000Z',
    updatedAt: '2025-05-20T08:00:00.000Z',
  },
];

const mockChemicals: Chemical[] = [
  {
    id: 'chem-001',
    name: '草甘膦异丙胺盐水剂',
    brand: '农达',
    type: 'pesticide',
    content: '41%',
    dosageForm: '水剂',
    registrationNumber: 'PD20081234',
    expiryDate: '2027-06-30',
    stockQuantity: 300,
    purchasePrice: 12,
    sellingPrice: 18,
    isRestricted: false,
    status: 'normal',
    createdAt: '2025-02-10T08:00:00.000Z',
    updatedAt: '2025-02-10T08:00:00.000Z',
  },
  {
    id: 'chem-002',
    name: '百草枯可溶胶剂',
    brand: '克无踪',
    type: 'pesticide',
    content: '20%',
    dosageForm: '可溶胶剂',
    registrationNumber: 'PD20100012',
    expiryDate: '2025-07-15',
    stockQuantity: 50,
    purchasePrice: 25,
    sellingPrice: 38,
    isRestricted: true,
    status: 'expired',
    createdAt: '2025-01-05T08:00:00.000Z',
    updatedAt: '2025-01-05T08:00:00.000Z',
  },
  {
    id: 'chem-003',
    name: '尿素',
    brand: '心连心',
    type: 'fertilizer',
    content: '46%',
    dosageForm: '颗粒',
    registrationNumber: '辽农肥(2023)准字001',
    expiryDate: '2028-12-31',
    stockQuantity: 5000,
    purchasePrice: 1.8,
    sellingPrice: 2.5,
    isRestricted: false,
    status: 'normal',
    createdAt: '2025-03-01T08:00:00.000Z',
    updatedAt: '2025-03-01T08:00:00.000Z',
  },
  {
    id: 'chem-004',
    name: '毒死蜱乳油',
    brand: '乐斯本',
    type: 'pesticide',
    content: '40.7%',
    dosageForm: '乳油',
    registrationNumber: 'PD20097003',
    expiryDate: '2026-10-01',
    stockQuantity: 100,
    purchasePrice: 22,
    sellingPrice: 35,
    isRestricted: true,
    status: 'normal',
    createdAt: '2025-04-15T08:00:00.000Z',
    updatedAt: '2025-04-15T08:00:00.000Z',
  },
  {
    id: 'chem-005',
    name: '复合肥',
    brand: '史丹利',
    type: 'fertilizer',
    content: '15-15-15',
    dosageForm: '颗粒',
    registrationNumber: '鲁农肥(2024)准字008',
    expiryDate: '2027-09-30',
    stockQuantity: 3000,
    purchasePrice: 2.2,
    sellingPrice: 3.2,
    isRestricted: false,
    status: 'normal',
    createdAt: '2025-05-01T08:00:00.000Z',
    updatedAt: '2025-05-01T08:00:00.000Z',
  },
];

const mockFarmers: Farmer[] = [
  { id: 'farmer-001', name: '张三', phone: '13812345678', address: '东阳村3组', idCard: '330724197001011234', totalDebt: 1250, creditRating: 'A', createdAt: '2025-01-01T08:00:00.000Z' },
  { id: 'farmer-002', name: '李四', phone: '13987654321', address: '西平村5组', idCard: '330724197505052345', totalDebt: 560, creditRating: 'B', createdAt: '2025-02-15T08:00:00.000Z' },
  { id: 'farmer-003', name: '王五', phone: '15012349876', address: '南阳村1组', idCard: '330724198203033456', totalDebt: 0, creditRating: 'A', createdAt: '2025-03-20T08:00:00.000Z' },
];

const mockSaleOrders: SaleOrder[] = [
  {
    id: 'order-001',
    orderNumber: 'NZ20250601001',
    saleDate: '2025-06-01T09:30:00.000Z',
    items: [
      { id: 'si-001', productType: 'seed', productId: 'seed-001', productName: '杂交水稻种 Y两优900', quantity: 5, unitPrice: 48, subtotal: 240 },
      { id: 'si-002', productType: 'chemical', productId: 'chem-003', productName: '尿素', quantity: 200, unitPrice: 2.5, subtotal: 500 },
    ],
    totalAmount: 740,
    paymentMethod: 'cash',
    status: 'completed',
    createdAt: '2025-06-01T09:30:00.000Z',
  },
  {
    id: 'order-002',
    orderNumber: 'NZ20250605002',
    saleDate: '2025-06-05T14:20:00.000Z',
    items: [
      { id: 'si-003', productType: 'chemical', productId: 'chem-004', productName: '毒死蜱乳油', quantity: 3, unitPrice: 35, subtotal: 105 },
      { id: 'si-004', productType: 'chemical', productId: 'chem-005', productName: '复合肥', quantity: 500, unitPrice: 3.2, subtotal: 1600 },
    ],
    totalAmount: 1705,
    paymentMethod: 'credit',
    farmerId: 'farmer-001',
    status: 'credited',
    createdAt: '2025-06-05T14:20:00.000Z',
  },
  {
    id: 'order-003',
    orderNumber: 'NZ20250610003',
    saleDate: '2025-06-10T10:15:00.000Z',
    items: [
      { id: 'si-005', productType: 'seed', productId: 'seed-002', productName: '玉米种子 郑单958', quantity: 10, unitPrice: 40, subtotal: 400 },
    ],
    totalAmount: 400,
    paymentMethod: 'credit',
    farmerId: 'farmer-002',
    status: 'credited',
    createdAt: '2025-06-10T10:15:00.000Z',
  },
];

const mockCreditRecords: CreditRecord[] = [
  { id: 'credit-001', farmerId: 'farmer-001', orderId: 'order-002', amount: 1705, paidAmount: 455, status: 'partial', expectedPayDate: '2025-10-15', createdAt: '2025-06-05T14:20:00.000Z' },
  { id: 'credit-002', farmerId: 'farmer-002', orderId: 'order-003', amount: 400, paidAmount: 0, status: 'unpaid', expectedPayDate: '2025-10-15', createdAt: '2025-06-10T10:15:00.000Z' },
];

const mockRegistrations: PesticideRegistration[] = [
  { id: 'reg-001', orderId: 'order-002', buyerName: '张三', idCard: '330724197001011234', phone: '13812345678', purpose: '病虫害防治', chemicalName: '毒死蜱乳油', quantity: 3, registrationDate: '2025-06-05T14:20:00.000Z' },
];

interface StoreState {
  seeds: Seed[];
  chemicals: Chemical[];
  farmers: Farmer[];
  saleOrders: SaleOrder[];
  creditRecords: CreditRecord[];
  pesticideRegistrations: PesticideRegistration[];
  settings: AppSettings;

  addSeed: (seed: Omit<Seed, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => void;
  updateSeed: (id: string, data: Partial<Seed>) => void;
  deleteSeed: (id: string) => void;

  addChemical: (chemical: Omit<Chemical, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => void;
  updateChemical: (id: string, data: Partial<Chemical>) => void;
  deleteChemical: (id: string) => void;

  addFarmer: (farmer: Omit<Farmer, 'id' | 'totalDebt' | 'createdAt'>) => void;
  updateFarmer: (id: string, data: Partial<Farmer>) => void;

  createSale: (order: { items: Omit<SaleItem, 'id'>[]; paymentMethod: 'cash' | 'credit'; farmerId?: string; registration?: Omit<PesticideRegistration, 'id' | 'orderId' | 'registrationDate'> }) => SaleOrder;
  addCreditPayment: (creditId: string, amount: number) => void;

  addPesticideRegistration: (reg: Omit<PesticideRegistration, 'id' | 'registrationDate'>) => void;

  updateSettings: (settings: Partial<AppSettings>) => void;
  refreshStatuses: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      seeds: mockSeeds,
      chemicals: mockChemicals,
      farmers: mockFarmers,
      saleOrders: mockSaleOrders,
      creditRecords: mockCreditRecords,
      pesticideRegistrations: mockRegistrations,
      settings: {
        warningDays: 30,
        autoBanExpired: true,
        restrictedPesticides: ['百草枯', '毒死蜱', '甲胺磷', '对硫磷', '甲基对硫磷'],
      },

      addSeed: (seed) => {
        const now = new Date().toISOString();
        const status = computeStatus(seed.expiryDate, get().settings.warningDays);
        const newSeed: Seed = { ...seed, id: generateId(), status, createdAt: now, updatedAt: now };
        set((state) => ({ seeds: [...state.seeds, newSeed] }));
      },

      updateSeed: (id, data) => {
        set((state) => ({
          seeds: state.seeds.map((s) =>
            s.id === id
              ? { ...s, ...data, updatedAt: new Date().toISOString(), status: data.expiryDate ? computeStatus(data.expiryDate, state.settings.warningDays) : s.status }
              : s
          ),
        }));
      },

      deleteSeed: (id) => {
        set((state) => ({ seeds: state.seeds.filter((s) => s.id !== id) }));
      },

      addChemical: (chemical) => {
        const now = new Date().toISOString();
        const status = computeStatus(chemical.expiryDate, get().settings.warningDays);
        const newChemical: Chemical = { ...chemical, id: generateId(), status, createdAt: now, updatedAt: now };
        set((state) => ({ chemicals: [...state.chemicals, newChemical] }));
      },

      updateChemical: (id, data) => {
        set((state) => ({
          chemicals: state.chemicals.map((c) =>
            c.id === id
              ? { ...c, ...data, updatedAt: new Date().toISOString(), status: data.expiryDate ? computeStatus(data.expiryDate, state.settings.warningDays) : c.status }
              : c
          ),
        }));
      },

      deleteChemical: (id) => {
        set((state) => ({ chemicals: state.chemicals.filter((c) => c.id !== id) }));
      },

      addFarmer: (farmer) => {
        const newFarmer: Farmer = { ...farmer, id: generateId(), totalDebt: 0, createdAt: new Date().toISOString() };
        set((state) => ({ farmers: [...state.farmers, newFarmer] }));
      },

      updateFarmer: (id, data) => {
        set((state) => ({
          farmers: state.farmers.map((f) => (f.id === id ? { ...f, ...data } : f)),
        }));
      },

      createSale: ({ items, paymentMethod, farmerId, registration }) => {
        const now = new Date().toISOString();
        const orderNumber = generateOrderNumber();
        const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
        const saleItems: SaleItem[] = items.map((item) => ({ ...item, id: generateId() }));

        const order: SaleOrder = {
          id: generateId(),
          orderNumber,
          saleDate: now,
          items: saleItems,
          totalAmount,
          paymentMethod,
          farmerId: paymentMethod === 'credit' ? farmerId : undefined,
          status: paymentMethod === 'cash' ? 'completed' : 'credited',
          createdAt: now,
        };

        const updates: Partial<StoreState> = {
          saleOrders: [...get().saleOrders, order],
        };

        for (const item of items) {
          if (item.productType === 'seed') {
            updates.seeds = (updates.seeds || get().seeds).map((s) =>
              s.id === item.productId ? { ...s, stockQuantity: s.stockQuantity - item.quantity } : s
            );
          } else {
            updates.chemicals = (updates.chemicals || get().chemicals).map((c) =>
              c.id === item.productId ? { ...c, stockQuantity: c.stockQuantity - item.quantity } : c
            );
          }
        }

        if (!updates.seeds) updates.seeds = get().seeds;
        if (!updates.chemicals) updates.chemicals = get().chemicals;

        if (paymentMethod === 'credit' && farmerId) {
          const creditRecord: CreditRecord = {
            id: generateId(),
            farmerId,
            orderId: order.id,
            amount: totalAmount,
            paidAmount: 0,
            status: 'unpaid',
            expectedPayDate: new Date(new Date().getFullYear(), 9, 15).toISOString(),
            createdAt: now,
          };
          updates.creditRecords = [...get().creditRecords, creditRecord];
          updates.farmers = get().farmers.map((f) =>
            f.id === farmerId ? { ...f, totalDebt: f.totalDebt + totalAmount } : f
          );
        }

        if (registration) {
          const reg: PesticideRegistration = {
            ...registration,
            id: generateId(),
            orderId: order.id,
            registrationDate: now,
          };
          updates.pesticideRegistrations = [...get().pesticideRegistrations, reg];
        }

        set((state) => ({ ...state, ...updates }));
        return order;
      },

      addCreditPayment: (creditId, amount) => {
        set((state) => {
          const record = state.creditRecords.find((r) => r.id === creditId);
          if (!record) return state;

          const newPaidAmount = record.paidAmount + amount;
          const newStatus: CreditRecord['status'] = newPaidAmount >= record.amount ? 'paid' : 'partial';
          const actualPayDate = newStatus === 'paid' ? new Date().toISOString() : undefined;
          const debtReduction = Math.min(amount, record.amount - record.paidAmount);

          return {
            creditRecords: state.creditRecords.map((r) =>
              r.id === creditId ? { ...r, paidAmount: newPaidAmount, status: newStatus, actualPayDate } : r
            ),
            farmers: state.farmers.map((f) =>
              f.id === record.farmerId ? { ...f, totalDebt: Math.max(0, f.totalDebt - debtReduction) } : f
            ),
          };
        });
      },

      addPesticideRegistration: (reg) => {
        const newReg: PesticideRegistration = { ...reg, id: generateId(), registrationDate: new Date().toISOString() };
        set((state) => ({ pesticideRegistrations: [...state.pesticideRegistrations, newReg] }));
      },

      updateSettings: (newSettings) => {
        set((state) => ({ settings: { ...state.settings, ...newSettings } }));
      },

      refreshStatuses: () => {
        const { settings } = get();
        set((state) => ({
          seeds: state.seeds.map((s) => ({ ...s, status: computeStatus(s.expiryDate, settings.warningDays) })),
          chemicals: state.chemicals.map((c) => ({ ...c, status: computeStatus(c.expiryDate, settings.warningDays) })),
        }));
      },
    }),
    {
      name: 'agri-store-management',
    }
  )
);
