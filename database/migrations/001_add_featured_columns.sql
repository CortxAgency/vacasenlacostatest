-- Add columns for Featured System
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS featured_until timestamptz,
ADD COLUMN IF NOT EXISTS last_payment_id text;

-- Create index for faster querying of active featured properties
CREATE INDEX IF NOT EXISTS idx_properties_featured_until ON public.properties (featured_until);

-- Comment on columns
COMMENT ON COLUMN public.properties.featured_until IS 'Date until the property remains featured';
COMMENT ON COLUMN public.properties.last_payment_id IS 'MercadoPago Payment ID for audit';
