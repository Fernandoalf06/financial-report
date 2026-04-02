"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireDivision, requireHead } from "@/lib/auth-utils"

// ----------------------------------------
// QUERIES
// ----------------------------------------

export async function getCategories() {
  try {
    const user = await requireDivision()
    const categories = await prisma.category.findMany({
      where: { divisionId: user.divisionId },
      orderBy: { name: "asc" }
    })
    return { success: true, data: categories }
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    return { success: false, error: "Gagal mengambil data kategori" }
  }
}

// ----------------------------------------
// MUTATIONS
// ----------------------------------------

export async function addCategory(name: string, color: string) {
  try {
    const user = await requireHead()
    const category = await prisma.category.create({
      data: { name, color, divisionId: user.divisionId }
    })
    revalidatePath("/dashboard")
    return { success: true, data: category }
  } catch (error) {
    console.error("Failed to create category:", error)
    return { success: false, error: "Gagal membuat kategori, nama mungkin sudah ada." }
  }
}

export async function updateCategory(id: string, name: string, color: string) {
  try {
    const user = await requireHead()
    const existing = await prisma.category.findUnique({ where: { id } })
    if (!existing || existing.divisionId !== user.divisionId) throw new Error("Unauthorized")

    const category = await prisma.category.update({
      where: { id },
      data: { name, color }
    })
    revalidatePath("/dashboard")
    return { success: true, data: category }
  } catch (error) {
    console.error("Failed to update category:", error)
    return { success: false, error: "Gagal memperbarui kategori" }
  }
}

export async function deleteCategory(id: string) {
  try {
    const user = await requireHead()
    const existing = await prisma.category.findUnique({ where: { id } })
    if (!existing || existing.divisionId !== user.divisionId) throw new Error("Unauthorized")

    await prisma.category.delete({
      where: { id }
    })
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete category:", error)
    return { success: false, error: "Gagal menghapus kategori. Pastikan tidak ada transaksi yang menggunakannya." }
  }
}
