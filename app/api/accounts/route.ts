import { NextRequest, NextResponse } from 'next/server'
import { 
  CreateAccountSchema,
  type SuccessResponse,
  type PaginatedResponse,
  type Account 
} from '@/lib/schemas'
import { createApiHandler, validateBody, ApiError } from '@/lib/api-utils'
import { getUserFromRequest } from '@/lib/auth-utils'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/accounts - List all accounts
export const GET = createApiHandler(async (req: NextRequest) => {
  const user = await getUserFromRequest(req)
  if (!user) {
    throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED')
  }

  const { data, error } = await supabaseAdmin
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('name')

  if (error) {
    throw new ApiError('Failed to fetch accounts', 500, 'DATABASE_ERROR', error)
  }

  const response: SuccessResponse<Account[]> = {
    success: true,
    data: data || [],
  }

  return NextResponse.json(response)
})

// POST /api/accounts - Create new account
export const POST = createApiHandler(async (req: NextRequest) => {
  const user = await getUserFromRequest(req)
  if (!user) {
    throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED')
  }

  const accountData = await validateBody(CreateAccountSchema, req)
  
  const { data, error } = await supabaseAdmin
    .from('accounts')
    .insert({
      ...accountData,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    throw new ApiError('Failed to create account', 500, 'DATABASE_ERROR', error)
  }

  const response: SuccessResponse<Account> = {
    success: true,
    data,
    message: 'Account created successfully',
  }

  return NextResponse.json(response, { status: 201 })
})
