import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/ui/navigation";
import { AddExpenseForm } from "@/components/add-expense-form";
import { ExpenseCard, type Expense } from "@/components/expense-card";
import { SpendingInsights } from "@/components/spending-insights";
import { Plus, LayoutDashboard, BarChart3, Settings, Receipt } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import logo from "@/assets/logo.png";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAddForm, setShowAddForm] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([
    // Sample data
    {
      id: "1",
      storeName: "Big Bazaar",
      amount: 1250.00,
      date: "2024-01-15",
      category: "Groceries",
      items: ["Rice", "Dal", "Oil", "Vegetables"],
    },
    {
      id: "2", 
      storeName: "Swiggy",
      amount: 450.00,
      date: "2024-01-14",
      category: "Food & Dining",
      items: ["Biryani", "Raita"],
      splitWith: 2,
      userPortion: 225.00,
    },
    {
      id: "3",
      storeName: "Metro Station",
      amount: 50.00,
      date: "2024-01-14",
      category: "Transportation",
    }
  ]);
  const { toast } = useToast();

  const handleAddExpense = (newExpense: Omit<Expense, 'id'>) => {
    const expense: Expense = {
      ...newExpense,
      id: Date.now().toString(),
    };
    setExpenses([expense, ...expenses]);
    setShowAddForm(false);
  };

  const handleEditExpense = (expense: Expense) => {
    toast({
      title: "Edit Feature",
      description: "Edit functionality coming soon!",
    });
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
    toast({
      title: "Expense Deleted",
      description: "The expense has been removed successfully.",
    });
  };

  const navigationItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      current: activeTab === "dashboard",
      onClick: () => setActiveTab("dashboard"),
    },
    {
      name: "Insights",
      icon: BarChart3,
      current: activeTab === "insights",
      onClick: () => setActiveTab("insights"),
    },
    {
      name: "Settings",
      icon: Settings,
      current: activeTab === "settings",
      onClick: () => setActiveTab("settings"),
    },
  ];

  const totalSpent = expenses.reduce((sum, expense) => sum + (expense.userPortion || expense.amount), 0);
  const thisMonth = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const currentMonth = new Date().getMonth();
    return expenseDate.getMonth() === currentMonth;
  });
  const monthlyTotal = thisMonth.reduce((sum, expense) => sum + (expense.userPortion || expense.amount), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="ManiTracker" className="w-10 h-10" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  ManiTracker
                </h1>
                <p className="text-xs text-muted-foreground">Smart Expense Tracking</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-lg font-bold text-foreground">₹{monthlyTotal.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 card-beautiful">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold text-foreground">{expenses.length}</p>
                </div>
              </Card>
              <Card className="p-4 card-beautiful">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold text-primary">₹{totalSpent.toFixed(2)}</p>
                </div>
              </Card>
              <Card className="p-4 card-beautiful">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Avg per Day</p>
                  <p className="text-2xl font-bold text-foreground">
                    ₹{expenses.length > 0 ? (totalSpent / Math.max(1, 7)).toFixed(2) : "0.00"}
                  </p>
                </div>
              </Card>
            </div>

            {/* Add Expense Button */}
            {!showAddForm && (
              <Button
                onClick={() => setShowAddForm(true)}
                className="w-full button-glow"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Expense
              </Button>
            )}

            {/* Add Expense Form */}
            {showAddForm && (
              <AddExpenseForm
                onAddExpense={handleAddExpense}
                onCancel={() => setShowAddForm(false)}
              />
            )}

            {/* Recent Expenses */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Recent Expenses</h2>
                <Receipt className="h-5 w-5 text-muted-foreground" />
              </div>
              
              <div className="space-y-3">
                {expenses.length === 0 ? (
                  <Card className="p-8 card-beautiful text-center">
                    <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Expenses Yet</h3>
                    <p className="text-muted-foreground">Start tracking your expenses by adding your first one!</p>
                  </Card>
                ) : (
                  expenses.map((expense) => (
                    <ExpenseCard
                      key={expense.id}
                      expense={expense}
                      onEdit={handleEditExpense}
                      onDelete={handleDeleteExpense}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "insights" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Spending Insights</h2>
            </div>
            <SpendingInsights expenses={expenses} />
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <Card className="p-6 card-beautiful text-center">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Settings Coming Soon</h3>
              <p className="text-muted-foreground">
                Customize your ManiTracker experience with budget limits, categories, and more!
              </p>
            </Card>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-sm border-t border-border/50">
        <div className="max-w-4xl mx-auto">
          <Navigation items={navigationItems} />
        </div>
      </div>

      {/* Bottom padding for navigation */}
      <div className="h-20"></div>
    </div>
  );
};

export default Index;
