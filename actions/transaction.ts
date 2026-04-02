"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

import { requireDivision, requireEditor } from "@/lib/auth-utils"

export async function getTransactions() {
  try {
    const user = await requireDivision()
    const transactions = await prisma.transaction.findMany({
      where: { divisionId: user.divisionId },
      include: { category: true },
      orderBy: { date: "desc" }
    })
    
    // Map to match the frontend expected structure
    const mapped = transactions.map((tx: any) => ({
      id: tx.id,
      description: tx.description,
      amount: tx.amount,
      date: tx.date.toISOString(),
      type: tx.type,
      category: tx.category.name,
      receiptUrl: tx.receiptUrl
    }))
    
    return { success: true, data: mapped }
  } catch (error) {
    console.error("Failed to fetch transactions:", error)
    return { success: false, error: "Gagal mengambil data transaksi" }
  }
}

export async function addTransaction(data: {
  description: string
  amount: number
  date: string
  type: "income" | "expense"
  category: string
  receiptUrl?: string
}) {
  try {
    const user = await requireEditor()
    
    // We look up category using the compound unique key [name, divisionId]
    const categoryRecord = await prisma.category.findUnique({
      where: { name_divisionId: { name: data.category, divisionId: user.divisionId } }
    })
    
    if (!categoryRecord) {
      return { success: false, error: "Kategori tidak ditemukan untuk user ini" }
    }

    const tx = await prisma.transaction.create({
      data: {
        description: data.description,
        amount: data.amount,
        date: new Date(data.date),
        type: data.type,
        categoryId: categoryRecord.id,
        divisionId: user.divisionId,
        receiptUrl: data.receiptUrl
      }
    })
    
    revalidatePath("/dashboard")
    return { success: true, data: tx }
  } catch (error) {
    console.error("Failed to add transaction:", error)
    return { success: false, error: "Gagal menambahkan transaksi" }
  }
}

export async function updateTransaction(id: string, data: Partial<{
  description: string
  amount: number
  date: string
  type: "income" | "expense"
  category: string
  receiptUrl: string
}>) {
  try {
    const user = await requireEditor()
    
    // Verify ownership
    const existing = await prisma.transaction.findUnique({ where: { id } })
    if (!existing || existing.divisionId !== user.divisionId) throw new Error("Unauthorized")

    let categoryId = undefined
    if (data.category) {
      const categoryRecord = await prisma.category.findUnique({
        where: { name_divisionId: { name: data.category, divisionId: user.divisionId } }
      })
      if (categoryRecord) categoryId = categoryRecord.id
    }

    const tx = await prisma.transaction.update({
      where: { id },
      data: {
        description: data.description,
        amount: data.amount,
        date: data.date ? new Date(data.date) : undefined,
        type: data.type,
        receiptUrl: data.receiptUrl,
        ...(categoryId && { categoryId })
      }
    })
    
    revalidatePath("/dashboard")
    return { success: true, data: tx }
  } catch (error) {
    console.error("Failed to update transaction:", error)
    return { success: false, error: "Gagal memperbarui transaksi" }
  }
}

export async function deleteTransaction(id: string) {
  try {
    const user = await requireEditor()
    
    // Check ownership
    const existing = await prisma.transaction.findUnique({ where: { id } })
    if (!existing || existing.divisionId !== user.divisionId) throw new Error("Unauthorized")

    await prisma.transaction.delete({
      where: { id }
    })
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete transaction:", error)
    return { success: false, error: "Gagal menghapus transaksi" }
  }
}
