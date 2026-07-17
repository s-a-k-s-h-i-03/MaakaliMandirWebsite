CREATE TABLE IF NOT EXISTS donation_heads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  minimum_amount DECIMAL(10, 2) NOT NULL DEFAULT 50,
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  receipt_no VARCHAR(100) NOT NULL,
  order_id VARCHAR(100) NOT NULL,
  transaction_id VARCHAR(150) NULL,
  donor_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  address TEXT NOT NULL,
  head_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_status ENUM('Pending', 'Success', 'Failed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  gateway VARCHAR(100) NOT NULL DEFAULT 'mock',
  gateway_response JSON NULL,
  message TEXT NULL,
  receipt_path VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_donations_head FOREIGN KEY (head_id) REFERENCES donation_heads(id)
);

CREATE TABLE IF NOT EXISTS payment_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donation_id INT NOT NULL,
  event VARCHAR(100) NOT NULL,
  payload JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payment_logs_donation FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE
);

INSERT INTO donation_heads (name, description, minimum_amount, status)
SELECT * FROM (
  SELECT 'Temple Donation', 'General support for the temple', 101, 'Active'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM donation_heads WHERE name = 'Temple Donation');

INSERT INTO donation_heads (name, description, minimum_amount, status)
SELECT * FROM (
  SELECT 'Annadanam', 'Food donation and prasadam support', 151, 'Active'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM donation_heads WHERE name = 'Annadanam');

INSERT INTO donation_heads (name, description, minimum_amount, status)
SELECT * FROM (
  SELECT 'Gaushala Donation', 'Support for cows and gaushala services', 151, 'Active'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM donation_heads WHERE name = 'Gaushala Donation');

INSERT INTO donation_heads (name, description, minimum_amount, status)
SELECT * FROM (
  SELECT 'Navratri Donation', 'Festival-specific devotional offering', 101, 'Active'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM donation_heads WHERE name = 'Navratri Donation');
