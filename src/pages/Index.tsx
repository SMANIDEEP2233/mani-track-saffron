import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BarChart3, Settings, Wallet, TrendingUp, LogOut } from "lucide-react";
import { AddExpenseForm } from "@/components/add-expense-form";
import { ExpenseCard, type Expense } from "@/components/expense-card";
import { SpendingInsights } from "@/components/spending-insights";
import { CurrencySelector, type Currency, formatCurrency } from "@/components/currency-selector";
import { AuthForm } from "@/components/auth/auth-form";
import { ApiKeySettings } from "@/components/api-key-settings";
import { useExpenses } from "@/hooks/use-expenses";
import { supabase } from "@/integrations/supabase/client";
import logoImage from "@/assets/logo.png";

export default function Index() {
  // State management
  const [activeTab, setActiveTab] = useState<'dashboard' | 'insights' | 'settings'>('dashboard');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('INR');
  const { expenses, loading, user, addExpense, updateExpense, deleteExpense } = useExpenses();

  // Show auth form if user is not logged in
  if (!user) {
    return <AuthForm />;
  }

  // Event handlers
  const handleAddExpense = async (newExpense: {
    storeName: string;
    amount: number;
    date: string;
    category?: string;
    items?: string[];
    splitWith?: number;
    userPortion?: number;
  }) => {
    await addExpense(newExpense);
    setShowAddExpense(false);
  };

  const handleEditExpense = (expense: Expense) => {
    // TODO: Implement edit functionality
    console.log('Edit expense:', expense);
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpense(id);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // Navigation items
  const navigationItems = [
    { name: 'Dashboard', tab: 'dashboard' as const, icon: Wallet },
    { name: 'Insights', tab: 'insights' as const, icon: BarChart3 },
    { name: 'Settings', tab: 'settings' as const, icon: Settings },
  ];

  // Calculate totals
  const totalSpent = expenses.reduce((sum, expense) => sum + (expense.user_portion || expense.amount), 0);
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === new Date().getMonth() && 
           expenseDate.getFullYear() === new Date().getFullYear();
  });
  const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + (expense.user_portion || expense.amount), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 pb-20">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <img 
                  src={logoImage} 
                  alt="ManiTracker Logo" 
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">ManiTracker</h1>
                <p className="text-xs text-muted-foreground">Track your expenses</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <CurrencySelector 
                currency={selectedCurrency} 
                onCurrencyChange={setSelectedCurrency}
                className="w-[100px]"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Monthly Summary */}
          <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{currentMonth} {currentYear}</span>
              </div>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(monthlyTotal, selectedCurrency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-4 card-beautiful">
                <CardContent className="p-0 text-center">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-bold text-foreground">{expenses.length}</p>
                </CardContent>
              </Card>
              <Card className="p-4 card-beautiful">
                <CardContent className="p-0 text-center">
                  <p className="text-xs text-muted-foreground">Spent</p>
                  <p className="text-lg font-bold text-primary">{formatCurrency(totalSpent, selectedCurrency)}</p>
                </CardContent>
              </Card>
              <Card className="p-4 card-beautiful">
                <CardContent className="p-0 text-center">
                  <p className="text-xs text-muted-foreground">Avg/Day</p>
                  <p className="text-lg font-bold text-foreground">
                    {expenses.length > 0 ? formatCurrency(totalSpent / Math.max(1, 7), selectedCurrency) : formatCurrency(0, selectedCurrency)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Add Expense Button */}
            {!showAddExpense && (
              <Button
                onClick={() => setShowAddExpense(true)}
                className="w-full button-glow"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Expense
              </Button>
            )}

            {/* Add Expense Form */}
            {showAddExpense && (
              <AddExpenseForm
                onAddExpense={handleAddExpense}
                onCancel={() => setShowAddExpense(false)}
                currency={selectedCurrency}
              />
            )}

            {/* Recent Expenses */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Recent Expenses</h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading expenses...</p>
                </div>
              ) : expenses.length === 0 ? (
                <Card className="p-8 card-beautiful text-center">
                  <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Expenses Yet</h3>
                  <p className="text-muted-foreground">Start tracking by adding your first expense!</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {expenses.map((expense) => (
                    <ExpenseCard
                      key={expense.id}
                      expense={expense}
                      onEdit={handleEditExpense}
                      onDelete={handleDeleteExpense}
                      currency={selectedCurrency}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'insights' && <SpendingInsights expenses={expenses} currency={selectedCurrency} />}

        {activeTab === 'settings' && <ApiKeySettings />}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-border/50 z-50">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex justify-around">
            {navigationItems.map((item) => (
              <Button
                key={item.name}
                variant={activeTab === item.tab ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(item.tab)}
                className="flex flex-col items-center gap-1 h-auto py-2 px-3"
              >
                <item.icon className="h-4 w-4" />
                <span className="text-xs">{item.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
