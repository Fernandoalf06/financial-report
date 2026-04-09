"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/mail"

// ─── Pre-Login Check ───────────────────────────────────────────────
// Called before NextAuth signIn to detect specific issues like unverified email
export async function checkLoginEligibility(username: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      return { eligible: false, reason: "INVALID_CREDENTIALS" }
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      return { eligible: false, reason: "INVALID_CREDENTIALS" }
    }

    if (!user.emailVerified) {
      return { eligible: false, reason: "EMAIL_NOT_VERIFIED", email: user.email }
    }

    return { eligible: true }
  } catch {
    return { eligible: false, reason: "UNKNOWN_ERROR" }
  }
}

// ─── Helper: Generate secure token ─────────────────────────────────
function generateToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

// ─── Register Tenant ───────────────────────────────────────────────
export async function registerTenant(data: {
  username: string;
  email: string;
  passwordHash: string;
  divisionName?: string;
}) {
  try {
    // Check username uniqueness
    const existingUser = await prisma.user.findUnique({
      where: { username: data.username }
    })
    if (existingUser) {
      return { success: false, error: "Username sudah digunakan oleh orang lain." }
    }

    // Check email uniqueness
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() }
    })
    if (existingEmail) {
      return { success: false, error: "Email sudah terdaftar. Gunakan email yang lain atau masuk ke akun Anda." }
    }

    const hashedPassword = await bcrypt.hash(data.passwordHash, 10)
    const email = data.email.toLowerCase()

    if (data.divisionName && data.divisionName.trim() !== "") {
      const existingDiv = await prisma.division.findUnique({ where: { name: data.divisionName } })
      if (existingDiv) {
        return { success: false, error: "Nama Divisi sudah digunakan oleh entitas lain." }
      }

      const newDiv = await prisma.division.create({ data: { name: data.divisionName } })
      
      const newUser = await prisma.user.create({
        data: {
          username: data.username,
          email,
          passwordHash: hashedPassword,
          emailVerified: false,
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

      // Generate verification token & send email
      const token = generateToken()
      await prisma.verificationToken.create({
        data: {
          token,
          type: "EMAIL_VERIFY",
          userId: newUser.id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        }
      })

      try {
        await sendVerificationEmail(email, token)
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError)
        // Don't fail registration if email fails - user can resend later
      }

      return { success: true, data: newUser }
    } else {
      // Unassigned Subordinate
      const newUser = await prisma.user.create({
        data: {
          username: data.username,
          email,
          passwordHash: hashedPassword,
          emailVerified: false,
          globalRole: "USER",
          divisionRole: "VIEWER",
        }
      })

      // Generate verification token & send email
      const token = generateToken()
      await prisma.verificationToken.create({
        data: {
          token,
          type: "EMAIL_VERIFY",
          userId: newUser.id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        }
      })

      try {
        await sendVerificationEmail(email, token)
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError)
      }

      return { success: true, data: newUser }
    }

  } catch (error: any) {
    console.error("Failed to register user:", error);
    return { 
      success: false, 
      error: `Gagal mendaftarkan akun. Detail: ${error?.message || "Kesalahan sistem tidak dikenal"}` 
    };
  }
}

// ─── Verify Email ──────────────────────────────────────────────────
export async function verifyEmail(token: string) {
  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!verificationToken) {
      return { success: false, error: "Token verifikasi tidak valid atau sudah digunakan." }
    }

    if (verificationToken.type !== "EMAIL_VERIFY") {
      return { success: false, error: "Token tidak valid untuk verifikasi email." }
    }

    if (verificationToken.expiresAt < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({ where: { id: verificationToken.id } })
      return { success: false, error: "Token verifikasi sudah kedaluwarsa. Silakan minta kirim ulang email verifikasi." }
    }

    // Mark email as verified
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: true }
    })

    // Delete the used token
    await prisma.verificationToken.delete({ where: { id: verificationToken.id } })

    return { success: true, message: "Email berhasil diverifikasi! Silakan login." }
  } catch (error: any) {
    console.error("Failed to verify email:", error)
    return { success: false, error: "Gagal memverifikasi email. Silakan coba lagi." }
  }
}

// ─── Resend Verification Email ─────────────────────────────────────
export async function resendVerificationEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      // Don't reveal if email exists for security
      return { success: true, message: "Jika email terdaftar, kami akan mengirimkan link verifikasi." }
    }

    if (user.emailVerified) {
      return { success: false, error: "Email sudah diverifikasi. Silakan login." }
    }

    // Delete old verification tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { userId: user.id, type: "EMAIL_VERIFY" }
    })

    // Generate new token
    const token = generateToken()
    await prisma.verificationToken.create({
      data: {
        token,
        type: "EMAIL_VERIFY",
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }
    })

    await sendVerificationEmail(user.email, token)

    return { success: true, message: "Email verifikasi telah dikirim ulang. Periksa kotak masuk Anda." }
  } catch (error: any) {
    console.error("Failed to resend verification email:", error)
    return { success: false, error: "Gagal mengirim email verifikasi. Silakan coba lagi." }
  }
}

// ─── Request Password Reset ────────────────────────────────────────
export async function requestPasswordReset(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return { success: true, message: "Jika email terdaftar, kami akan mengirimkan link reset password." }
    }

    // Delete old reset tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { userId: user.id, type: "PASSWORD_RESET" }
    })

    // Generate new token (expires in 1 hour)
    const token = generateToken()
    await prisma.verificationToken.create({
      data: {
        token,
        type: "PASSWORD_RESET",
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      }
    })

    await sendPasswordResetEmail(user.email, token)

    return { success: true, message: "Link reset password telah dikirim ke email Anda." }
  } catch (error: any) {
    console.error("Failed to request password reset:", error)
    return { success: false, error: "Gagal mengirim email reset password. Silakan coba lagi." }
  }
}

// ─── Reset Password ────────────────────────────────────────────────
export async function resetPassword(token: string, newPassword: string) {
  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!verificationToken) {
      return { success: false, error: "Token reset password tidak valid atau sudah digunakan." }
    }

    if (verificationToken.type !== "PASSWORD_RESET") {
      return { success: false, error: "Token tidak valid untuk reset password." }
    }

    if (verificationToken.expiresAt < new Date()) {
      await prisma.verificationToken.delete({ where: { id: verificationToken.id } })
      return { success: false, error: "Token reset password sudah kedaluwarsa. Silakan minta reset ulang." }
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { passwordHash: hashedPassword }
    })

    // Delete the used token
    await prisma.verificationToken.delete({ where: { id: verificationToken.id } })

    return { success: true, message: "Password berhasil direset! Silakan login dengan password baru." }
  } catch (error: any) {
    console.error("Failed to reset password:", error)
    return { success: false, error: "Gagal mereset password. Silakan coba lagi." }
  }
}
