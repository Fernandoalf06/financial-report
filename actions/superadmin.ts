"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

async function requireSuperAdmin() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  const user = session.user as any
  if (user.globalRole !== "SUPERADMIN") {
    throw new Error("Forbidden: Area terbatas untuk Super Administrator")
  }
  return user
}

export async function getSuperAdminStats() {
  try {
    await requireSuperAdmin()

    const [totalUsers, totalDivisions, divisionsData] = await Promise.all([
      prisma.user.count(),
      prisma.division.count(),
      prisma.division.findMany({
        include: {
          _count: {
            select: { users: true, transactions: true, goals: true }
          },
          users: {
            where: { divisionRole: "HEAD" },
            select: { username: true } // grab head names
          }
        },
        orderBy: { createdAt: "desc" }
      })
    ])

    // Shape Data
    const formattedDivisions = divisionsData.map((div: any) => ({
      id: div.id,
      name: div.name,
      createdAt: div.createdAt.toISOString(),
      userCount: div._count.users,
      transactionCount: div._count.transactions,
      goalCount: div._count.goals,
      heads: div.users.map((u: any) => u.username)
    }))

    return { 
      success: true, 
      data: {
        totalUsers,
        totalDivisions,
        divisions: formattedDivisions
      } 
    }
  } catch (error: any) {
    console.error("SuperAdmin error:", error)
    return { success: false, error: error.message || "Gagal mengambil data sistem" }
  }
}
