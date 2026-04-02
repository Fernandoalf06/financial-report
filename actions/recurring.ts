"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireDivision, requireEditor, requireHead } from "@/lib/auth-utils"
import { addDays, addWeeks, addMonths } from "date-fns"

export async function getRecurringTransactions() {
  try {
    const user = await requireDivision()
    const recurring = await prisma.recurringTransaction.findMany({
      where: { divisionId: user.divisionId },
      include: { category: true },
      orderBy: { nextDate: "asc" }
    })
    
    // Map dates to strings
    const mapped = recurring.map((r: any) => ({
      ...r,
      nextDate: r.nextDate.toISOString()
    }))

    return { success: true, data: mapped }
  } catch (error) {
    console.error("Failed to fetch recurring transactions:", error)
    return { success: false, error: "Gagal mengambil data transaksi berulang" }
  }
}

export async function addRecurringTransaction(data: {
  description: string
  amount: number
  type: "income" | "expense"
  frequency: "DAILY" | "WEEKLY" | "MONTHLY"
  nextDate: string
  category: string
}) {
  try {
    const user = await requireEditor()
    
    // We look up category using the compound unique key [name, divisionId]
    const categoryRecord = await prisma.category.findUnique({
      where: { name_divisionId: { name: data.category, divisionId: user.divisionId } }
    })
    
    if (!categoryRecord) {
      return { success: false, error: "Kategori tidak ditemukan untuk divisi ini" }
    }

    const tx = await prisma.recurringTransaction.create({
      data: {
        description: data.description,
        amount: data.amount,
        type: data.type,
        frequency: data.frequency,
        nextDate: new Date(data.nextDate),
        categoryId: categoryRecord.id,
        divisionId: user.divisionId
      }
    })
    
    revalidatePath("/dashboard")
    return { success: true, data: tx }
  } catch (error) {
    console.error("Failed to add recurring transaction:", error)
    return { success: false, error: "Gagal membuat jadwal transaksi" }
  }
}

export async function deleteRecurringTransaction(id: string) {
  try {
    const user = await requireHead()
    const existing = await prisma.recurringTransaction.findUnique({ where: { id } })
    if (!existing || existing.divisionId !== user.divisionId) throw new Error("Unauthorized")

    await prisma.recurringTransaction.delete({ where: { id } })
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete recurring tx:", error)
    return { success: false, error: "Gagal menghapus jadwal" }
  }
}

// System Hook: Evaluates overdue recurring transactions and executes them
export async function processDueRecurringTransactions(divisionId: string) {
  try {
    // Auth guard — only allow authenticated users belonging to this division
    const user = await requireDivision()
    if (user.divisionId !== divisionId) {
      return { success: false, error: "Unauthorized: Akses divisi tidak valid" }
    }

    const now = new Date()
    
    const dueTransactions = await prisma.recurringTransaction.findMany({
      where: {
        divisionId,
        nextDate: { lte: now }
      }
    })

    if (dueTransactions.length === 0) return { success: true, processedCount: 0 }

    let count = 0;

    for (const rec of dueTransactions) {
      // 1. Create the actual transaction record for today
      await prisma.transaction.create({
        data: {
          description: `[Otomatis] ${rec.description}`,
          amount: rec.amount,
          date: now,
          type: rec.type,
          categoryId: rec.categoryId,
          divisionId: rec.divisionId
        }
      })

      // 2. Calculate the next iteration date
      let nextRun = rec.nextDate
      while (nextRun <= now) {
        if (rec.frequency === "DAILY") {
          nextRun = addDays(nextRun, 1)
        } else if (rec.frequency === "WEEKLY") {
          nextRun = addWeeks(nextRun, 1)
        } else if (rec.frequency === "MONTHLY") {
          nextRun = addMonths(nextRun, 1)
        } else {
          // Fallback sanity check to prevent infinite loops if frequency is malformed
          nextRun = addMonths(nextRun, 1) 
        }
      }

      // 3. Update the recurring template
      await prisma.recurringTransaction.update({
        where: { id: rec.id },
        data: { nextDate: nextRun }
      })

      count++
    }

    if (count > 0) {
      revalidatePath("/dashboard")
    }
    
    return { success: true, processedCount: count }
  } catch (error) {
    console.error("Failed to process due recurring transactions:", error)
    return { success: false, error: "Gagal mengeksekusi otomatisasi transaksi" }
  }
}
