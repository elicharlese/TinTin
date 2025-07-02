import { NextRequest, NextResponse } from 'next/server'
import { 
  UpdateTransactionSchema,
  type SuccessResponse,
  type Transaction 
} from '@/lib/schemas'
import { createApiHandler, validateBody, ApiError } from '@/lib/api-utils'
import { getUserFromRequest } from '@/lib/auth-utils'
import { supabaseAdmin } from '@/lib/supabase'

interface RouteParams {
  params: { id: string }
}

// GET /api/transactions/[id] - Get specific transaction
export const GET = createApiHandler(async (req: NextRequest, { params }: RouteParams) => {
  const user = await getUserFromRequest(req)
  if (!user) {
    throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED')
  }

  const { data, error } = await supabaseAdmin
    .from('transactions')
    .select('*, accounts(name), categories(name)')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new ApiError('Transaction not found', 404, 'NOT_FOUND')
    }
    throw new ApiError('Failed to fetch transaction', 500, 'DATABASE_ERROR', error)
  }

  const response: SuccessResponse<Transaction> = {
    success: true,
    data,
  }

  return NextResponse.json(response)
})

// PUT /api/transactions/[id] - Update transaction
export const PUT = createApiHandler(async (req: NextRequest, { params }: RouteParams) => {
  const user = await getUserFromRequest(req)
  if (!user) {
    throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED')
  }

  const updateData = await validateBody(UpdateTransactionSchema, req)

  const { data, error } = await supabaseAdmin
    .from('transactions')
    .update(updateData)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new ApiError('Transaction not found', 404, 'NOT_FOUND')
    }
    throw new ApiError('Failed to update transaction', 500, 'DATABASE_ERROR', error)
  }

  const response: SuccessResponse<Transaction> = {
    success: true,
    data,
    message: 'Transaction updated successfully',
  }

  return NextResponse.json(response)
})

// DELETE /api/transactions/[id] - Delete transaction
export const DELETE = createApiHandler(async (req: NextRequest, { params }: RouteParams) => {
  const user = await getUserFromRequest(req)
  if (!user) {
    throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED')
  }

  const { error } = await supabaseAdmin
    .from('transactions')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id)

  if (error) {
    throw new ApiError('Failed to delete transaction', 500, 'DATABASE_ERROR', error)
  }

  const response: SuccessResponse<null> = {
    success: true,
    data: null,
    message: 'Transaction deleted successfully',
  }

  return NextResponse.json(response)
})
