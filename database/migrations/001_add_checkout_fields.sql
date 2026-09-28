-- =============================================================================
-- Migration: 001_add_checkout_fields.sql
-- Description: Non-destructive addition of checkout shipping and payment fields to the orders table.
-- Compatibility: Nullable columns without fake historical backfill; preserves legacy order integrity.
-- Safety: Completely non-destructive (ADD COLUMN IF NOT EXISTS, safe constraint creation, no DROP/TRUNCATE).
-- =============================================================================

-- 1. Add new checkout columns as nullable without misleading default values
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS customer_name VARCHAR(150),
    ADD COLUMN IF NOT EXISTS phone VARCHAR(30),
    ADD COLUMN IF NOT EXISTS shipping_address VARCHAR(255),
    ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100),
    ADD COLUMN IF NOT EXISTS shipping_postal_code VARCHAR(20),
    ADD COLUMN IF NOT EXISTS delivery_instructions TEXT,
    ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(50),
    ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
    ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50);

-- 2. Safely add check constraints if they do not already exist
DO $$
BEGIN
    -- Delivery method constraint: standard or express (or NULL for legacy orders)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_orders_delivery_method'
    ) THEN
        ALTER TABLE orders
            ADD CONSTRAINT chk_orders_delivery_method
            CHECK (delivery_method IS NULL OR delivery_method IN ('standard', 'express'));
    END IF;

    -- Delivery fee constraint: non-negative (or NULL for legacy orders)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_orders_delivery_fee'
    ) THEN
        ALTER TABLE orders
            ADD CONSTRAINT chk_orders_delivery_fee
            CHECK (delivery_fee IS NULL OR delivery_fee >= 0);
    END IF;

    -- Payment method constraint: cash_on_delivery or online (or NULL for legacy orders)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_orders_payment_method'
    ) THEN
        ALTER TABLE orders
            ADD CONSTRAINT chk_orders_payment_method
            CHECK (payment_method IS NULL OR payment_method IN ('cash_on_delivery', 'online'));
    END IF;

    -- Payment status constraint: pending, paid, failed, cancelled (or NULL for legacy orders)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_orders_payment_status'
    ) THEN
        ALTER TABLE orders
            ADD CONSTRAINT chk_orders_payment_status
            CHECK (payment_status IS NULL OR payment_status IN ('pending', 'paid', 'failed', 'cancelled'));
    END IF;
END $$;
