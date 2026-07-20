CREATE TABLE IF NOT EXISTS gallery (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image VARCHAR(500) NOT NULL,
  category ENUM('Temple', 'Festival', 'Navratri', 'Puja', 'Events', 'Construction', 'Other') NOT NULL DEFAULT 'Other',
  display_order INT NOT NULL DEFAULT 0,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO gallery (title, description, image, category, display_order, featured, status)
SELECT
  'Temple Darshan',
  'Main temple view for devotees visiting the temple gallery.',
  '/assets/images/photogalery/1a029cfa-e814-476e-8e60-d257c533d53e.jpg',
  'Temple',
  1,
  1,
  'Active'
WHERE NOT EXISTS (SELECT 1 FROM gallery WHERE title = 'Temple Darshan');

INSERT INTO gallery (title, description, image, category, display_order, featured, status)
SELECT
  'Navratri Celebration',
  'Moments from temple Navratri celebrations and devotional gatherings.',
  '/assets/images/photogalery/IMG-20221003-WA0030.jpg',
  'Navratri',
  2,
  1,
  'Active'
WHERE NOT EXISTS (SELECT 1 FROM gallery WHERE title = 'Navratri Celebration');

INSERT INTO gallery (title, description, image, category, display_order, featured, status)
SELECT
  'Festival Gathering',
  'A featured festival moment preserved from the temple photo collection.',
  '/assets/images/photogalery/IMG20221004151412.jpg',
  'Festival',
  3,
  0,
  'Active'
WHERE NOT EXISTS (SELECT 1 FROM gallery WHERE title = 'Festival Gathering');
