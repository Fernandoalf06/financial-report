# 🪙 Financial Report & Budgeting System

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

A professional, multi-tenant financial management ecosystem designed for businesses and organizations to track, budget, and visualize their financial health with precision.

---

## ✨ Key Features

### 🏢 Multi-Tenancy & Governance
- **Division-Based Scoping:** Each division (department, branch, or team) has its own isolated financial data, categories, and budgets.
- **Granular RBAC (Role-Based Access Control):**
  - **Global Roles:** `SUPERADMIN` for system-wide management and `USER` for standard access.
  - **Division Roles:** `HEAD` (Managerial), `EDITOR` (Operational), and `VIEWER` (Read-only).

### 📊 Financial Operations
- **Income & Expense Tracking:** Log transactions with detailed descriptions, dates, and receipt attachments.
- **Automated Recurring Transactions:** Set up DAILY, WEEKLY, or MONTHLY repeaters for fixed costs or periodic income.
- **Dynamic Category Management:** Custom categories with unique color coding per division.

### 🎯 Strategic Planning
- **Budgeting System:** Set specific spending limits per category for defined periods.
- **Financial Goals:** Track savings or investment progress with visual progress bars.
- **Real-time Analytics:** Visual data representations using **Recharts** to identify spending trends and income patterns.

### 🛡️ Compliance & Reporting
- **Audit Trails:** Every creation, update, or deletion is logged with user and timestamp details for full transparency.
- **PDF Export:** Generate professional financial reports directly to PDF for offline review and distribution.

---

## 🛠️ Tech Stack

- **Frontend:** [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/), [Shadcn/UI](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (via [Supabase](https://supabase.com/))
- **ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** [NextAuth.js v5 (Beta)](https://authjs.dev/)
- **Visualization:** [Recharts](https://recharts.org/)
- **Reporting:** [jsPDF](https://github.com/parallax/jsPDF)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js:** 18.x or higher
- **PostgreSQL Database:** (Recommended: Supabase)
- **Package Manager:** `npm` (also compatible with `yarn`, `pnpm`, `bun`)

### 1. Clone the repository
```bash
git clone https://github.com/Fernandoalf06/financial-report.git
cd financial-report
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your credentials.
```bash
cp .env.example .env
```

### 4. Database Setup
Ensure your `DATABASE_URL` is configured, then run:
```bash
npx prisma db push
npm run postinstall # to generate prisma client
```
*(Optional) Seed initial data if available:*
```bash
npx prisma db seed
```

### 5. Run Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to access the application.

---

## 🔑 Environment Variables

The project requires the following environment variables to be set:

| Variable | Description |
| :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string for Prisma. |
| `DIRECT_URL` | Direct connection string for Prisma migrations (Supabase usage). |
| `AUTH_SECRET` | Secret key for NextAuth encryption. |

---

## 📂 Project Structure

```text
├── actions/         # Server Actions for form submissions & API calls
├── app/             # Next.js App Router (Pages, Layouts, API)
├── components/      # Reusable UI components (shadcn/ui + custom)
├── contexts/        # React Context providers
├── lib/             # Utility libraries (Prisma client, Auth config)
├── prisma/          # Database schema and migration files
├── public/          # Static assets (images, icons)
└── utils/           # Helper functions and business logic
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---
<p align="center">Made with ❤️ for better financial management</p>
