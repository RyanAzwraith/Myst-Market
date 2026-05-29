

BEGIN TRANSACTION;

-- =========================
-- USER
-- =========================
INSERT INTO user (id, name, email, password_hash, is_admin, created_at, deleted_at) VALUES
(1, 'Ryan Azwraith', 'ryan@example.com', 'hash_1', 1, '2026-01-10', NULL),
(2, 'Mia Chen', 'mia@example.com', 'hash_2', 0, '2026-01-11', NULL),
(3, 'Liam Walker', 'liam@example.com', 'hash_3', 0, '2026-01-12', NULL);

-- =========================
-- CATEGORY
-- =========================
INSERT INTO catagory (id, name) VALUES
(1, 'Weapons'),
(2, 'Artifacts'),
(3, 'Consumables');

-- =========================
-- RARITY
-- =========================
INSERT INTO rarity (id, name) VALUES
(1, 'Common'),
(2, 'Rare'),
(3, 'Epic'),
(4, 'Legendary');

-- =========================
-- STATUS
-- =========================
INSERT INTO status (id, name) VALUES
(1, 'Pending'),
(2, 'Processing'),
(3, 'Shipped'),
(4, 'Delivered');

-- =========================
-- PRODUCT
-- =========================
INSERT INTO product (id, name, description, rarity_id, catagory_id, price_aud_cent, created_at, discontinued_at, slug) VALUES
(1, 'Void Blade', 'A sword forged in dark matter', 4, 1, 19999, '2026-01-10', NULL, 'void-blade'),
(2, 'Iron Dagger', 'Basic starter weapon', 1, 1, 999, '2026-01-10', NULL, 'iron-dagger'),
(3, 'Phoenix Feather', 'Revives once on death', 3, 2, 14999, '2026-01-10', NULL, 'phoenix-feather'),
(4, 'Health Potion', 'Restores HP', 1, 3, 499, '2026-01-10', NULL, 'health-potion');

-- =========================
-- STOCK (1–1)
-- =========================
INSERT INTO stock (product_id, current, updated_at) VALUES
(1, 5, '2026-05-01'),
(2, 200, '2026-05-01'),
(3, 12, '2026-05-01'),
(4, 500, '2026-05-01');

-- =========================
-- ADDRESS
-- =========================
INSERT INTO address (id, country_code, state, city, street, postcode, user_id) VALUES
(1, 'AU', 'NSW', 'Sydney', '12 Hunter St', 2000, 1),
(2, 'AU', 'VIC', 'Melbourne', '88 Collins St', 3000, 2),
(3, 'AU', 'QLD', 'Brisbane', '55 Queen St', 4000, 3);

-- =========================
-- ORDER (quoted because reserved word)
-- =========================
INSERT INTO "order" (id, user_id, created_at, status_id, sent_at, address_id, delivery_note, updated_at, cost_aud_cent) VALUES
(1, 1, '2026-05-20', 4, '2026-05-21', 1, 'Leave at door', '2026-05-21', 20998),
(2, 2, '2026-05-21', 2, NULL, 2, 'Ring bell', '2026-05-21', 999);

-- =========================
-- ORDER PRODUCT
-- =========================
INSERT INTO order_product (order_id, product_id, quantity, unit_price_aud_cent) VALUES
(1, 1, 1, 19999),
(1, 4, 2, 499),
(2, 2, 1, 999);

-- =========================
-- PAYMENT
-- =========================
INSERT INTO payment (id, amount_cent, status, reference, provider, created_at, account_name, currency_code, amount_aud_cent, order_id, user_id, updated_at) VALUES
(1, 20998, 'paid', 'PAY_001', 'stripe', '2026-05-20', 'Ryan Wallet', 'AUD', 20998, 1, 1, '2026-05-20'),
(2, 999, 'pending', 'PAY_002', 'stripe', '2026-05-21', 'Mia Wallet', 'AUD', 999, 2, 2, '2026-05-21');

-- =========================
-- REVIEW
-- =========================
INSERT INTO review (id, rating, description, user_id, product_id, created_at) VALUES
(1, 5, 'Insane weapon, feels powerful', 1, 1, '2026-05-22'),
(2, 4, 'Good starter item', 2, 2, '2026-05-22'),
(3, 5, 'Saved me in battle!', 3, 3, '2026-05-22');

-- =========================
-- ARTICLE
-- =========================
INSERT INTO article (id, title, desciption, created_at, slug) VALUES
(1, 'Top 5 Legendary Weapons', 'A guide to rare weapons', '2026-05-10', 'top-5-legendary-weapons'),
(2, 'Beginner Survival Guide', 'How to survive early game', '2026-05-11', 'beginner-survival-guide');

-- =========================
-- ARTICLE PRODUCT
-- =========================
INSERT INTO article_product (article_id, product_id) VALUES
(1, 1),
(1, 3),
(2, 2),
(2, 4);

-- =========================
-- MEDIA
-- =========================
INSERT INTO media (id, type, file_name, alt_text, sort_order, created_at) VALUES
(1, 'image', 'void_blade.png', 'Void Blade image', 1, '2026-05-01'),
(2, 'image', 'iron_dagger.png', 'Iron Dagger image', 1, '2026-05-01'),
(3, 'image', 'phoenix_feather.png', 'Phoenix Feather image', 1, '2026-05-01');

-- =========================
-- MEDIA ENTITY (polymorphic)
-- =========================
INSERT INTO media_entity (media_id, entity_type, entity_id) VALUES
(1, 'product', 1),
(2, 'product', 2),
(3, 'product', 3);

-- =========================
-- SALE
-- =========================
INSERT INTO sale (id, discount_percent, start_at, end_at, name, description) VALUES
(1, 20, '2026-05-01', '2026-05-31', 'summer sale', NULL);

INSERT INTO sale_product (product_id, sale_id) VALUES
(1, 1),
(3, 1);

COMMIT;

