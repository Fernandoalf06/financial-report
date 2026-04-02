/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
import bcrypt from 'bcryptjs'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')



  // 1. Create Super Admin
  const passwordHash = await bcrypt.hash('superadmin123', 10)
  const superAdmin = await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: {
      username: 'superadmin',
      passwordHash,
      globalRole: 'SUPERADMIN',
    },
  })
  console.log(`Global Super Admin created: ${superAdmin.username}`)

  // 2. Create Default Division "Pusat"
  const divisionPusat = await prisma.division.upsert({
    where: { name: 'Kantor Pusat' },
    update: {},
    create: {
      name: 'Kantor Pusat',
    },
  })
  console.log(`Division created: ${divisionPusat.name}`)

  // 3. Create Head of Division User
  const headPassword = await bcrypt.hash('admin123', 10)
  const headUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: headPassword,
      globalRole: 'USER',
      divisionRole: 'HEAD',
      divisionId: divisionPusat.id
    },
  })
  console.log(`Division Head created: ${headUser.username}`)

  // 4. Create Default Categories for Division
  const defaultCategories = [
    { name: 'Operasional', color: '#6366f1' },
    { name: 'Gaji', color: '#f43f5e' },
    { name: 'Pemasaran', color: '#eab308' },
    { name: 'Utilitas', color: '#8b5cf6' },
    { name: 'Penjualan', color: '#10b981' },
  ]

  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { name_divisionId: { name: cat.name, divisionId: divisionPusat.id } },
      update: {},
      create: {
        ...cat,
        divisionId: divisionPusat.id
      },
    })
  }
  console.log('Categories seeded successfully')
}

main()
  .catch((e: any) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
