DROP TABLE IF EXISTS supermarket_data;
DROP TABLE IF EXISTS food_categories;

-- Create food categories table
CREATE TABLE IF NOT EXISTS food_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS supermarket_data (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    date_added TEXT NOT NULL,
    expiration_date TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    in_stock BOOLEAN NOT NULL,
    category_id INTEGER REFERENCES food_categories(id),
    ean_gsOne_country_code TEXT NOT NULL,
    ean_manufacturer_code INTEGER NOT NULL,
    ean_product_code INTEGER NOT NULL,
    ean_check_digit INTEGER NOT NULL
);

-- Clear existing data and reset sequences
DELETE FROM supermarket_data;
DELETE FROM food_categories;
ALTER SEQUENCE supermarket_data_id_seq RESTART WITH 1;
ALTER SEQUENCE food_categories_id_seq RESTART WITH 1;

-- Insert food categories
INSERT INTO food_categories (name, thumbnail_url, description) VALUES
('Beef', 'https://www.themealdb.com/images/category/beef.png', 'Beef is the culinary name for meat from cattle, particularly skeletal muscle. Humans have been eating beef since prehistoric times.[1] Beef is a source of high-quality protein and essential nutrients.[2]'),
('Chicken', 'https://www.themealdb.com/images/category/chicken.png', 'Chicken is a type of domesticated fowl, a subspecies of the red junglefowl. It is one of the most common and widespread domestic animals, with a total population of more than 19 billion as of 2011.[1] Humans commonly keep chickens as a source of food (consuming both their meat and eggs) and, more rarely, as pets.'),
('Dairy', 'https://www.themealdb.com/images/category/dairy.png', 'Dairy products or milk products are a type of food produced from or containing the milk of mammals. They are primarily produced from milk, including that of cows, buffalo, goats, sheep, and camels.'),
('Bakery', 'https://www.themealdb.com/images/category/bakery.png', 'Baked goods, particularly bread and pastries.'),
('Beverages', 'https://www.themealdb.com/images/category/beverages.png', 'Drinks and liquid refreshments.'),
('Pantry', 'https://www.themealdb.com/images/category/pantry.png', 'Shelf-stable food items and cooking ingredients.'),
('Snacks', 'https://www.themealdb.com/images/category/snacks.png', 'Light meals and packaged treats.'),
('Produce', 'https://www.themealdb.com/images/category/produce.png', 'Fresh fruits and vegetables.');

-- Insert supermarket data with category relationships
INSERT INTO supermarket_data (
    name, 
    price, 
    date_added, 
    expiration_date, 
    quantity, 
    in_stock,
    category_id,
    ean_gsOne_country_code,
    ean_manufacturer_code,
    ean_product_code,
    ean_check_digit
) VALUES
-- Dairy Products
('Arla Milk 1L', 9.95, '2024-03-15', '2024-03-22', 50, true, (SELECT id FROM food_categories WHERE name = 'Dairy'), '570-579', 570, 1234, 8),
('Lurpak Butter 250g', 24.95, '2024-03-15', '2024-03-30', 30, true, (SELECT id FROM food_categories WHERE name = 'Dairy'), '570-579', 570, 2345, 5),
('Castello Blue Cheese 150g', 39.95, '2024-03-15', '2024-04-01', 40, true, (SELECT id FROM food_categories WHERE name = 'Dairy'), '570-579', 570, 3456, 2),

-- Bread and Bakery
('Schulstad Whole Grain', 24.95, '2024-03-15', '2024-03-19', 30, true, (SELECT id FROM food_categories WHERE name = 'Bakery'), '570-579', 571, 1111, 3),
('Kohberg Rye Bread', 19.95, '2024-03-15', '2024-03-20', 25, true, (SELECT id FROM food_categories WHERE name = 'Bakery'), '570-579', 571, 2222, 4),

-- Beverages
('Carlsberg Pilsner 6pk', 54.95, '2024-03-15', '2024-09-15', 25, true, (SELECT id FROM food_categories WHERE name = 'Beverages'), '570-579', 572, 3333, 5),
('Coca Cola 1.5L', 22.95, '2024-03-15', '2024-06-15', 35, true, (SELECT id FROM food_categories WHERE name = 'Beverages'), '570-579', 572, 4444, 6),

-- Meat and Poultry
('Danish Crown Pork Chops 500g', 45.95, '2024-03-15', '2024-03-18', 20, true, (SELECT id FROM food_categories WHERE name = 'Beef'), '570-579', 573, 5555, 7),
('Rose Chicken Breast 400g', 39.95, '2024-03-15', '2024-03-19', 15, true, (SELECT id FROM food_categories WHERE name = 'Chicken'), '570-579', 573, 6666, 8),

-- Pantry Items
('Beauvais Tomato Sauce 500g', 14.95, '2024-03-15', '2024-06-30', 60, true, (SELECT id FROM food_categories WHERE name = 'Pantry'), '570-579', 574, 7777, 9),
('Urtekram Organic Rice 1kg', 29.95, '2024-03-15', '2024-12-31', 65, true, (SELECT id FROM food_categories WHERE name = 'Pantry'), '570-579', 574, 8888, 1),

-- Snacks
('KiMs Chips 175g', 19.95, '2024-03-15', '2024-05-30', 80, true, (SELECT id FROM food_categories WHERE name = 'Snacks'), '570-579', 575, 9999, 2),
('Marabou Milk Chocolate 200g', 25.95, '2024-03-15', '2024-06-30', 100, true, (SELECT id FROM food_categories WHERE name = 'Snacks'), '570-579', 575, 1122, 3),

-- Out of Stock Items
('Nescafe Gold Coffee 200g', 89.95, '2024-03-15', '2024-09-15', 0, false, (SELECT id FROM food_categories WHERE name = 'Pantry'), '570-579', 576, 2233, 4),
('Heinz Ketchup 500ml', 29.95, '2024-03-15', '2024-12-31', 0, false, (SELECT id FROM food_categories WHERE name = 'Pantry'), '570-579', 576, 3344, 5),

-- Items Close to Expiration
('Discounted Yogurt 500g', 10.95, '2024-03-15', '2024-03-17', 5, true, (SELECT id FROM food_categories WHERE name = 'Dairy'), '570-579', 577, 4455, 6),
('Ripe Bananas 1kg', 9.95, '2024-03-15', '2024-03-17', 8, true, (SELECT id FROM food_categories WHERE name = 'Produce'), '570-579', 577, 5566, 7);
