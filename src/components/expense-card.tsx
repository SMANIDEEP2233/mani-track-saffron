import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Store } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, type Currency } from "./currency-selector";

export interface Expense {
  id: string;
  storeName: string;
  amount: number;
  date: string;
  items?: string[];
  splitWith?: number;
  userPortion?: number;
  category?: string;
}

interface ExpenseCardProps {
  expense: Expense;
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
  currency: Currency;
}

export function ExpenseCard({ expense, onEdit, onDelete, currency }: ExpenseCardProps) {
  const displayAmount = expense.userPortion || expense.amount;
  const isSplit = expense.splitWith && expense.splitWith > 1;

  return (
    <Card className="p-4 card-beautiful">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Store className="h-5 w-5 text-primary" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground truncate">
                {expense.storeName}
              </h3>
              <div className="text-right">
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(displayAmount, currency)}
                </p>
                {isSplit && (
                  <p className="text-xs text-muted-foreground">
                    of {formatCurrency(expense.amount, currency)}
                  </p>
                )}
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(expense.date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </p>
            
            <div className="flex items-center gap-2 mt-2">
              {isSplit && (
                <Badge variant="secondary" className="text-xs">
                  Split {expense.splitWith} ways
                </Badge>
              )}
              {expense.category && (
                <Badge variant="outline" className="text-xs">
                  {expense.category}
                </Badge>
              )}
            </div>
            
            {expense.items && expense.items.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">
                  {expense.items.slice(0, 2).join(', ')}
                  {expense.items.length > 2 && ` +${expense.items.length - 2} more`}
                </p>
              </div>
            )}
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(expense)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete?.(expense.id)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}