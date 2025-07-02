import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { type SuccessResponse } from '@/lib/schemas'
import { createApiHandler, validateBody, ApiError } from '@/lib/api-utils'
import { getUserFromRequest } from '@/lib/auth-utils'
import { supabaseAdmin } from '@/lib/supabase'

const BulkDeleteSchema = z.object({
  transactionIds: z.array(z.string().uuid()).min(1),
})

// POST /api/transactions/bulk-delete - Delete multiple transactions
export const POST = createApiHandler(async (req: NextRequest) => {
  const user = await getUserFromRequest(req)
  if (!user) {
    throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED')
  }

  const { transactionIds } = await validateBody(BulkDeleteSchema, req)

  const { error } = await supabaseAdmin
    .from('transactions')
    .delete()
    .in('id', transactionIds)
    .eq('user_id', user.id)

  if (error) {
    throw new ApiError('Failed to delete transactions', 500, 'DATABASE_ERROR', error)
  }

  const response: SuccessResponse<{ deletedCount: number }> = {
    success: true,
    data: { deletedCount: transactionIds.length },
    message: `${transactionIds.length} transactions deleted successfully`,
  }

  return NextResponse.json(response)
})
