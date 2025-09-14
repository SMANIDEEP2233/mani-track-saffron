import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Plus, Camera } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { CameraScanner } from "./camera-scanner";
import { CurrencySelector, type Currency, getCurrencySymbol } from "./currency-selector";
import type { Expense } from "./expense-card";

interface AddExpenseFormProps {
  onAddExpense: (expense: {
    storeName: string;
    amount: number;
    date: string;
    category?: string;
    items?: string[];
    splitWith?: number;
    userPortion?: number;
    currency: Currency;
  }) => void;
  onCancel?: () => void;
}

const categories = [
  "Food & Dining",
  "Shopping",
  "Transportation",
  "Bills & Utilities",
  "Healthcare",
  "Entertainment",
  "Groceries",
  "Other"
];

export function AddExpenseForm({ onAddExpense, onCancel }: AddExpenseFormProps) {
  const { toast } = useToast();
  const [showScanner, setShowScanner] = useState(false);
  const [formData, setFormData] = useState({
    storeName: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    category: "",
    items: "",
    isSplit: false,
    splitWith: "",
    currency: 'USD' as Currency,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.storeName || !formData.amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in store name and amount",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    const splitWith = formData.isSplit ? parseInt(formData.splitWith) || 2 : undefined;
    const userPortion = splitWith ? amount / splitWith : undefined;

    const expense = {
      storeName: formData.storeName,
      amount,
      date: formData.date,
      category: formData.category || undefined,
      items: formData.items ? formData.items.split(',').map(item => item.trim()) : undefined,
      splitWith,
      userPortion,
      currency: formData.currency,
    };

    onAddExpense(expense);
    
    // Reset form
    setFormData({
      storeName: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      category: "",
      items: "",
      isSplit: false,
      splitWith: "",
      currency: 'USD' as Currency,
    });

    const currencySymbol = getCurrencySymbol(formData.currency);
    toast({
      title: "Expense Added",
      description: `Successfully added expense for ${currencySymbol}${userPortion ? userPortion.toFixed(2) : amount.toFixed(2)}`,
    });
  };

  const handleScanComplete = (scannedData: any) => {
    // Pre-fill form with scanned data
    setFormData(prev => ({
      ...prev,
      storeName: scannedData.storeName || prev.storeName,
      amount: scannedData.amount ? scannedData.amount.toString() : prev.amount,
      items: scannedData.items ? scannedData.items.join(', ') : prev.items,
    }));
    
    setShowScanner(false);
    
    toast({
      title: "Receipt Scanned!",
      description: "Form has been pre-filled with the scanned data. Please review and submit.",
    });
  };

  const currencySymbol = getCurrencySymbol(formData.currency);

  if (showScanner) {
    return (
      <CameraScanner
        onScanComplete={handleScanComplete}
        onClose={() => setShowScanner(false)}
      />
    );
  }

  return (
    <Card className="p-6 card-beautiful">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Add New Expense</h2>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 button-glow"
          onClick={() => setShowScanner(true)}
        >
          <Camera className="h-4 w-4" />
          Scan Receipt
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="storeName">Store Name *</Label>
            <Input
              id="storeName"
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              placeholder="e.g., Big Bazaar, Swiggy"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ({currencySymbol}) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="items">Items (comma separated)</Label>
          <Textarea
            id="items"
            value={formData.items}
            onChange={(e) => setFormData({ ...formData, items: e.target.value })}
            placeholder="e.g., Milk, Bread, Eggs"
            rows={2}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-accent/20 border border-accent">
          <div className="space-y-1">
            <Label htmlFor="split">Split Bill</Label>
            <p className="text-sm text-muted-foreground">
              Divide this expense among multiple people
            </p>
          </div>
          <Switch
            id="split"
            checked={formData.isSplit}
            onCheckedChange={(checked) => 
              setFormData({ ...formData, isSplit: checked, splitWith: checked ? "2" : "" })
            }
          />
        </div>

        {formData.isSplit && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <CurrencySelector
                currency={formData.currency}
                onCurrencyChange={(currency) => setFormData({ ...formData, currency })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="splitWith">Split between how many people?</Label>
              <Input
                id="splitWith"
                type="number"
                min="2"
                value={formData.splitWith}
                onChange={(e) => setFormData({ ...formData, splitWith: e.target.value })}
                placeholder="2"
              />
              {formData.splitWith && formData.amount && (
                <p className="text-sm text-muted-foreground">
                  Your share: {currencySymbol}{(parseFloat(formData.amount) / parseInt(formData.splitWith)).toFixed(2)}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1 button-glow">
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}