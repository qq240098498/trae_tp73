export interface Seed {
  id: string;
  name: string;
  variety: string;
  specification: string;
  origin: string;
  expiryDate: string;
  batchNumber: string;
  stockQuantity: number;
  purchasePrice: number;
  sellingPrice: number;
  status: 'normal' | 'warning' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export interface Chemical {
  id: string;
  name: string;
  brand: string;
  type: 'fertilizer' | 'pesticide';
  content: string;
  dosageForm: string;
  registrationNumber: string;
  expiryDate: string;
  stockQuantity: number;
  purchasePrice: number;
  sellingPrice: number;
  isRestricted: boolean;
  status: 'normal' | 'warning' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export interface Farmer {
  id: string;
  name: string;
  phone: string;
  address: string;
  idCard: string;
  totalDebt: number;
  creditRating: 'A' | 'B' | 'C';
  createdAt: string;
}

export interface SaleItem {
  id: string;
  productType: 'seed' | 'chemical';
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SaleOrder {
  id: string;
  orderNumber: string;
  saleDate: string;
  items: SaleItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'credit';
  farmerId?: string;
  status: 'completed' | 'credited';
  createdAt: string;
}

export interface CreditRecord {
  id: string;
  farmerId: string;
  orderId: string;
  amount: number;
  paidAmount: number;
  status: 'unpaid' | 'partial' | 'paid';
  expectedPayDate: string;
  actualPayDate?: string;
  createdAt: string;
}

export interface PesticideRegistration {
  id: string;
  orderId: string;
  buyerName: string;
  idCard: string;
  phone: string;
  purpose: string;
  chemicalName: string;
  quantity: number;
  registrationDate: string;
}

export interface AppSettings {
  warningDays: number;
  autoBanExpired: boolean;
  restrictedPesticides: string[];
}

export type ProductStatus = 'normal' | 'warning' | 'expired';
