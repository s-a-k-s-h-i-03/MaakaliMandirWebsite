CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  short_description VARCHAR(500) NOT NULL,
  image VARCHAR(500) DEFAULT '',
  icon VARCHAR(100) DEFAULT '',
  display_order INT NOT NULL DEFAULT 0,
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO services (title, slug, description, short_description, image, icon, display_order, status)
SELECT * FROM (
  SELECT
    'Rudra Abhishek',
    'rudra-abhishek',
    'Sacred Rudra Abhishek seva performed with Vedic chanting and temple rituals for spiritual peace and blessings.',
    'Traditional Rudra Abhishek seva with temple rituals.',
    '/assets/images/rudraabhisek.jpg',
    'Om',
    1,
    'Active'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'rudra-abhishek');

INSERT INTO services (title, slug, description, short_description, image, icon, display_order, status)
SELECT * FROM (
  SELECT
    'Bhagwat Puran Katha',
    'bhagwat-puran-katha',
    'Temple-organized Bhagwat Puran recitation and devotional discourse for families and community gatherings.',
    'Devotional Bhagwat Puran recitation and discourse.',
    '/assets/images/bhagwatpuran.jpg',
    'Katha',
    2,
    'Active'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'bhagwat-puran-katha');

INSERT INTO services (title, slug, description, short_description, image, icon, display_order, status)
SELECT * FROM (
  SELECT
    'Deepdaan',
    'deepdaan',
    'Offerings of sacred lamps with temple guidance during special devotional occasions and festival gatherings.',
    'Sacred lamp offering seva during devotional occasions.',
    '/assets/images/deepdaan.jpg',
    'Deep',
    3,
    'Active'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'deepdaan');
