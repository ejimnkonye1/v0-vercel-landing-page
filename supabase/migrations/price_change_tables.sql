-- Price History Table (tracks individual user's subscription price changes)
CREATE TABLE IF NOT EXISTS price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_price DECIMAL(10,2) NOT NULL,
  new_price DECIMAL(10,2) NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crowdsourced Prices Table (aggregated price data from all users)
CREATE TABLE IF NOT EXISTS crowdsourced_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  avg_price DECIMAL(10,2) NOT NULL,
  min_price DECIMAL(10,2) NOT NULL,
  max_price DECIMAL(10,2) NOT NULL,
  report_count INTEGER DEFAULT 1,
  last_reported TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(service_name, billing_cycle)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_price_history_user_id ON price_history(user_id);
CREATE INDEX IF NOT EXISTS idx_price_history_subscription_id ON price_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_price_history_changed_at ON price_history(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_crowdsourced_prices_service ON crowdsourced_prices(service_name);

-- Row Level Security for price_history (users can only see their own)
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own price history"
  ON price_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own price history"
  ON price_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Row Level Security for crowdsourced_prices (everyone can read, service role can write)
ALTER TABLE crowdsourced_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view crowdsourced prices"
  ON crowdsourced_prices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert crowdsourced prices"
  ON crowdsourced_prices FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update crowdsourced prices"
  ON crowdsourced_prices FOR UPDATE
  TO service_role
  USING (true);
