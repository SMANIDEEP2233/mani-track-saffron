-- Add currency field to expenses table with default USD
ALTER TABLE public.expenses ADD COLUMN currency text DEFAULT 'USD' NOT NULL;

-- Update all existing records to have USD currency
UPDATE public.expenses SET currency = 'USD' WHERE currency IS NULL;