"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireHead, requireDivision } from "@/lib/auth-utils"

export async function getDivisionMembers() {
  try {
    const user = await requireDivision()
    const members = await prisma.user.findMany({
      where: { divisionId: user.divisionId },
      select: {
        id: true,
        username: true,
        globalRole: true,
        divisionRole: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" }
    })
    return { success: true, data: members }
  } catch (error) {
    console.error("Failed to fetch division members:", error)
    return { success: false, error: "Gagal mengambil daftar anggota" }
  }
}

export async function inviteDivisionMember(targetUsername: string, role: string) {
  try {
    const user = await requireHead()
    
    // Check if target user exists
    const target = await prisma.user.findUnique({
      where: { username: targetUsername }
    })

    if (!target) {
      return { success: false, error: "Username tidak terdaftar di sistem." }
    }

    if (target.divisionId) {
      return { success: false, error: `User sudah tergabung dalam divisi lain.` }
    }

    // Attach them to the division
    await prisma.user.update({
      where: { id: target.id },
      data: {
        divisionId: user.divisionId,
        divisionRole: role,
      }
    })

    revalidatePath("/dashboard/users")
    return { success: true }
  } catch (error) {
    console.error("Failed to invite member:", error)
    return { success: false, error: "Gagal mengundang anggota" }
  }
}

export async function updateMemberRole(memberId: string, role: string) {
  try {
    const user = await requireHead()
    
    // Prevent self-demotion if they are the last HEAD
    if (memberId === user.id && role !== "HEAD") {
      const headCount = await prisma.user.count({ 
        where: { divisionId: user.divisionId, divisionRole: "HEAD" } 
      })
      if (headCount <= 1) {
        return { success: false, error: "Tidak dapat menurunkan jabatan karena Anda adalah satu-satunya Kepala Divisi." }
      }
    }

    const target = await prisma.user.findUnique({ where: { id: memberId } })
    if (!target || target.divisionId !== user.divisionId) {
      return { success: false, error: "Anggota tidak ditemukan di divisi ini." }
    }

    await prisma.user.update({
      where: { id: memberId },
      data: { divisionRole: role }
    })

    revalidatePath("/dashboard/users")
    return { success: true }
  } catch (error) {
    console.error("Failed to update role:", error)
    return { success: false, error: "Gagal mengubah role" }
  }
}

export async function removeMember(memberId: string) {
  try {
    const user = await requireHead()
    
    if (memberId === user.id) {
       return { success: false, error: "Anda tidak dapat menghapus diri sendiri." }
    }

    const target = await prisma.user.findUnique({ where: { id: memberId } })
    if (!target || target.divisionId !== user.divisionId) {
      return { success: false, error: "Anggota tidak ditemukan di divisi ini." }
    }

    // Set them back to an unassigned user
    await prisma.user.update({
      where: { id: memberId },
      data: {
        divisionId: null,
        divisionRole: "VIEWER"
      }
    })

    revalidatePath("/dashboard/users")
    return { success: true }
  } catch (error) {
    console.error("Failed to remove member:", error)
    return { success: false, error: "Gagal menghapus anggota" }
  }
}
