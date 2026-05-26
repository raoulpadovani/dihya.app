DROP DATABASE IF EXISTS dihya_app;
CREATE DATABASE dihya_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dihya_app;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  phone VARCHAR(30) NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'client') NOT NULL DEFAULT 'client',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE restaurant (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  address VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(180) NOT NULL,
  hero_image VARCHAR(255) NOT NULL,
  daily_menu_title VARCHAR(120) NOT NULL,
  daily_menu_description TEXT NOT NULL,
  opening_hours_json JSON NOT NULL,
  status_override ENUM('open', 'closed') NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  slug VARCHAR(80) NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE dishes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_dishes_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE daily_menus (
  id INT AUTO_INCREMENT PRIMARY KEY,
  menu_date DATE NOT NULL UNIQUE,
  title VARCHAR(120) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE daily_menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  daily_menu_id INT NOT NULL,
  dish_id INT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_daily_menu_items_menu FOREIGN KEY (daily_menu_id) REFERENCES daily_menus(id) ON DELETE CASCADE,
  CONSTRAINT fk_daily_menu_items_dish FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE
);

CREATE TABLE reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  guest_count INT NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
  notes TEXT NULL,
  customer_name VARCHAR(160) NOT NULL,
  customer_email VARCHAR(180) NOT NULL,
  customer_phone VARCHAR(30) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reservation_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE catering_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  slug VARCHAR(80) NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE catering_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  price_per_person DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_catering_items_category FOREIGN KEY (category_id) REFERENCES catering_categories(id) ON DELETE CASCADE
);

CREATE TABLE catering_quotes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME NULL,
  guest_count INT NOT NULL,
  event_type VARCHAR(120) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  notes TEXT NULL,
  status ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_quotes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE catering_quote_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quote_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_quote_items_quote FOREIGN KEY (quote_id) REFERENCES catering_quotes(id) ON DELETE CASCADE,
  CONSTRAINT fk_quote_items_item FOREIGN KEY (item_id) REFERENCES catering_items(id) ON DELETE CASCADE
);

INSERT INTO restaurant (
  name,
  description,
  address,
  phone,
  email,
  hero_image,
  daily_menu_title,
  daily_menu_description,
  opening_hours_json,
  status_override
) VALUES (
  'Dihya',
  'Modern Moroccan restaurant blending family recipes, premium produce and a warm delivery-first experience.',
  '15 Rue des Saveurs, Marseille',
  '+33 4 91 00 00 00',
  'contact@dihya.fr',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  'Chef''s daily selection',
  'Fresh tajines, vibrant mezzes and pastry crafted every morning by the Dihya kitchen.',
  JSON_OBJECT(
    'monday', JSON_OBJECT('open', '12:00', 'close', '22:00'),
    'tuesday', JSON_OBJECT('open', '12:00', 'close', '22:00'),
    'wednesday', JSON_OBJECT('open', '12:00', 'close', '22:00'),
    'thursday', JSON_OBJECT('open', '12:00', 'close', '22:30'),
    'friday', JSON_OBJECT('open', '12:00', 'close', '23:00'),
    'saturday', JSON_OBJECT('open', '12:00', 'close', '23:00'),
    'sunday', JSON_OBJECT('open', '12:00', 'close', '21:30')
  ),
  NULL
);

INSERT INTO categories (name, slug, sort_order) VALUES
  ('Entrees', 'entrees', 1),
  ('Plats', 'plats', 2),
  ('Desserts', 'desserts', 3);

INSERT INTO dishes (category_id, name, description, price, image_url, is_available, is_featured) VALUES
  (1, 'Briouates au fromage', 'Crispy filo pastries, herbs and soft cheese.', 8.50, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', 1, 1),
  (1, 'Zaalouk aubergine', 'Smoked eggplant, tomato confit and olive oil.', 7.00, 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80', 1, 0),
  (1, 'Brik aux oeufs', 'Crispy pastry with eggs, onions and herbs.', 6.50, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', 1, 1),
  (1, 'Salade verte', 'Fresh greens with lemon and olive oil dressing.', 5.00, 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80', 1, 0),
  (2, 'Tajine de poulet', 'Chicken, preserved lemon, olives and saffron jus.', 18.00, 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=800&q=80', 1, 1),
  (2, 'Couscous royal', 'Lamb, merguez, chicken and slow cooked vegetables.', 22.00, 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80', 1, 1),
  (2, 'Pastilla au poulet', 'Sweet and savory pie with almonds and cinnamon.', 17.50, 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=800&q=80', 1, 0),
  (2, 'Tajine agneau', 'Lamb with apricots, almonds and spiced jus.', 20.00, 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=800&q=80', 1, 1),
  (2, 'Kefta merguez', 'Spiced meatballs with tomato and pepper sauce.', 16.00, 'https://images.unsplash.com/photo-1529193591184-fdf60bb6b881?auto=format&fit=crop&w=800&q=80', 1, 0),
  (3, 'Cornes de gazelle', 'Orange blossom shortbread filled with almond paste.', 6.50, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80', 1, 1),
  (3, 'Msemen caramel', 'Layered crepe, caramel butter and vanilla cream.', 7.50, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80', 1, 0),
  (3, 'Baklava miel', 'Phyllo, pistachios and honey drizzle.', 6.00, 'https://images.unsplash.com/photo-1599599810694-d3379baaaf4e?auto=format&fit=crop&w=800&q=80', 1, 1);

INSERT INTO catering_categories (name, slug, sort_order) VALUES
  ('Entrees', 'entrees', 1),
  ('Plats', 'plats', 2),
  ('Desserts', 'desserts', 3);

INSERT INTO catering_items (category_id, name, description, price_per_person, image_url, is_available) VALUES
  (1, 'Mezze signature', 'Selection of hummus, zaalouk and marinated vegetables.', 9.00, 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80', 1),
  (1, 'Briouat mixte', 'Cheese, vegetables and meat filled pastries.', 10.50, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', 1),
  (1, 'Salade marocaine', 'Tomatoes, cucumbers, onions and chermoula sauce.', 7.50, 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80', 1),
  (2, 'Buffet tajine', 'Large format tajine station with seasonal garnishes.', 19.50, 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=800&q=80', 1),
  (2, 'Couscous celebration', 'Shared couscous platters with premium meats.', 21.00, 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80', 1),
  (2, 'Pastilla station', 'Sweet and savory pies, served family style.', 18.00, 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=800&q=80', 1),
  (2, 'Kefta merguez buffet', 'Spiced meatballs with fresh herbs and sauces.', 16.50, 'https://images.unsplash.com/photo-1529193591184-fdf60bb6b881?auto=format&fit=crop&w=800&q=80', 1),
  (2, 'Poulet roti', 'Slow roasted chicken with lemon and garlic.', 15.00, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80', 1),
  (3, 'Moroccan pastry table', 'Mini pastries, gazelle horns and fruit bites.', 8.00, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80', 1),
  (3, 'Baklava et fruits', 'Assorted baklava with fresh fruit selection.', 9.50, 'https://images.unsplash.com/photo-1599599810694-d3379baaaf4e?auto=format&fit=crop&w=800&q=80', 1),
  (3, 'Crepes sucrees', 'Msemen, crepes with honey and almond butter.', 10.00, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80', 1),
  (3, 'Fruit frais', 'Seasonal fresh fruit platters.', 6.00, 'https://images.unsplash.com/photo-1585681033121-04a18214a51c?auto=format&fit=crop&w=800&q=80', 1);
