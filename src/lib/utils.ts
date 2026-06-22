import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Farmer, CreditRecord } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFarmerTotalDebt(farmerId: string, creditRecords: CreditRecord[]): number {
  return creditRecords
    .filter((r) => r.farmerId === farmerId && r.status !== "paid")
    .reduce((sum, r) => sum + (r.amount - r.paidAmount), 0)
}

export function getFarmersWithDebt(
  farmers: Farmer[],
  creditRecords: CreditRecord[]
): (Farmer & { computedTotalDebt: number })[] {
  return farmers.map((f) => ({
    ...f,
    computedTotalDebt: getFarmerTotalDebt(f.id, creditRecords),
  }))
}
