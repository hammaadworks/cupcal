-- Migration to change Razorpay to PhonePe
ALTER TABLE public.finals_tickets 
DROP COLUMN IF EXISTS razorpay_order_id,
DROP COLUMN IF EXISTS razorpay_payment_id;

ALTER TABLE public.finals_tickets
ADD COLUMN IF NOT EXISTS phonepe_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS phonepe_provider_reference_id TEXT;
