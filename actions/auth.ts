"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function registerTenant(data: { username: string, passwordHash: string, divisionName?: string }) {
  try {
    const existing = await prisma.user.findUnique({
      where: { username: data.username }
    })
    if (existing) {
      return { success: false, error: "Username sudah digunakan oleh orang lain." }
    }

    const hashedPassword = await bcrypt.hash(data.passwordHash, 10)

    if (data.divisionName && data.divisionName.trim() !== "") {
      const existingDiv = await prisma.division.findUnique({ where: { name: data.divisionName } })
      if (existingDiv) {
        return { success: false, error: "Nama Divisi sudah digunakan oleh entitas lain." }
      }

      const newDiv = await prisma.division.create({ data: { name: data.divisionName } })
      
      const newUser = await prisma.user.create({
        data: {
          username: data.username,
          passwordHash: hashedPassword,
          globalRole: "USER",
          divisionRole: "HEAD",
          divisionId: newDiv.id
        }
      })

      const defaultCategories = [
        { name: "Operasional", color: "#6366f1" },
        { name: "Gaji", color: "#f43f5e" },
        { name: "Pemasaran", color: "#eab308" },
        { name: "Utilitas", color: "#8b5cf6" },
        { name: "Penjualan", color: "#10b981" },
      ]

      for (const cat of defaultCategories) {
        await prisma.category.create({
          data: {
            ...cat,
            divisionId: newDiv.id
          }
        })
      }

      return { success: true, data: newUser }
    } else {
      // Unassigned Subordinate
      const newUser = await prisma.user.create({
        data: {
          username: data.username,
          passwordHash: hashedPassword,
          globalRole: "USER",
          divisionRole: "VIEWER",
        }
      })
      return { success: true, data: newUser }
    }

  } catch (error) {
    console.error("Failed to register user:", error)
    return { success: false, error: "Gagal mendaftarkan akun." }
  }
}
