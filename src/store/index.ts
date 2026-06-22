import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Seed, Chemical, Farmer, SaleOrder, SaleItem, CreditRecord, PesticideRegistration, AppSettings, SeedingCrop, SeedingReminder, CollectionNotice, CollectionRecord, CollectionMethod, CollectionResult } from '@/types';

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
  { id: 'farmer-002', name: '李四', phone: '13987654321', address: '西平村5组', idCard: '330724197505052345', totalDebt: 400, creditRating: 'B', createdAt: '2025-02-15T08:00:00.000Z' },
  { id: 'farmer-003', name: '王五', phone: '15012349876', address: '南阳村1组', idCard: '330724198203033456', totalDebt: 5540, creditRating: 'A', createdAt: '2025-03-20T08:00:00.000Z' },
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
  {
    id: 'order-004',
    orderNumber: 'NZ20260315004',
    saleDate: '2026-03-15T09:00:00.000Z',
    items: [
      { id: 'si-006', productType: 'seed', productId: 'seed-004', productName: '棉花种子 中棉所49', quantity: 20, unitPrice: 62, subtotal: 1240 },
      { id: 'si-007', productType: 'chemical', productId: 'chem-001', productName: '草甘膦异丙胺盐水剂', quantity: 100, unitPrice: 18, subtotal: 1800 },
      { id: 'si-008', productType: 'chemical', productId: 'chem-003', productName: '尿素', quantity: 1000, unitPrice: 2.5, subtotal: 2500 },
    ],
    totalAmount: 5540,
    paymentMethod: 'credit',
    farmerId: 'farmer-003',
    status: 'credited',
    createdAt: '2026-03-15T09:00:00.000Z',
  },
];

const mockCreditRecords: CreditRecord[] = [
  { id: 'credit-001', farmerId: 'farmer-001', orderId: 'order-002', amount: 1705, paidAmount: 455, status: 'partial', expectedPayDate: '2026-07-15', createdAt: '2025-06-05T14:20:00.000Z' },
  { id: 'credit-002', farmerId: 'farmer-002', orderId: 'order-003', amount: 400, paidAmount: 0, status: 'unpaid', expectedPayDate: '2026-10-15', createdAt: '2025-06-10T10:15:00.000Z' },
  { id: 'credit-003', farmerId: 'farmer-003', orderId: 'order-004', amount: 5540, paidAmount: 0, status: 'unpaid', expectedPayDate: '2026-06-25', createdAt: '2026-03-15T09:00:00.000Z' },
];

const mockRegistrations: PesticideRegistration[] = [
  { id: 'reg-001', orderId: 'order-002', buyerName: '张三', idCard: '330724197001011234', phone: '13812345678', purpose: '病虫害防治', chemicalName: '毒死蜱乳油', quantity: 3, registrationDate: '2025-06-05T14:20:00.000Z' },
];

const mockSeedingCrops: SeedingCrop[] = [
  {
    id: 'crop-001',
    name: '早稻',
    category: '水稻',
    sowingStartMonth: 3,
    sowingStartDay: 15,
    sowingEndMonth: 4,
    sowingEndDay: 10,
    recommendedVarieties: [
      { name: 'Y两优900', seedId: 'seed-001', description: '超级杂交稻，产量高，抗病性强' },
      { name: '湘早籼45号', description: '早熟品种，适合双季稻区' },
    ],
    usagePerMu: 1.5,
    usageUnit: 'kg',
    growingPeriod: '105-115天',
    notes: '播种前晒种1-2天，用强氯精浸种消毒',
    region: '华中地区',
  },
  {
    id: 'crop-002',
    name: '中稻',
    category: '水稻',
    sowingStartMonth: 4,
    sowingStartDay: 20,
    sowingEndMonth: 5,
    sowingEndDay: 15,
    recommendedVarieties: [
      { name: 'Y两优900', seedId: 'seed-001', description: '超级杂交稻，产量高，抗病性强' },
      { name: '深两优5814', description: '米质优，适应性广' },
    ],
    usagePerMu: 1.25,
    usageUnit: 'kg',
    growingPeriod: '130-140天',
    notes: '秧龄控制在30-35天，注意防治稻飞虱',
    region: '华中地区',
  },
  {
    id: 'crop-003',
    name: '晚稻',
    category: '水稻',
    sowingStartMonth: 6,
    sowingStartDay: 15,
    sowingEndMonth: 7,
    sowingEndDay: 10,
    recommendedVarieties: [
      { name: 'H优518', description: '晚稻专用，耐寒性强' },
      { name: '岳优9113', description: '米质优，产量稳定' },
    ],
    usagePerMu: 1.5,
    usageUnit: 'kg',
    growingPeriod: '110-120天',
    notes: '确保在寒露风来临前安全齐穗',
    region: '华中地区',
  },
  {
    id: 'crop-004',
    name: '春玉米',
    category: '玉米',
    sowingStartMonth: 3,
    sowingStartDay: 20,
    sowingEndMonth: 4,
    sowingEndDay: 20,
    recommendedVarieties: [
      { name: '郑单958', seedId: 'seed-002', description: '国审品种，稳产性好' },
      { name: '登海605', description: '高产大穗，抗病性强' },
    ],
    usagePerMu: 2.5,
    usageUnit: 'kg',
    growingPeriod: '95-110天',
    notes: '5cm地温稳定在10℃以上播种，每亩4000-4500株',
    region: '华中地区',
  },
  {
    id: 'crop-005',
    name: '夏玉米',
    category: '玉米',
    sowingStartMonth: 5,
    sowingStartDay: 25,
    sowingEndMonth: 6,
    sowingEndDay: 20,
    recommendedVarieties: [
      { name: '郑单958', seedId: 'seed-002', description: '国审品种，稳产性好' },
      { name: '蠡玉16', description: '耐高温，适应性广' },
    ],
    usagePerMu: 2.5,
    usageUnit: 'kg',
    growingPeriod: '85-95天',
    notes: '抢时早播，麦收后尽快播种',
    region: '华中地区',
  },
  {
    id: 'crop-006',
    name: '冬小麦',
    category: '小麦',
    sowingStartMonth: 10,
    sowingStartDay: 15,
    sowingEndMonth: 11,
    sowingEndDay: 10,
    recommendedVarieties: [
      { name: '百农207', seedId: 'seed-003', description: '半冬性，中熟品种' },
      { name: '济麦22', description: '高产稳产，适应性广' },
    ],
    usagePerMu: 10,
    usageUnit: 'kg',
    growingPeriod: '230-240天',
    notes: '适期适量播种，注意防治纹枯病和赤霉病',
    region: '华中地区',
  },
  {
    id: 'crop-007',
    name: '棉花',
    category: '经济作物',
    sowingStartMonth: 4,
    sowingStartDay: 10,
    sowingEndMonth: 4,
    sowingEndDay: 30,
    recommendedVarieties: [
      { name: '中棉所49', seedId: 'seed-004', description: '转基因抗虫棉，高产优质' },
      { name: '鄂杂棉10号', description: '杂交棉，铃大吐絮畅' },
    ],
    usagePerMu: 1.5,
    usageUnit: 'kg',
    growingPeriod: '130-140天',
    notes: '营养钵育苗移栽，每亩2000-2500株',
    region: '华中地区',
  },
  {
    id: 'crop-008',
    name: '油菜',
    category: '油料作物',
    sowingStartMonth: 9,
    sowingStartDay: 20,
    sowingEndMonth: 10,
    sowingEndDay: 20,
    recommendedVarieties: [
      { name: '华油杂62', description: '双低油菜，含油量高' },
      { name: '中油杂19', description: '抗病性强，产量高' },
    ],
    usagePerMu: 0.4,
    usageUnit: 'kg',
    growingPeriod: '210-220天',
    notes: '育苗移栽，合理密植，花期防治菌核病',
    region: '华中地区',
  },
  {
    id: 'crop-009',
    name: '花生',
    category: '油料作物',
    sowingStartMonth: 4,
    sowingStartDay: 20,
    sowingEndMonth: 5,
    sowingEndDay: 15,
    recommendedVarieties: [
      { name: '远杂9102', description: '珍珠豆型，出仁率高' },
      { name: '豫花15', description: '普通型，丰产性好' },
    ],
    usagePerMu: 15,
    usageUnit: 'kg',
    growingPeriod: '110-130天',
    notes: '5cm地温稳定在15℃以上播种，地膜覆盖增产',
    region: '华中地区',
  },
  {
    id: 'crop-010',
    name: '大豆',
    category: '油料作物',
    sowingStartMonth: 6,
    sowingStartDay: 1,
    sowingEndMonth: 6,
    sowingEndDay: 25,
    recommendedVarieties: [
      { name: '中黄13', description: '高产稳产，适应性广' },
      { name: '豫豆22', description: '蛋白含量高，适合加工' },
    ],
    usagePerMu: 5,
    usageUnit: 'kg',
    growingPeriod: '95-110天',
    notes: '麦收后抢时早播，每亩15000株左右',
    region: '华中地区',
  },
  {
    id: 'crop-011',
    name: '番茄',
    category: '蔬菜',
    sowingStartMonth: 1,
    sowingStartDay: 20,
    sowingEndMonth: 2,
    sowingEndDay: 15,
    recommendedVarieties: [
      { name: '中杂105', description: '无限生长，抗病性强' },
      { name: '金棚11号', description: '粉红果，耐贮运' },
    ],
    usagePerMu: 0.05,
    usageUnit: 'kg',
    growingPeriod: '110-130天',
    notes: '大棚或小拱棚育苗移栽，注意防治病毒病',
    region: '华中地区',
  },
  {
    id: 'crop-012',
    name: '辣椒',
    category: '蔬菜',
    sowingStartMonth: 2,
    sowingStartDay: 1,
    sowingEndMonth: 3,
    sowingEndDay: 10,
    recommendedVarieties: [
      { name: '湘研15号', description: '早熟微辣，抗病性强' },
      { name: '博辣红牛', description: '簇生朝天椒，产量高' },
    ],
    usagePerMu: 0.05,
    usageUnit: 'kg',
    growingPeriod: '120-140天',
    notes: '大棚育苗，地膜覆盖栽培，注意防治蚜虫',
    region: '华中地区',
  },
];

function getSowingDateForYear(month: number, day: number, year: number): Date {
  return new Date(year, month - 1, day);
}

export function computeSeedingReminders(crops: SeedingCrop[], reminderDays: number): SeedingReminder[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const reminders: SeedingReminder[] = [];

  for (const crop of crops) {
    for (let yearOffset = 0; yearOffset <= 1; yearOffset++) {
      const year = currentYear + yearOffset;
      const sowingStart = getSowingDateForYear(crop.sowingStartMonth, crop.sowingStartDay, year);
      const sowingEnd = getSowingDateForYear(crop.sowingEndMonth, crop.sowingEndDay, year);
      
      const reminderDate = new Date(sowingStart);
      reminderDate.setDate(reminderDate.getDate() - reminderDays);
      
      const daysUntilSowing = Math.ceil((sowingStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      const reminderStart = new Date(reminderDate);
      reminderStart.setDate(reminderStart.getDate() - 30);
      const reminderEnd = new Date(sowingEnd);
      reminderEnd.setDate(reminderEnd.getDate() + 7);
      
      if (now >= reminderStart && now <= reminderEnd) {
        reminders.push({
          id: `reminder-${crop.id}-${year}`,
          cropId: crop.id,
          cropName: crop.name,
          reminderDate: reminderDate.toISOString(),
          sowingStartDate: sowingStart.toISOString(),
          sowingEndDate: sowingEnd.toISOString(),
          daysUntilSowing,
          recommendedVarieties: crop.recommendedVarieties,
          usagePerMu: crop.usagePerMu,
          usageUnit: crop.usageUnit,
          notes: crop.notes,
          isActive: daysUntilSowing >= 0 && daysUntilSowing <= 30,
        });
      }
    }
  }

  return reminders.sort((a, b) => {
    const getUrgency = (days: number) => {
      if (days > 0 && days <= 7) return 0;
      if (days > 0 && days <= 15) return 1;
      if (days <= 0) return 2;
      return 3;
    };
    const ua = getUrgency(a.daysUntilSowing);
    const ub = getUrgency(b.daysUntilSowing);
    if (ua !== ub) return ua - ub;
    return a.daysUntilSowing - b.daysUntilSowing;
  });
}

function computeCollectionNotices(
  creditRecords: CreditRecord[],
  farmers: Farmer[],
  reminderDays: number
): CollectionNotice[] {
  const now = new Date();
  const notices: CollectionNotice[] = [];

  for (const credit of creditRecords) {
    if (credit.status === 'paid') continue;

    const farmer = farmers.find((f) => f.id === credit.farmerId);
    if (!farmer) continue;

    const expectedDate = new Date(credit.expectedPayDate);
    const diffTime = expectedDate.getTime() - now.getTime();
    const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const remainingAmount = credit.amount - credit.paidAmount;

    if (daysUntilDue <= reminderDays) {
      let urgency: CollectionNotice['urgency'] = 'normal';
      let status: CollectionNotice['status'] = 'pending';

      if (daysUntilDue <= 0) {
        urgency = 'critical';
        status = 'overdue';
      } else if (daysUntilDue <= 7) {
        urgency = 'urgent';
        status = 'in_progress';
      } else if (daysUntilDue <= 15) {
        urgency = 'urgent';
      }

      const notice: CollectionNotice = {
        id: `collection-${credit.id}`,
        creditRecordId: credit.id,
        farmerId: farmer.id,
        farmerName: farmer.name,
        farmerPhone: farmer.phone,
        amount: credit.amount,
        paidAmount: credit.paidAmount,
        remainingAmount,
        expectedPayDate: credit.expectedPayDate,
        noticeDate: now.toISOString(),
        daysUntilDue,
        status,
        urgency,
        createdAt: now.toISOString(),
      };

      notices.push(notice);
    }
  }

  return notices.sort((a, b) => {
    const urgencyOrder = { critical: 0, urgent: 1, normal: 2 };
    if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    }
    return a.daysUntilDue - b.daysUntilDue;
  });
}

interface StoreState {
  seeds: Seed[];
  chemicals: Chemical[];
  farmers: Farmer[];
  saleOrders: SaleOrder[];
  creditRecords: CreditRecord[];
  pesticideRegistrations: PesticideRegistration[];
  seedingCrops: SeedingCrop[];
  collectionRecords: CollectionRecord[];
  dismissedReminders: string[];
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

  addSeedingCrop: (crop: Omit<SeedingCrop, 'id'>) => void;
  updateSeedingCrop: (id: string, data: Partial<SeedingCrop>) => void;
  deleteSeedingCrop: (id: string) => void;
  getSeedingReminders: () => SeedingReminder[];
  dismissReminder: (reminderId: string) => void;
  clearDismissedReminders: () => void;

  getCollectionNotices: () => CollectionNotice[];
  addCollectionRecord: (record: Omit<CollectionRecord, 'id' | 'createdAt' | 'createdBy'>) => void;
  getCollectionRecords: (noticeId?: string) => CollectionRecord[];
  updateCollectionNoticeStatus: (noticeId: string, status: CollectionNotice['status']) => void;

  updateSettings: (settings: Partial<AppSettings>) => void;
  refreshStatuses: () => void;
}

const mockCollectionRecords: CollectionRecord[] = [];

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      seeds: mockSeeds,
      chemicals: mockChemicals,
      farmers: mockFarmers,
      saleOrders: mockSaleOrders,
      creditRecords: mockCreditRecords,
      pesticideRegistrations: mockRegistrations,
      seedingCrops: mockSeedingCrops,
      collectionRecords: mockCollectionRecords,
      dismissedReminders: [],
      settings: {
        warningDays: 30,
        autoBanExpired: true,
        restrictedPesticides: ['百草枯', '毒死蜱', '甲胺磷', '对硫磷', '甲基对硫磷'],
        seedingReminderDays: 15,
        collectionReminderDays: 30,
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

      addSeedingCrop: (crop) => {
        const newCrop: SeedingCrop = { ...crop, id: generateId() };
        set((state) => ({ seedingCrops: [...state.seedingCrops, newCrop] }));
      },

      updateSeedingCrop: (id, data) => {
        set((state) => ({
          seedingCrops: state.seedingCrops.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        }));
      },

      deleteSeedingCrop: (id) => {
        set((state) => ({ seedingCrops: state.seedingCrops.filter((c) => c.id !== id) }));
      },

      getSeedingReminders: () => {
        const { seedingCrops, settings, dismissedReminders } = get();
        const reminders = computeSeedingReminders(seedingCrops, settings.seedingReminderDays);
        return reminders.filter((r) => !dismissedReminders.includes(r.id));
      },

      dismissReminder: (reminderId) => {
        set((state) => ({
          dismissedReminders: [...state.dismissedReminders, reminderId],
        }));
      },

      clearDismissedReminders: () => {
        set({ dismissedReminders: [] });
      },

      getCollectionNotices: () => {
        const { creditRecords, farmers, settings } = get();
        return computeCollectionNotices(creditRecords, farmers, settings.collectionReminderDays);
      },

      addCollectionRecord: (record) => {
        const newRecord: CollectionRecord = {
          ...record,
          id: generateId(),
          createdAt: new Date().toISOString(),
          createdBy: '管理员',
        };
        set((state) => ({
          collectionRecords: [...state.collectionRecords, newRecord],
        }));
      },

      getCollectionRecords: (noticeId) => {
        const { collectionRecords } = get();
        if (noticeId) {
          return collectionRecords.filter((r) => r.collectionNoticeId === noticeId);
        }
        return collectionRecords;
      },

      updateCollectionNoticeStatus: (noticeId, status) => {
        const { creditRecords } = get();
        const creditId = noticeId.replace('collection-', '');
        const credit = creditRecords.find((c) => c.id === creditId);
        if (!credit) return;

        if (status === 'resolved') {
          set((state) => ({
            creditRecords: state.creditRecords.map((c) =>
              c.id === creditId ? { ...c, status: 'paid', actualPayDate: new Date().toISOString() } : c
            ),
          }));
        }
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
