import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, IndianRupee } from "lucide-react";

export type Currency = 'INR' | 'USD';

interface CurrencySelectorProps {
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  className?: string;
}

export function CurrencySelector({ currency, onCurrencyChange, className }: CurrencySelectorProps) {
  return (
    <Select value={currency} onValueChange={(value: Currency) => onCurrencyChange(value)}>
      <SelectTrigger className={className}>
        <SelectValue>
          <div className="flex items-center gap-2">
            {currency === 'INR' ? (
              <IndianRupee className="h-4 w-4" />
            ) : (
              <DollarSign className="h-4 w-4" />
            )}
            <span>{currency}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="INR">
          <div className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4" />
            <span>INR - Indian Rupee</span>
          </div>
        </SelectItem>
        <SelectItem value="USD">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span>USD - US Dollar</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

export function getCurrencySymbol(currency: Currency): string {
  return currency === 'INR' ? '₹' : '$';
}

export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toFixed(2)}`;
}