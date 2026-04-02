"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireDivision, requireEditor, requireHead } from "@/lib/auth-utils"

export async function getGoals() {
  try {
    const user = await requireDivision()
    const goals = await prisma.goal.findMany({
      where: { divisionId: user.divisionId },
      orderBy: { deadline: "asc" }
    })
    
    // Map dates to strings
    const mapped = goals.map((g: any) => ({
      ...g,
      deadline: g.deadline ? g.deadline.toISOString() : null
    }))

    return { success: true, data: mapped }
  } catch (error) {
    console.error("Failed to fetch goals:", error)
    return { success: false, error: "Gagal mengambil data target" }
  }
}

export async function addGoal(data: {
  name: string
  targetAmount: number
  deadline?: string
  color: string
}) {
  try {
    const user = await requireEditor()
    
    const goal = await prisma.goal.create({
      data: {
        name: data.name,
        targetAmount: data.targetAmount,
        color: data.color,
        deadline: data.deadline ? new Date(data.deadline) : null,
        divisionId: user.divisionId
      }
    })
    
    revalidatePath("/dashboard")
    return { success: true, data: goal }
  } catch (error) {
    console.error("Failed to create goal:", error)
    return { success: false, error: "Gagal membuat target baru" }
  }
}

export async function updateGoalProgress(id: string, addedAmount: number) {
  try {
    const user = await requireEditor()
    
    const existing = await prisma.goal.findUnique({ where: { id } })
    if (!existing || existing.divisionId !== user.divisionId) {
       throw new Error("Unauthorized")
    }

    const goal = await prisma.goal.update({
      where: { id },
      data: { currentAmount: { increment: addedAmount } }
    })
    
    revalidatePath("/dashboard")
    return { success: true, data: goal }
  } catch (error) {
    console.error("Failed to update goal progress:", error)
    return { success: false, error: "Gagal menyetor dana ke target" }
  }
}

export async function updateGoal(id: string, data: Partial<{
  name: string
  targetAmount: number
  deadline: string | null
  color: string
}>) {
  try {
    const user = await requireEditor()
    const existing = await prisma.goal.findUnique({ where: { id } })
    if (!existing || existing.divisionId !== user.divisionId) throw new Error("Unauthorized")

    const goal = await prisma.goal.update({
      where: { id },
      data: {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : data.deadline === null ? null : undefined
      }
    })
    
    revalidatePath("/dashboard")
    return { success: true, data: goal }
  } catch (error) {
    console.error("Failed to update goal:", error)
    return { success: false, error: "Gagal mengubah target" }
  }
}

export async function deleteGoal(id: string) {
  try {
    const user = await requireHead()
    const existing = await prisma.goal.findUnique({ where: { id } })
    if (!existing || existing.divisionId !== user.divisionId) throw new Error("Unauthorized")

    await prisma.goal.delete({ where: { id } })
    
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete goal:", error)
    return { success: false, error: "Gagal menghapus target" }
  }
}
