import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { 
  TransactionQuerySchema, 
  CreateTransactionSchema, 
  UpdateTransactionSchema,
  type SuccessResponse,
  type PaginatedResponse,
  type Transaction 
} from '@/lib/schemas'
import { createApiHandler, validateQuery, validateBody, ApiError } from '@/lib/api-utils'
import { getUserFromRequest } from '@/lib/auth-utils'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/transactions - List transactions with filtering and pagination
export const GET = createApiHandler(async (req: NextRequest) => {
  const user = await getUserFromRequest(req)
  if (!user) {
    throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED')
  }

  const query = validateQuery(TransactionQuerySchema, req.nextUrl.searchParams)
  
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  
  let supabaseQuery = supabase
    .from('transactions')
    .select('*, accounts(name), categories(name), tags(name)', { count: 'exact' })
    .eq('user_id', user.id)
    .order(query.sortBy, { ascending: query.sortOrder === 'asc' })
    .range((page - 1) * limit, page * limit - 1)

  // Apply filters
  if (query.search) {
    supabaseQuery = supabaseQuery.ilike('description', `%${query.search}%`)
  }
  if (query.accountId) {
    supabaseQuery = supabaseQuery.eq('account_id', query.accountId)
  }
  if (query.categoryId) {
    supabaseQuery = supabaseQuery.eq('category_id', query.categoryId)
  }
  if (query.startDate) {
    supabaseQuery = supabaseQuery.gte('date', query.startDate)
  }
  if (query.endDate) {
    supabaseQuery = supabaseQuery.lte('date', query.endDate)
  }
  if (query.isRecurring !== undefined) {
    supabaseQuery = supabaseQuery.eq('is_recurring', query.isRecurring)
  }
  if (query.isReviewed !== undefined) {
    supabaseQuery = supabaseQuery.eq('is_reviewed', query.isReviewed)
  }

  const { data, error, count } = await supabaseQuery

  if (error) {
    throw new ApiError('Failed to fetch transactions', 500, 'DATABASE_ERROR', error)
  }

  const totalPages = Math.ceil((count || 0) / limit)

  const response: PaginatedResponse<Transaction> = {
    success: true,
    data: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages,
    },
  }

  return NextResponse.json(response)
})

// POST /api/transactions - Create new transaction
export const POST = createApiHandler(async (req: NextRequest) => {
  const user = await getUserFromRequest(req)
  if (!user) {
    throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED')
  }

  const transactionData = await validateBody(CreateTransactionSchema, req)
  
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      ...transactionData,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    throw new ApiError('Failed to create transaction', 500, 'DATABASE_ERROR', error)
  }

  const response: SuccessResponse<Transaction> = {
    success: true,
    data,
    message: 'Transaction created successfully',
  }

  return NextResponse.json(response, { status: 201 })
})
