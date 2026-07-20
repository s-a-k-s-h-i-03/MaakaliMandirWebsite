DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_donations_head') THEN
    ALTER TABLE donations
      ADD CONSTRAINT fk_donations_head
      FOREIGN KEY (head_id) REFERENCES donation_heads(id)
      ON DELETE RESTRICT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_payment_logs_donation') THEN
    ALTER TABLE payment_logs
      ADD CONSTRAINT fk_payment_logs_donation
      FOREIGN KEY (donation_id) REFERENCES donations(id)
      ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_donation_heads_status') THEN
    ALTER TABLE donation_heads
      ADD CONSTRAINT chk_donation_heads_status
      CHECK (status IN ('Active', 'Inactive'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_donations_payment_status') THEN
    ALTER TABLE donations
      ADD CONSTRAINT chk_donations_payment_status
      CHECK (payment_status IN ('Pending', 'Success', 'Failed', 'Cancelled'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_gallery_category') THEN
    ALTER TABLE gallery
      ADD CONSTRAINT chk_gallery_category
      CHECK (category IN ('Temple', 'Festival', 'Navratri', 'Puja', 'Events', 'Construction', 'Other'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_gallery_status') THEN
    ALTER TABLE gallery
      ADD CONSTRAINT chk_gallery_status
      CHECK (status IN ('Active', 'Inactive'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_services_status') THEN
    ALTER TABLE services
      ADD CONSTRAINT chk_services_status
      CHECK (status IN ('Active', 'Inactive'));
  END IF;
END $$;
