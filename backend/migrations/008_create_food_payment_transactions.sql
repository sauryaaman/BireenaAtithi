-- -- Create food_payment_transactions table
-- -- This table tracks all payment transactions for food orders
-- -- Similar structure to payment_transactions but for food orders

-- CREATE TABLE IF NOT EXISTS food_payment_transactions (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   food_order_id UUID NOT NULL REFERENCES food_orders(id) ON DELETE CASCADE,
--   booking_id INTEGER NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
--   user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
--   amount_paid NUMERIC(10, 2) NOT NULL,
--   payment_mode VARCHAR(50) NOT NULL DEFAULT 'Cash',
--   is_refund BOOLEAN NOT NULL DEFAULT false,
--   transaction_status VARCHAR(50) NOT NULL DEFAULT 'success',
--   notes TEXT,
--   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   CONSTRAINT valid_payment_mode CHECK (payment_mode IN ('Cash', 'Card', 'UPI', 'Bank Transfer', 'Cheque')),
--   CONSTRAINT valid_transaction_status CHECK (transaction_status IN ('success', 'failed', 'cancelled'))
-- );

-- -- Create index for faster queries
-- CREATE INDEX idx_food_payment_transactions_food_order_id ON food_payment_transactions(food_order_id);
-- CREATE INDEX idx_food_payment_transactions_booking_id ON food_payment_transactions(booking_id);
-- CREATE INDEX idx_food_payment_transactions_user_id ON food_payment_transactions(user_id);
-- CREATE INDEX idx_food_payment_transactions_payment_date ON food_payment_transactions(created_at);
-- CREATE INDEX idx_food_payment_transactions_is_refund ON food_payment_transactions(is_refund);

-- -- Add payment_status column to food_orders if it doesn't exist
-- ALTER TABLE food_orders 
-- ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid',
-- ADD CONSTRAINT valid_food_payment_status CHECK (payment_status IN ('unpaid', 'partially_paid', 'paid'));

-- -- Create index for payment_status
-- CREATE INDEX IF NOT EXISTS idx_food_orders_payment_status ON food_orders(payment_status);
