import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

function getSecret() {
  const s = process.env.JWT_SECRET || 'terra-mais-fallback-secret-2025-dev'
  return new TextEncoder().encode(s)
}

export interface JWTPayload {
  userId: string
  email: string
  role: 'ADMIN' | 'CUSTOMER'
}

export async function signToken(payload: JWTPayload): Promise<string> {
  const { userId, email, role } = payload
  return new SignJWT({ userId, email, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as 'ADMIN' | 'CUSTOMER',
    }
  } catch {
    return null
  }
}

export async function getAuthUser(): Promise<JWTPayload | null> {
  try {
    const store = await cookies()
    const token = store.get('auth-token')?.value
    if (!token) return null
    return verifyToken(token)
  } catch {
    return null
  }
}

export async function requireAdmin(): Promise<JWTPayload> {
  const user = await getAuthUser()
  if (!user || user.role !== 'ADMIN') throw new Error('Unauthorized')
  return user
}