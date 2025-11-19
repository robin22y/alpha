-- Create income_ideas table
CREATE TABLE IF NOT EXISTS income_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('fast', 'local', 'digital', 'weekend', 'resell', 'sell', 'weekly', 'rent', 'home', 'teach', 'transport', 'homebiz')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'moderate')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_income_ideas_category ON income_ideas(category);
CREATE INDEX IF NOT EXISTS idx_income_ideas_active ON income_ideas(is_active);

-- Enable RLS
ALTER TABLE income_ideas ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active ideas
CREATE POLICY "Anyone can read active income ideas"
  ON income_ideas
  FOR SELECT
  USING (is_active = true);

-- Policy: Admins can read all ideas
CREATE POLICY "Admins can read all income ideas"
  ON income_ideas
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

-- Policy: Admins can insert
CREATE POLICY "Admins can insert income ideas"
  ON income_ideas
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

-- Policy: Admins can update
CREATE POLICY "Admins can update income ideas"
  ON income_ideas
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

-- Policy: Admins can delete
CREATE POLICY "Admins can delete income ideas"
  ON income_ideas
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

-- Insert sample ideas (50 ideas)
INSERT INTO income_ideas (title, description, category, difficulty) VALUES
-- Fast category
('Sell unused items online', 'List clothes, electronics, or furniture on Facebook Marketplace or Vinted', 'fast', 'easy'),
('Offer pet sitting', 'Look after pets for neighbors or friends when they travel', 'fast', 'easy'),
('Babysit evenings/weekends', 'Provide childcare for local families', 'fast', 'easy'),
('Do odd jobs on TaskRabbit', 'Complete small tasks like furniture assembly or moving help', 'fast', 'easy'),
('Sell homemade baked goods', 'Make and sell cakes, cookies, or bread to neighbors', 'fast', 'easy'),
('Offer car washing service', 'Wash cars for neighbors or local businesses', 'fast', 'easy'),
('Tutor students online', 'Help students with homework or exam prep via video calls', 'fast', 'moderate'),
('Rent out parking space', 'If you have unused parking, rent it to commuters', 'fast', 'easy'),

-- Local Jobs category
('Part-time retail work', 'Evening or weekend shifts at local shops', 'local', 'easy'),
('Delivery driver', 'Work for local restaurants or delivery services', 'local', 'easy'),
('Clean houses or offices', 'Regular cleaning jobs for local clients', 'local', 'easy'),
('Gardening and landscaping', 'Help neighbors with garden maintenance', 'local', 'moderate'),
('Handyman services', 'Fix things around the house for others', 'local', 'moderate'),
('Bar work', 'Evening shifts at local pubs or restaurants', 'local', 'easy'),
('Warehouse work', 'Part-time shifts at local warehouses', 'local', 'easy'),
('Care assistant', 'Support elderly or disabled people in your area', 'local', 'moderate'),
('Kitchen porter', 'Evening kitchen work at restaurants', 'local', 'easy'),
('Security guard', 'Night or weekend security shifts', 'local', 'moderate'),
('Event staff', 'Work at local events, concerts, or festivals', 'local', 'easy'),

-- Digital category
('Freelance writing', 'Write articles, blog posts, or copy for businesses', 'digital', 'moderate'),
('Virtual assistant', 'Help businesses with admin tasks remotely', 'digital', 'moderate'),
('Online tutoring', 'Teach subjects you know well via video calls', 'digital', 'moderate'),
('Data entry', 'Complete data entry tasks for companies', 'digital', 'easy'),
('Graphic design', 'Create logos, social media graphics, or designs', 'digital', 'moderate'),
('Social media management', 'Manage social accounts for small businesses', 'digital', 'moderate'),
('Website testing', 'Test websites and apps for usability issues', 'digital', 'easy'),
('Transcription work', 'Convert audio or video to text', 'digital', 'easy'),
('Online surveys', 'Complete surveys for market research companies', 'digital', 'easy'),
('Sell digital products', 'Create and sell templates, guides, or printables', 'digital', 'moderate'),
('Video editing', 'Edit videos for YouTubers or businesses', 'digital', 'moderate'),
('Translation services', 'Translate documents if you speak multiple languages', 'digital', 'moderate'),

-- Weekend category
('Market stall', 'Sell items at weekend markets or car boot sales', 'weekend', 'easy'),
('Weekend catering', 'Help at events or parties on weekends', 'weekend', 'moderate'),
('Photography services', 'Take photos at events, parties, or for families', 'weekend', 'moderate'),
('DJ or music services', 'Provide music for parties or small events', 'weekend', 'moderate'),
('Face painting', 'Offer face painting at children''s parties or events', 'weekend', 'easy'),
('Hair styling', 'Cut or style hair for friends, family, or events', 'weekend', 'moderate'),
('Craft workshops', 'Run small craft classes or workshops', 'weekend', 'moderate'),
('Weekend cleaning', 'Deep clean houses or offices on weekends', 'weekend', 'easy'),
('Moving help', 'Help people move house on weekends', 'weekend', 'easy'),
('Event decoration', 'Help decorate for parties or events', 'weekend', 'easy'),

-- Resell category
('Buy and sell on eBay', 'Find items at charity shops and resell online', 'resell', 'easy'),
('Thrift store flipping', 'Buy items from charity shops and resell for profit', 'resell', 'easy'),
('Sell vintage clothing', 'Source and sell vintage or designer clothes', 'resell', 'moderate'),
('Resell electronics', 'Buy refurbished tech and resell', 'resell', 'moderate'),
('Sell collectibles', 'Find and sell collectible items online', 'resell', 'moderate'),
('Book reselling', 'Buy books cheaply and resell online', 'resell', 'easy'),
('Sell handmade crafts', 'Create and sell crafts on Etsy or at markets', 'resell', 'moderate'),
('Resell furniture', 'Refurbish and resell furniture from auctions', 'resell', 'moderate'),
('Sell gift cards', 'Resell unwanted gift cards at a discount', 'resell', 'easy'),
('Resell designer items', 'Source authentic designer items and resell', 'resell', 'moderate');

