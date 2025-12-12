// lib/projection-calculator.ts
import { supabase } from './supabase'

interface CalculateProjectionsParams {
  userId: string
  currentAssets: number
  currentLiabilities: number
  monthlyIncome: number
  monthlyExpenses: number
  monthlySavings?: number
}

export async function calculateAndSaveProjections({
  userId,
  currentAssets,
  currentLiabilities,
  monthlyIncome,
  monthlyExpenses,
  monthlySavings
}: CalculateProjectionsParams) {
  const currentYear = new Date().getFullYear()
  const projections = []
  
  // Calculate monthly savings if not provided
  const savingsRate = monthlySavings || (monthlyIncome - monthlyExpenses)
  const annualSavings = savingsRate * 12
  
  // Assumptions
  const assetGrowthRate = 0.12 // 12% annual return on investments
  const liabilityReductionRate = 0.10 // 10% annual debt reduction
  
  let projectedAssets = currentAssets
  let projectedLiabilities = currentLiabilities

  for (let i = 0; i < 10; i++) {
    const year = currentYear + i
    const yearNumber = i + 1
    
    // Grow assets (existing assets + new savings with compound growth)
    projectedAssets = (projectedAssets * (1 + assetGrowthRate)) + annualSavings
    
    // Reduce liabilities (assuming consistent debt repayment)
    projectedLiabilities = Math.max(0, projectedLiabilities * (1 - liabilityReductionRate))
    
    const netWorth = projectedAssets - projectedLiabilities
    
    projections.push({
      user_id: userId,
      year: year,
      year_number: yearNumber,
      investment_corpus: projectedAssets,
      assets_value: projectedAssets,
      liabilities_value: projectedLiabilities,
      net_worth: netWorth
    })
  }

  // Delete existing projections for this user
  await supabase
    .from('projections')
    .delete()
    .eq('user_id', userId)

  // Insert new projections
  const { error } = await supabase
    .from('projections')
    .insert(projections)

  if (error) {
    console.error('Error saving projections:', error)
    return { success: false, error }
  }

  return { success: true, projections }
}

// Function to recalculate projections when financial data changes
export async function recalculateUserProjections(userId: string) {
  try {
    // Fetch current financial data
    const [balance, assets, liabilities] = await Promise.all([
      supabase.from('account_balance').select('*').eq('user_id', userId).single(),
      supabase.from('assets').select('*').eq('user_id', userId),
      supabase.from('liabilities').select('*').eq('user_id', userId)
    ])

    const totalAssets = assets.data?.reduce((sum, a) => sum + a.value, 0) || 0
    const totalLiabilities = liabilities.data?.reduce((sum, l) => sum + (l.outstanding_amount || l.total_amount), 0) || 0
    
    // Get monthly income/expenses from transactions (last 30 days average)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data: recentTxns } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgo.toISOString())

    const monthlyIncome = recentTxns?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || balance.data?.total_income || 0
    const monthlyExpenses = recentTxns?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || balance.data?.total_expenses || 0

    return await calculateAndSaveProjections({
      userId,
      currentAssets: totalAssets,
      currentLiabilities: totalLiabilities,
      monthlyIncome,
      monthlyExpenses
    })
  } catch (error) {
    console.error('Error recalculating projections:', error)
    return { success: false, error }
  }
}