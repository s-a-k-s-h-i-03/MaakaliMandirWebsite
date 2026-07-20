INSERT INTO donation_heads (name, description, minimum_amount, status)
SELECT 'Temple Donation', 'General support for the temple', 101, 'Active'
WHERE NOT EXISTS (SELECT 1 FROM donation_heads WHERE name = 'Temple Donation');

INSERT INTO donation_heads (name, description, minimum_amount, status)
SELECT 'Annadanam', 'Food donation and prasadam support', 151, 'Active'
WHERE NOT EXISTS (SELECT 1 FROM donation_heads WHERE name = 'Annadanam');

INSERT INTO donation_heads (name, description, minimum_amount, status)
SELECT 'Gaushala Donation', 'Support for cows and gaushala services', 151, 'Active'
WHERE NOT EXISTS (SELECT 1 FROM donation_heads WHERE name = 'Gaushala Donation');

INSERT INTO donation_heads (name, description, minimum_amount, status)
SELECT 'Navratri Donation', 'Festival-specific devotional offering', 101, 'Active'
WHERE NOT EXISTS (SELECT 1 FROM donation_heads WHERE name = 'Navratri Donation');

INSERT INTO services (title, slug, description, short_description, image, icon, display_order, status)
SELECT
  'Rudra Abhishek',
  'rudra-abhishek',
  'Sacred Rudra Abhishek seva performed with Vedic chanting and temple rituals for spiritual peace and blessings.',
  'Traditional Rudra Abhishek seva with temple rituals.',
  '/assets/images/rudraabhisek.jpg',
  'Om',
  1,
  'Active'
WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'rudra-abhishek');

INSERT INTO services (title, slug, description, short_description, image, icon, display_order, status)
SELECT
  'Bhagwat Puran Katha',
  'bhagwat-puran-katha',
  'Temple-organized Bhagwat Puran recitation and devotional discourse for families and community gatherings.',
  'Devotional Bhagwat Puran recitation and discourse.',
  '/assets/images/bhagwatpuran.jpg',
  'Katha',
  2,
  'Active'
WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'bhagwat-puran-katha');

INSERT INTO services (title, slug, description, short_description, image, icon, display_order, status)
SELECT
  'Deepdaan',
  'deepdaan',
  'Offerings of sacred lamps with temple guidance during special devotional occasions and festival gatherings.',
  'Sacred lamp offering seva during devotional occasions.',
  '/assets/images/deepdaan.jpg',
  'Deep',
  3,
  'Active'
WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'deepdaan');

INSERT INTO gallery (title, description, image, category, display_order, featured, status)
SELECT
  'Temple Darshan',
  'Main temple view for devotees visiting the temple gallery.',
  '/assets/images/photogalery/1a029cfa-e814-476e-8e60-d257c533d53e.jpg',
  'Temple',
  1,
  TRUE,
  'Active'
WHERE NOT EXISTS (SELECT 1 FROM gallery WHERE title = 'Temple Darshan');

INSERT INTO gallery (title, description, image, category, display_order, featured, status)
SELECT
  'Navratri Celebration',
  'Moments from temple Navratri celebrations and devotional gatherings.',
  '/assets/images/photogalery/IMG-20221003-WA0030.jpg',
  'Navratri',
  2,
  TRUE,
  'Active'
WHERE NOT EXISTS (SELECT 1 FROM gallery WHERE title = 'Navratri Celebration');

INSERT INTO gallery (title, description, image, category, display_order, featured, status)
SELECT
  'Festival Gathering',
  'A featured festival moment preserved from the temple photo collection.',
  '/assets/images/photogalery/IMG20221004151412.jpg',
  'Festival',
  3,
  FALSE,
  'Active'
WHERE NOT EXISTS (SELECT 1 FROM gallery WHERE title = 'Festival Gathering');
