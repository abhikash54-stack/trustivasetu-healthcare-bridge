import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()
const u = await db.user.findUnique({ where: { email: 'admin@trustivasetu.com' } })
console.log('user found:', Boolean(u))
if (u) console.log('password ok:', bcrypt.compareSync('Admin@123', u.password))
await db.$disconnect()
