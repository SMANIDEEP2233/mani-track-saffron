import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, Target } from "lucide-react";
import { formatCurrency, type Currency } from "./currency-selector";
import type { Expense } from "./expense-card";

interface SpendingInsightsProps {
  expenses: Expense[];
}

export function SpendingInsights({ expenses }: SpendingInsightsProps) {
  // Detect if we have mixed currencies
  const currencies = [...new Set(expenses.map(expense => expense.currency || 'USD'))];
  const hasMixedCurrencies = currencies.length > 1;
  const primaryCurrency = currencies[0] || 'USD';
  
  // Calculate insights (note: amounts are summed directly without conversion)
  const totalSpent = expenses.reduce((sum, expense) => sum + (expense.user_portion || expense.amount), 0);
  const avgDaily = expenses.length > 0 ? totalSpent / Math.max(1, getDaysSinceFirstExpense(expenses)) : 0;
  
  // Top spending stores
  const storeSpending = expenses.reduce((acc, expense) => {
    const amount = expense.user_portion || expense.amount;
    acc[expense.store_name] = (acc[expense.store_name] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);
  
  const topStores = Object.entries(storeSpending)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  // Category spending
  const categorySpending = expenses.reduce((acc, expense) => {
    const category = expense.category || 'Other';
    const amount = expense.user_portion || expense.amount;
    acc[category] = (acc[category] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categorySpending)
    .sort(([, a], [, b]) => b - a)[0];

  // Recent spending trend (last 7 days vs previous 7 days)
  const last7Days = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return expenseDate >= weekAgo;
  });

  const previous7Days = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return expenseDate >= twoWeeksAgo && expenseDate < weekAgo;
  });

  const last7DaysTotal = last7Days.reduce((sum, expense) => sum + (expense.user_portion || expense.amount), 0);
  const previous7DaysTotal = previous7Days.reduce((sum, expense) => sum + (expense.user_portion || expense.amount), 0);
  const trendChange = previous7DaysTotal > 0 ? ((last7DaysTotal - previous7DaysTotal) / previous7DaysTotal) * 100 : 0;

  if (expenses.length === 0) {
    return (
      <Card className="p-6 card-beautiful">
        <div className="text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Spending Data Yet</h3>
          <p className="text-muted-foreground">Add some expenses to see insights and recommendations!</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {hasMixedCurrencies && (
        <Card className="p-4 card-beautiful border-orange-200 bg-orange-50/50">
          <div className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-sm">
              Mixed currencies detected ({currencies.join(', ')}). Amounts are summed without conversion.
            </p>
          </div>
        </Card>
      )}
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 card-beautiful">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold text-foreground">
                {hasMixedCurrencies ? `~${totalSpent.toFixed(2)}` : formatCurrency(totalSpent, primaryCurrency as Currency)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4 card-beautiful">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Daily Average</p>
              <p className="text-2xl font-bold text-foreground">
                {hasMixedCurrencies ? `~${avgDaily.toFixed(2)}` : formatCurrency(avgDaily, primaryCurrency as Currency)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Target className="h-5 w-5 text-accent-foreground" />
            </div>
          </div>
        </Card>

        <Card className="p-4 card-beautiful">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Weekly Trend</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-foreground">
                  {trendChange >= 0 ? '+' : ''}{trendChange.toFixed(1)}%
                </p>
                {trendChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-destructive" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-600" />
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Spending Categories & Stores */}
      <Card className="p-6 card-beautiful">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          Spending Insights
        </h3>
        
        <div className="space-y-4">
          {topCategory && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Top Category</p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-sm">
                  {topCategory[0]}
                </Badge>
                <span className="font-semibold">
                  {hasMixedCurrencies ? `~${topCategory[1].toFixed(2)}` : formatCurrency(topCategory[1], primaryCurrency as Currency)}
                </span>
              </div>
            </div>
          )}

          {topStores.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Top Spending Stores</p>
              <div className="space-y-2">
                {topStores.map(([store, amount], index) => (
                  <div key={store} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium">{store}</span>
                    </div>
                    <span className="font-semibold">
                      {hasMixedCurrencies ? `~${amount.toFixed(2)}` : formatCurrency(amount, primaryCurrency as Currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
            <h4 className="font-semibold text-foreground mb-2">💡 Money-Saving Suggestions</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {topCategory && topCategory[1] > totalSpent * 0.3 && (
                <li>• Consider reducing spending in {topCategory[0]} - it's {((topCategory[1] / totalSpent) * 100).toFixed(1)}% of your total</li>
              )}
              {topStores[0] && topStores[0][1] > totalSpent * 0.25 && (
                <li>• You spend a lot at {topStores[0][0]} - look for alternatives or bulk discounts</li>
              )}
              {avgDaily > 500 && (
                <li>• Your daily average is high - setting a daily budget might help</li>
              )}
              {trendChange > 20 && (
                <li>• Your spending increased by {trendChange.toFixed(1)}% this week - try to identify unnecessary expenses</li>
              )}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

function getDaysSinceFirstExpense(expenses: Expense[]): number {
  if (expenses.length === 0) return 1;
  
  const dates = expenses.map(expense => new Date(expense.date));
  const firstDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const today = new Date();
  
  const diffTime = Math.abs(today.getTime() - firstDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(1, diffDays);
}