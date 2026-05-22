import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from './db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        let user
        try {
          user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: {
            regionAssignments: true,
            clinicAssignments: true,
          },
          })
        } catch (e) {
          console.error('Database error on login:', e)
          throw new Error(
            'Database not ready. In terminal run: npm run db:setup'
          )
        }

        if (!user) throw new Error('Invalid email or password')
        if (!user.isActive) throw new Error('Account deactivated. Contact your administrator.')

        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) throw new Error('Invalid email or password')

        await db.auditLog.create({
          data: {
            userId: user.id,
            action: 'LOGIN',
            entity: 'User',
            entityId: user.id,
          },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          regionIds: user.regionAssignments.map(r => r.regionId),
          clinicIds: user.clinicAssignments.map(c => c.clinicId),
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.regionIds = user.regionIds
        token.clinicIds = user.clinicIds
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.regionIds = token.regionIds
        session.user.clinicIds = token.clinicIds
      }
      return session
    },
  },
  pages: { signIn: '/login', error: '/login' },
  session: { strategy: 'jwt', maxAge: 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
}
