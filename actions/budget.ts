"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireDivision, requireHead } from "@/lib/auth-utils"

export async function getBudgets() {
  try {
    const user = await requireDivision()
    const budgets = await prisma.budget.findMany({
      where: { divisionId: user.divisionId },
      include: { category: true }
    })
    
    return { success: true, data: budgets }
  } catch (error) {
    console.error("Failed to fetch budgets:", error)
    return { success: false, error: "Gagal mengambil data anggaran" }
  }
}

export async function setBudget(
  categoryId: string,
  amount: number,
  startDate: string,
  endDate: string,
  budgetId?: string
) {
  try {
    const user = await requireHead()
    
    // Check if category belongs to division
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })
    if (!category || category.divisionId !== user.divisionId) {
      return { success: false, error: "Kategori tidak valid" }
    }

    let budget
    if (budgetId) {
      // Ensure budget belongs to division before updating
      const existing = await prisma.budget.findUnique({ where: { id: budgetId } })
      if (!existing || existing.divisionId !== user.divisionId) {
        return { success: false, error: "Anggaran tidak ditemukan" }
      }
      budget = await prisma.budget.update({
        where: { id: budgetId },
        data: {
          amount,
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        }
      })
    } else {
      budget = await prisma.budget.create({
        data: {
          categoryId,
          amount,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          divisionId: user.divisionId
        }
      })
    }
    
    revalidatePath("/dashboard")
    return { success: true, data: budget }
  } catch (error) {
    console.error("Failed to set budget:", error)
    return { success: false, error: "Gagal mengatur anggaran" }
  }
}

export async function deleteBudget(budgetId: string) {
  try {
    const user = await requireHead()
    const existing = await prisma.budget.findUnique({ where: { id: budgetId } })
    if (!existing || existing.divisionId !== user.divisionId) {
      return { success: false, error: "Anggaran tidak ditemukan" }
    }
    await prisma.budget.delete({ where: { id: budgetId } })
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete budget:", error)
    return { success: false, error: "Gagal menghapus anggaran" }
  }
}
