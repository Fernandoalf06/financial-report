import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const FROM = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@example.com";

// ─── Shared email wrapper ──────────────────────────────────────────
function baseTemplate(title: string, bodyHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px;">
  <tr>
    <td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03));border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:40px;">
        <tr>
          <td align="center" style="padding-bottom:24px;">
            <div style="display:inline-block;width:56px;height:56px;line-height:56px;text-align:center;border-radius:14px;background:linear-gradient(135deg,#6366f1,#7c3aed);color:#fff;font-size:24px;font-weight:bold;">📊</div>
          </td>
        </tr>
        <tr>
          <td align="center" style="color:#f8fafc;font-size:22px;font-weight:700;padding-bottom:8px;">
            ${title}
          </td>
        </tr>
        ${bodyHtml}
        <tr>
          <td align="center" style="padding-top:32px;border-top:1px solid rgba(255,255,255,0.08);">
            <p style="margin:0;color:#64748b;font-size:12px;">Financial Dashboard — Laporan Keuangan</p>
            <p style="margin:4px 0 0;color:#475569;font-size:11px;">Email ini dikirim secara otomatis. Jangan balas email ini.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

// ─── Send Verification Email ───────────────────────────────────────
export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${APP_URL}/verify-email?token=${token}`;

  const bodyHtml = `
    <tr>
      <td align="center" style="color:#94a3b8;font-size:14px;line-height:1.6;padding-bottom:28px;">
        Terima kasih telah mendaftar! Silakan verifikasi alamat email Anda dengan mengklik tombol di bawah ini.
      </td>
    </tr>
    <tr>
      <td align="center" style="padding-bottom:28px;">
        <a href="${verificationUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#6366f1,#7c3aed);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px;box-shadow:0 4px 14px rgba(99,102,241,0.35);">
          Verifikasi Email Saya
        </a>
      </td>
    </tr>
    <tr>
      <td align="center" style="color:#64748b;font-size:12px;line-height:1.5;">
        Link ini akan kedaluwarsa dalam <strong style="color:#94a3b8;">24 jam</strong>.<br/>
        Jika Anda tidak mendaftar akun ini, abaikan email ini.
      </td>
    </tr>
  `;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Verifikasi Email Anda — Financial Dashboard",
    html: baseTemplate("Verifikasi Email Anda", bodyHtml),
  });
}

// ─── Send Password Reset Email ─────────────────────────────────────
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  const bodyHtml = `
    <tr>
      <td align="center" style="color:#94a3b8;font-size:14px;line-height:1.6;padding-bottom:28px;">
        Kami menerima permintaan untuk mereset password akun Anda. Klik tombol di bawah untuk membuat password baru.
      </td>
    </tr>
    <tr>
      <td align="center" style="padding-bottom:28px;">
        <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#6366f1,#7c3aed);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px;box-shadow:0 4px 14px rgba(99,102,241,0.35);">
          Reset Password
        </a>
      </td>
    </tr>
    <tr>
      <td align="center" style="color:#64748b;font-size:12px;line-height:1.5;">
        Link ini akan kedaluwarsa dalam <strong style="color:#94a3b8;">1 jam</strong>.<br/>
        Jika Anda tidak meminta reset password, abaikan email ini.
      </td>
    </tr>
  `;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Reset Password — Financial Dashboard",
    html: baseTemplate("Reset Password", bodyHtml),
  });
}
